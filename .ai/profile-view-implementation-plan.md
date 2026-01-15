# Plan implementacji widoku Profil i Ustawienia

## 1. Przegląd
Widok `/profile` służy do zarządzania danymi biometrycznymi użytkownika oraz konfiguracji celów dietetycznych. Umożliwia edycję parametrów ciała (wzrost, data urodzenia, płeć) oraz manualne lub automatyczne (wspomagane AI/kalkulatorem TDEE) ustawienie celów makroskładnikowych. Dodatkowo umożliwia konfigurację ustawień aplikacji, takich jak motyw graficzny. Zmiany w celach są zapisywane jako nowe rekordy z datą obowiązywania, co pozwala na zachowanie historii zmian.

## 2. Routing widoku
*   **Ścieżka:** `/profile`
*   **Plik Astro:** `src/pages/profile.astro`
*   **Dostęp:** Wymaga uwierzytelnienia (w MVP mockowany user ID).

## 3. Struktura komponentów

Widok zostanie zbudowany jako strona Astro renderująca główny kontener React (Client-side), aby obsłużyć interaktywne formularze i walidację.

```text
src/pages/profile.astro
└── Layout
    └── ProfileView (React Component, client:load)
        ├── ProfileHeader (Avatar, Imię - statyczne/placeholder)
        ├── Tabs (Shadcn UI)
        │   ├── TabsList
        │   │   ├── TabTrigger ("Dane profilowe")
        │   │   ├── TabTrigger ("Cele dietetyczne")
        │   │   └── TabTrigger ("Ustawienia")
        │   │
        │   ├── TabsContent ("Dane profilowe")
        │   │   └── BioDataForm
        │   │
        │   ├── TabsContent ("Cele dietetyczne")
        │   │   └── DietaryGoalsForm
        │   │       └── TdeeCalculatorDialog (Modal)
        │   │
        │   └── TabsContent ("Ustawienia")
        │       └── SettingsForm
```

## 4. Szczegóły komponentów

### `ProfileView` (`src/components/profile/ProfileView.tsx`)
*   **Opis:** Główny kontener zarządzający stanem danych użytkownika. Pobiera dane z `/api/profile/me` przy montowaniu i dystrybuuje je do formularzy.
*   **Główne elementy:** `Tabs`, `Card` (kontenery dla formularzy), Loading spinners, Toasts (obsługa powiadomień).
*   **Zarządzanie stanem:**
    *   Przechowuje `userProfile` i `currentGoal`.
    *   Funkcja `handleProfileUpdate(newProfile)` - aktualizuje stan lokalny po udanym zapisie formularza BioData.
    *   Funkcja `handleGoalUpdate(newGoal)` - aktualizuje stan po zapisie celów.
*   **Interakcje:** Pobranie danych przy wejściu (useEffect).

### `BioDataForm` (`src/components/profile/BioDataForm.tsx`)
*   **Opis:** Formularz edycji danych niezmiennych/rzadko zmiennych (wzrost, płeć, wiek).
*   **Główne elementy:** `Form` (react-hook-form), `Input` (height), `Select` (gender), `Input type="date"` (birth_date).
*   **Walidacja (Zod):**
    *   `height`: 50-300 (integer).
    *   `gender`: 'male' | 'female'.
    *   `birth_date`: format YYYY-MM-DD, wiek 10-120 lat.
*   **Propsy:**
    *   `initialData`: `ProfileDto`
    *   `onSave`: `(data: UpdateProfileCommand) => Promise<void>`

### `DietaryGoalsForm` (`src/components/profile/DietaryGoalsForm.tsx`)
*   **Opis:** Formularz edycji celów makro. Pozwala na ręczne wpisanie wartości lub skorzystanie z kalkulatora.
*   **Główne elementy:** 5x `Input` (kalorie, białko, tłuszcz, węgle, błonnik), `Button` ("Zapisz zmiany"), `Button` ("Kalkulator zapotrzebowania" - otwiera modal).
*   **Walidacja (Zod):**
    *   `calories_target`: 500-10000.
    *   Pozostałe makro: liczby całkowite nieujemne.
*   **Propsy:**
    *   `initialGoal`: `DietaryGoalDto`
    *   `userProfile`: `ProfileDto` (potrzebne do przekazania do kalkulatora).
    *   `onSave`: `(data: SetDietaryGoalCommand) => Promise<void>`

### `TdeeCalculatorDialog` (`src/components/profile/TdeeCalculatorDialog.tsx`)
*   **Opis:** Modal obliczający TDEE. Ponieważ `Profile` nie zawiera wagi (jest ona w pomiarach), ten modal musi o nią zapytać, aby wykonać obliczenie.
*   **Główne elementy:** `Dialog` (Shadcn), `Select` (Poziom aktywności), `Input` (Aktualna waga - wymagana do obliczeń).
*   **Wartości Select (Activity Level):**
    *   `sedentary` (Siedzący)
    *   `lightly_active` (Lekko aktywny)
    *   `moderately_active` (Umiarkowanie aktywny)
    *   `very_active` (Bardzo aktywny)
    *   `extremely_active` (Ekstremalnie aktywny)
*   **Logika:**
    1.  Pobiera `height`, `gender`, `age` (z `birth_date`) z propsów.
    2.  Użytkownik podaje `weight` i `activity_level`.
    3.  Wysyła request do `/api/ai/calculate-tdee`.
    4.  Po otrzymaniu odpowiedzi (`suggested_targets`), zwraca obiekt `GoalTargets` do rodzica (`DietaryGoalsForm`), który wypełnia pola formularza.
*   **Propsy:**
    *   `profile`: `ProfileDto`
    *   `onApply`: `(targets: GoalTargets) => void` (funkcja wpisująca wyniki do formularza rodzica).

### `SettingsForm` (`src/components/profile/SettingsForm.tsx`)
*   **Opis:** Formularz ustawień aplikacji. Pozwala na zmianę motywu.
*   **Główne elementy:** Sekcja "Wygląd" z opcjami wyboru motywu (RadioGroup lub Select): Jasny, Ciemny, Systemowy.
*   **Logika:**
    *   Wykorzystuje hook `useTheme` do odczytu i zapisu preferencji.
    *   Zmiana opcji natychmiastowo aktualizuje klasę `dark` na elemencie `html` oraz zapisuje ustawienie w `localStorage`.

## 5. Typy

Należy wykorzystać i rozszerzyć typy z `src/types.ts`.

### Modele formularzy (Frontend View Models)

```typescript
// Schemat Zod dla BioDataForm
export const bioDataSchema = z.object({
  height: z.coerce.number().min(50).max(300),
  gender: z.enum(["male", "female"]),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Walidacja wieku w refine
});

// Typ dla formularza BioData
export type BioDataFormValues = z.infer<typeof bioDataSchema>;

// Schemat Zod dla DietaryGoalsForm
export const dietaryGoalsSchema = z.object({
  calories_target: z.coerce.number().min(500).max(10000),
  protein_target: z.coerce.number().min(0),
  fat_target: z.coerce.number().min(0),
  carbs_target: z.coerce.number().min(0),
  fiber_target: z.coerce.number().min(0).optional(),
});

// Typ dla formularza celów
export type DietaryGoalsFormValues = z.infer<typeof dietaryGoalsSchema>;

// Input dla kalkulatora (lokalny stan modala)
export interface CalculatorInputs {
  weight: number;
  activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active";
}

// Typ motywu
export type Theme = "light" | "dark" | "system";
```

## 6. Zarządzanie stanem

Stan będzie zarządzany lokalnie w komponencie `ProfileView` z wykorzystaniem `useState` i `useEffect` do pobrania danych.
Dodatkowo `react-hook-form` będzie zarządzać stanem formularzy (dirty, isSubmitting, errors).

**Custom Hooks:**
*   `useProfileData`: Obsługuje komunikację z `GET /api/profile/me`. Zwraca: `{ profile, currentGoal, isLoading, error, refetch }`.
*   `useTheme`: Obsługuje logikę motywu.
    *   State: `theme` (light | dark | system).
    *   Effect: Nasłuchuje zmian `theme` i aktualizuje klasę `dark` na `document.documentElement` oraz `localStorage`. Dla opcji "system", nasłuchuje `window.matchMedia('(prefers-color-scheme: dark')`.

## 7. Integracja API

1.  **Pobranie danych:**
    *   `GET /api/profile/me`
    *   Mapowanie odpowiedzi na wartości początkowe formularzy (`defaultValues`).

2.  **Aktualizacja profilu:**
    *   `PUT /api/profile`
    *   Body: `UpdateProfileCommand` (z `BioDataFormValues`).
    *   Po sukcesie: Aktualizacja stanu lokalnego `profile`.

3.  **Ustawienie nowych celów:**
    *   `POST /api/goals`
    *   Body: `SetDietaryGoalCommand`.
    *   Pole `start_date` ustawiane automatycznie na bieżącą datę (today) w formacie YYYY-MM-DD.

4.  **Kalkulacja TDEE:**
    *   `POST /api/ai/calculate-tdee`
    *   **Request Body:**
        ```json
        {
          "gender": "male",
          "weight_kg": 80,
          "height_cm": 180,
          "age": 30,
          "activity_level": "moderately_active"
        }
        ```
    *   **Response Body:**
        ```json
        {
          "bmr": 1850,
          "tdee": 2867,
          "suggested_targets": {
            "calories": 2500,
            "protein": 180,
            "fat": 80,
            "carbs": 265,
            "fiber": 35
          }
        }
        ```
    *   Obsługa: Wartości z `suggested_targets` są przekazywane do `DietaryGoalsForm` po zatwierdzeniu przez użytkownika.

## 8. Interakcje użytkownika

1.  **Edycja profilu:**
    *   Użytkownik zmienia wzrost -> klika "Zapisz".
    *   System waliduje -> wysyła PUT -> pokazuje toast "Zapisano zmiany".

2.  **Przeliczenie celów (Kalkulator):**
    *   Użytkownik klika "Kalkulator zapotrzebowania" w zakładce Cele.
    *   Otwiera się Modal.
    *   Pola Wzrost/Wiek są ukryte (pobrane z profilu), użytkownik widzi pole "Waga" (wymagane) i "Aktywność".
    *   Klika "Oblicz".
    *   System zwraca sugestie.
    *   Po zatwierdzeniu modal zamyka się, a formularz Celów wypełnia się nowymi wartościami.
    *   Użytkownik musi kliknąć "Zapisz zmiany" w formularzu Celów, aby je utrwalić.

3.  **Zmiana motywu:**
    *   Użytkownik wybiera opcję (np. "Ciemny") w zakładce Ustawienia.
    *   Aplikacja natychmiast zmienia wygląd.

## 9. Warunki i walidacja

*   **Spójność danych:** Zmiana danych w zakładce Profil (np. Data urodzenia -> Wiek) powinna wpływać na wyniki Kalkulatora w zakładce Cele. Dlatego `ProfileView` musi przekazywać *zaktualizowany* obiekt profilu do `DietaryGoalsForm`.
*   **Format daty:** HTML `input type="date"` zwraca string YYYY-MM-DD, co jest zgodne z API.
*   **Numery:** API oczekuje `integer`. `z.coerce.number()` w Zod obsłuży konwersję stringów z inputów na liczby.

## 10. Obsługa błędów

*   **Błędy walidacji API (400):** Formularze powinny obsłużyć `details` z odpowiedzi API i przypisać błędy do konkretnych pól formularza (`form.setError`).
*   **Błąd pobierania (500/Network):** Wyświetlenie komunikatu błędu w miejscu formularza lub Toast.
*   **Brak profilu:** Jeśli API zwróci 404 (teoretycznie niemożliwe dla `/me`), przekierowanie na stronę logowania/rejestracji.

## 11. Kroki implementacji

1.  **Przygotowanie typów i schematów:** Stworzenie pliku `src/lib/validators/profile.ts` ze schematami Zod dla obu formularzy.
2.  **Implementacja obsługi motywu:**
    *   Stworzenie hooka `useTheme` (`src/hooks/use-theme.tsx`).
    *   Dodanie skryptu inicjalizującego motyw w `src/layouts/Layout.astro` (aby uniknąć flashowania).
3.  **Stworzenie komponentu `BioDataForm`:** UI, podpięcie `react-hook-form`, obsługa submit.
4.  **Stworzenie komponentu `TdeeCalculatorDialog`:** UI modala, logika zapytania do API kalkulacji.
5.  **Stworzenie komponentu `DietaryGoalsForm`:** UI, podpięcie `react-hook-form`, integracja z komponentem Dialogu (przekazywanie `onApply`).
6.  **Stworzenie komponentu `SettingsForm`:** UI wyboru motywu z użyciem `useTheme`.
7.  **Implementacja `ProfileView`:**
    *   Fetch data z `/api/profile/me`.
    *   Obsługa stanów ładowania.
    *   Złożenie całości w Tabs.
    *   Funkcje obsługujące zapis (API calls) i odświeżanie stanu.
8.  **Stworzenie strony Astro:** `src/pages/profile.astro` renderującej `ProfileView`.
9.  **Weryfikacja:** Testy manualne edycji, zapisu, kalkulacji oraz zmiany motywu.
