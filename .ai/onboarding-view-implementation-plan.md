# Plan implementacji widoku Onboarding (Kreator Celów)

## 1. Przegląd
Widok Onboarding (`/onboarding`) jest kluczowym elementem procesu rejestracji, służącym do zebrania danych biometrycznych użytkownika, wyliczenia jego zapotrzebowania kalorycznego (TDEE/BMR) przy użyciu AI/algorytmów, a następnie ustalenia celów dietetycznych. Widok ten ma formę wieloetapowego kreatora (Wizard), który prowadzi użytkownika przez proces konfiguracji konta, kończąc zapisaniem danych profilowych i celów w bazie danych.

## 2. Routing widoku
*   **Ścieżka:** `/onboarding`
*   **Typ:** Strona Astro (`SSR` - Server Side Rendering) z interaktywną wyspą React.
*   **Dostęp:** Widok chroniony, dostępny tylko dla zalogowanych użytkowników, którzy nie mają jeszcze aktywnych celów (weryfikacja w Middleware lub na poziomie strony).

## 3. Struktura komponentów
Strona będzie składać się z głównego kontenera Astro, który ładuje interaktywny komponent React.

*   `pages/onboarding.astro` (Strona główna)
    *   `Layout.astro` (Główny layout aplikacji)
        *   `OnboardingWizard.tsx` (Główny komponent stanowy - React)
            *   `WizardProgress` (Pasek postępu kroków)
            *   `StepBioData` (Krok 1: Formularz danych biometrycznych)
            *   `StepActivity` (Krok 2: Wybór poziomu aktywności)
            *   `StepGoalRefinement` (Krok 3: Prezentacja wyników i edycja makro)
                *   `MacroSplitSlider` (Komponent do regulacji proporcji makroskładników)
                *   `NutrientSummaryCard` (Podsumowanie wyliczonych gramatur)
            *   `WizardNavigation` (Przyciski Wstecz/Dalej/Zakończ)

## 4. Szczegóły komponentów

### `OnboardingWizard.tsx`
*   **Opis:** Komponent orkiestrujący. Przechowuje stan całego formularza, zarządza przejściami między krokami i komunikacją z API.
*   **Główne elementy:** `div` (wrapper), `WizardProgress`, warunkowe renderowanie kroków, `WizardNavigation`.
*   **Obsługiwane interakcje:**
    *   Zmiana kroku (walidacja bieżącego kroku przed przejściem).
    *   Zbieranie danych z kroków podrzędnych.
    *   Wywołanie API kalkulacji TDEE po kroku 2.
    *   Wywołanie API zapisu (Profil + Cele) na końcu kroku 3.
*   **Typy:** `OnboardingFormData` (stan lokalny).

### `StepBioData.tsx`
*   **Opis:** Formularz zbierający podstawowe dane fizyczne.
*   **Główne elementy:**
    *   `RadioGroup` (Płeć: Male/Female).
    *   `Input` (Data urodzenia - type date).
    *   `Input` (Wzrost w cm).
    *   `Input` (Waga w kg - potrzebna do obliczeń, choć API profilu jej nie zapisuje bezpośrednio, użyjemy jej do wyliczenia TDEE).
*   **Obsługiwana walidacja:**
    *   Wzrost: 50-300 cm.
    *   Wiek: 10-120 lat (wyliczany z daty urodzenia).
    *   Waga: > 0 (wymagane do TDEE).
*   **Propsy:** `data: BioData`, `onUpdate: (data: Partial<BioData>) => void`.

### `StepActivity.tsx`
*   **Opis:** Wybór poziomu aktywności fizycznej potrzebnego do wyliczenia współczynnika PAL.
*   **Główne elementy:**
    *   `RadioGroup` lub zestaw kafelków (`Card`) z opisami (np. Siedzący, Lekki, Umiarkowany, Bardzo aktywny).
*   **Obsługiwana walidacja:** Pole wymagane.
*   **Propsy:** `value: ActivityLevel`, `onChange: (val: ActivityLevel) => void`.

### `StepGoalRefinement.tsx`
*   **Opis:** Prezentuje wyliczone TDEE i pozwala użytkownikowi dostosować cel kaloryczny oraz podział makroskładników.
*   **Główne elementy:**
    *   Wyświetlacz BMR i TDEE.
    *   `Input` dla docelowych kalorii (domyślnie TDEE +/- deficyt/nadwyżka).
    *   `MacroSplitSlider` - 3 suwaki (Białko, Tłuszcze, Węglowodany) sumujące się do 100% lub przeliczające gramy.
    *   Podgląd w gramach (B/T/W).
*   **Obsługiwana walidacja:**
    *   Kalorie: 500-10000 kcal.
    *   Makroskładniki: Suma % musi wynosić ~100% (z tolerancją), wartości nieujemne.
*   **Propsy:** `tdeeResult: TDEECalculationResponse`, `goals: GoalTargets`, `onUpdate: (goals: GoalTargets) => void`.

### `MacroSplitSlider.tsx`
*   **Opis:** Zaawansowany komponent UI pozwalający na manipulację proporcjami diety.
*   **Logika:**
    *   Przyjmuje całkowitą pulę kalorii.
    *   Pozwala ustawić procentowy udział makroskładników.
    *   Przelicza procenty na gramy: 1g B = 4kcal, 1g W = 4kcal, 1g T = 9kcal.
*   **Interakcja:** Przesunięcie suwaka aktualizuje stan `StepGoalRefinement`.

## 5. Typy

```typescript
// Typy wewnętrzne widoku (ViewModel)

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface BioData {
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  height: number; // cm
  weight: number; // kg (używane do kalkulacji, opcjonalnie zapisywane jako pierwszy pomiar)
}

export interface OnboardingState {
  step: number;
  bioData: BioData;
  activityLevel: ActivityLevel;
  // Wynik z API kalkulacji
  calculationResult: TDEECalculationResponse | null;
  // Ostatecznie wybrane cele (edytowalne przez usera)
  finalGoals: GoalTargets;
  isSubmitting: boolean;
  error: string | null;
}

// Mapowanie DTO z src/types.ts jest wykorzystywane bezpośrednio przy strzałach do API
```

## 6. Zarządzanie stanem
Stan będzie zarządzany lokalnie w komponencie `OnboardingWizard` przy użyciu hooka `useState` lub `useReducer` (ze względu na złożoność wieloetapową).

*   **Hook `useOnboardingLogic`:**
    *   Metoda `handleNext()`: Waliduje obecny krok i inkrementuje licznik.
    *   Metoda `calculateTDEE()`: Wywoływana przy przejściu z kroku 2 do 3. Wysyła dane do `/api/ai/calculate-tdee`.
    *   Metoda `handleSave()`: Wywoływana na końcu. Orkiestruje sekwencję zapytań API.

## 7. Integracja API

### 1. Kalkulacja TDEE (Pomiędzy krokiem 2 a 3)
*   **Endpoint:** `POST /api/ai/calculate-tdee` (bazując na strukturze plików) lub własna implementacja w utilach, jeśli endpoint nie jest publiczny. *Zgodnie z PRD system ma wyliczać, więc zakładamy strzał do API.*
*   **Request:** `TDEECalculationRequest` (gender, weight, height, age, activity).
*   **Response:** `TDEECalculationResponse` (bmr, tdee, suggested_targets).

### 2. Zapis Danych (Koniec procesu)
Proces zapisu musi być transakcyjny z perspektywy UX (wszystko albo nic), ale technicznie to sekwencja żądań:

1.  **Aktualizacja Profilu:**
    *   **Endpoint:** `PUT /api/profile`
    *   **Body:** `{ height, gender, birth_date }`
2.  **Ustawienie Celu:**
    *   **Endpoint:** `POST /api/goals`
    *   **Body:** `{ start_date: TODAY, calories_target, protein_target, fat_target, carbs_target, fiber_target }`
3.  **Zapis wagi początkowej:**
    *   **Endpoint:** `POST /api/measurements`
    *   **Body:** `{ date: "YYYY-MM-DD", weight: number }` (Waga pobrana z kroku 1, data dzisiejsza).

## 8. Interakcje użytkownika
1.  **Krok 1 (Bio):** Użytkownik wypełnia formularz. Przycisk "Dalej" jest nieaktywny do momentu poprawnej walidacji.
2.  **Krok 2 (Aktywność):** Wybór kafelka. Kliknięcie "Dalej" uruchamia loader (obliczanie TDEE).
3.  **Krok 3 (Cele):** Użytkownik widzi sugerowane wartości. Może przesunąć suwaki (np. zwiększyć białko), co automatycznie przelicza pozostałe kalorie lub ostrzega o przekroczeniu limitu.
4.  **Zapis:** Kliknięcie "Rozpocznij". System zapisuje dane, wyświetla sukces i przekierowuje na Dashboard.

## 9. Warunki i walidacja

### Walidacja Formularza (Zod schemas)
*   **BioDataSchema:**
    *   `birth_date`: Wiek >= 10 lat.
    *   `height`: 50-300 cm.
    *   `weight`: > 10 kg (dla rozsądku).
*   **GoalSchema:**
    *   `calories`: 500 - 10000.
    *   `protein/fat/carbs`: >= 0.

### Warunki UI
*   Blokada przejścia do następnego kroku, jeśli pola są puste lub zawierają błędy.
*   Ostrzeżenie przed wyjściem ze strony (browser `beforeunload`), jeśli formularz jest częściowo wypełniony ("Unsaved changes").

## 10. Obsługa błędów
*   **Błąd kalkulacji TDEE:** Wyświetlenie toasta z błędem, umożliwienie ręcznego wpisania celów (fallback).
*   **Błąd zapisu profilu/celu:** Wyświetlenie konkretnego komunikatu błędu z API. Zatrzymanie użytkownika na ostatnim kroku, aby mógł spróbować ponownie bez utraty danych.

## 11. Kroki implementacji

1.  **Przygotowanie typów:** Utworzenie `types/onboarding.ts` (jeśli potrzebne dodatkowe poza globalnymi).
2.  **Stworzenie UI komponentów:**
    *   Implementacja `StepBioData` z walidacją.
    *   Implementacja `StepActivity`.
    *   Implementacja `MacroSplitSlider` (logika przeliczania kcal <-> gramy).
3.  **Logika Wizard:** Stworzenie szkieletu `OnboardingWizard` i nawigacji.
4.  **Integracja "Calculate":** Podpięcie endpointu `/api/ai/calculate-tdee` (lub stworzenie funkcji mockującej, jeśli endpoint nie jest gotowy) do przejścia kroku 2->3.
5.  **Integracja "Save":** Implementacja funkcji `submitOnboarding` wywołującej sekwencyjnie `PUT profile`, `POST measurements` (dla wagi) i `POST goals`.
6.  **Składanie całości:** Osadzenie komponentu w `pages/onboarding.astro`.
7.  **Testy manualne:** Przejście ścieżki, weryfikacja poprawności przeliczeń makro i zapisu w bazie (poprzez endpointy).
