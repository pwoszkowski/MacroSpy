# Architektura UI dla MacroSpy

## 1. Przegląd struktury UI

MacroSpy wykorzystuje architekturę hybrydową opartą na **Astro 5 (SSR)** jako szkielecie aplikacji oraz **React 19** dla interaktywnych komponentów ("wysp"). Podejście to zapewnia szybkie ładowanie początkowe (SSR) oraz bogatą interaktywność w kluczowych procesach (dodawanie posiłków, onboarding).

*   **Paradygmat**: Mobile-First, PWA-ready.
*   **Stylizacja**: Tailwind CSS v4 + Shadcn/ui.
*   **Zarządzanie stanem**: Nano Stores (współdzielenie stanu między wyspami a Astro), React Query lub lokalny stan Reacta dla danych tymczasowych (formularze, czat AI).
*   **Layout**: Responsywny – Sticky Bottom Navigation Bar na urządzeniach mobilnych, Top Header Navigation na desktopach.

## 2. Lista widoków

### A. Widoki Publiczne (Auth)

#### 1. Ekran Logowania / Rejestracji
*   **Ścieżka**: `/login`, `/register`
*   **Główny cel**: Uwierzytelnienie użytkownika lub utworzenie nowego konta.
*   **Kluczowe informacje**: Formularze email/hasło, komunikaty błędów walidacji.
*   **Kluczowe komponenty**: `AuthForm`, `SocialLoginButtons` (placeholder pod przyszłe funkcje), linki nawigacyjne.
*   **UX/Bezpieczeństwo**: Jasne komunikaty błędów, walidacja hasła (min. 8 znaków), przekierowanie po sukcesie.

### B. Widoki Chronione (Główne)

#### 2. Onboarding (Kreator Celów)
*   **Ścieżka**: `/onboarding` (Dostępny tylko dla użytkowników bez zdefiniowanych celów).
*   **Główny cel**: Zebranie danych biometrycznych i wyliczenie TDEE/BMR (US-003).
*   **Kluczowe informacje**: Formularz wieloetapowy (Płeć, Wiek, Waga, Wzrost, Aktywność) -> Wynik obliczeń -> Edycja celów.
*   **Kluczowe komponenty**: `MultiStepWizard`, `ActivityLevelSelector`, `MacroSplitSlider` (suwaki proporcji makro).
*   **UX**: Pasek postępu kroków, blokada wyjścia przed ukończeniem, domyślne wartości sugerowane przez AI.

#### 3. Dashboard (Ekran Główny)
*   **Ścieżka**: `/`
*   **Główny cel**: Szybki podgląd postępów dnia i dostęp do dodawania posiłków (US-008).
*   **Kluczowe informacje**: Data, Podsumowanie kalorii/makro (Zjedzone vs Cel), Lista posiłków.
*   **Kluczowe komponenty**:
    *   `DaySelector`: Pasek przewijania dni (tydzień) + kalendarz.
    *   `DailyProgressSummary`: Duże pierścienie lub paski postępu.
    *   `MealList`: Lista kart posiłków z podziałem chronologicznym.
    *   `FloatingActionButton (FAB)`: Główny przycisk "Dodaj posiłek".
*   **UX**: Optimistic UI (natychmiastowa reakcja interfejsu), "Sticky" nagłówek z datą.

#### 4. Historia Posiłków
*   **Ścieżka**: `/history`
*   **Główny cel**: Przeglądanie i edycja przeszłości (US-009).
*   **Kluczowe informacje**: Kalendarz miesięczny z wizualizacją (np. kropki w kolorach zależnych od realizacji celu).
*   **Kluczowe komponenty**: `CalendarView`, `DaySummaryCard` (skrócona wersja dashboardu dla wybranego dnia).
*   **UX**: Łatwe przełączanie miesięcy, szybki podgląd szczegółów dnia po kliknięciu.

#### 5. Pomiary Ciała (Should Have)
*   **Ścieżka**: `/measurements`
*   **Główny cel**: Monitorowanie wagi i składu ciała (US-010).
*   **Kluczowe informacje**: Wykresy trendu (Waga, % tłuszczu), tabela ostatnich pomiarów.
*   **Kluczowe komponenty**: `WeightChart` (Recharts), `MeasurementLogForm` (Modal lub inline).
*   **UX**: Czytelne wykresy, możliwość dodawania pomiarów z datą wsteczną.

#### 6. Profil i Ustawienia
*   **Ścieżka**: `/profile`
*   **Główny cel**: Zarządzanie kontem i celami.
*   **Kluczowe informacje**: Dane użytkownika, Aktualne cele makro, Ustawienia aplikacji (Motyw).
*   **Kluczowe komponenty**: `ProfileEditForm`, `DietaryGoalsForm` (ponowna edycja celów z onboardingu).

### C. Modale i Nakładki (Kluczowe interakcje)

#### 7. Modal Dodawania Posiłku (AI Meal Composer)
*   **Typ**: Pełnoekranowy Modal (Mobile) / Dialog (Desktop).
*   **Ścieżka**: Wywoływany z FAB na Dashboardzie.
*   **Główny cel**: Multimodalne wprowadzenie danych, analiza AI i weryfikacja (US-004, US-005, US-006, US-007).
*   **Stany widoku**:
    1.  **Input**: Pole tekstowe, przycisk mikrofonu, uploader zdjęć.
    2.  **Analyzing**: Szkieletowy ekran ładowania (Skeleton UI) z animacją "AI myśli".
    3.  **Review & Refine**: Formularz ze wstępnie wypełnionymi danymi (Nazwa, Makro) oraz sekcja "Refine" (Czat).
*   **Kluczowe komponenty**:
    *   `InputBar`: Hybryda text input + photo button.
    *   `MacroInputs`: Pola numeryczne do ręcznej korekty.
    *   `RefineChatSheet`: Dolny panel (Bottom Sheet) do wydawania poleceń korekcyjnych dla AI.
*   **UX**: Płynne przejścia między stanami, zapobieganie przypadkowemu zamknięciu (utrata danych), obsługa przycisku "Wstecz".

## 3. Mapa podróży użytkownika

### Główny Scenariusz: Dodawanie posiłku z pomocą AI

1.  **Inicjacja**: Użytkownik klika przycisk `+` (FAB) na Dashboardzie.
2.  **Wprowadzanie**: Otwiera się `AddMealModal`. Użytkownik robi zdjęcie talerza i opcjonalnie dopisuje "Kawa z mlekiem". Klika "Analizuj".
3.  **Przetwarzanie**: UI blokuje interakcję, wyświetla animację ładowania. W tle leci request `POST /api/ai/analyze`.
4.  **Weryfikacja (Review)**:
    *   UI wyświetla rozpoznany posiłek: "Jajecznica z 3 jaj" i wyliczone makro.
    *   Użytkownik zauważa błąd (za dużo masła).
5.  **Korekta (Refine Loop)**:
    *   Użytkownik klika "Coś nie tak?" lub wpisuje w pole czatu: "Mniej masła, tylko 5g".
    *   Wysyłany request `POST /api/ai/refine` z kontekstem.
    *   UI aktualizuje wartości w formularzu na podstawie nowej odpowiedzi.
6.  **Zatwierdzenie**: Użytkownik klika "Zapisz".
7.  **Finalizacja**:
    *   Request `POST /api/meals`.
    *   Modal zamyka się.
    *   Dashboard aktualizuje paski postępu i listę (optimistic update lub re-fetch).

### Scenariusz Awaryjny: Tryb Manualny
Jeśli API AI zwróci błąd lub użytkownik wybierze "Wpisz ręcznie":
1.  Pominięcie kroków analizy.
2.  Wyświetlenie stanu **Review** z pustymi polami.
3.  Użytkownik ręcznie uzupełnia nazwę i kalorie.

## 4. Układ i struktura nawigacji

### Mobile Layout (< 768px)
*   **Top Bar**: Logo + Selektor Daty.
*   **Main Content**: Scrollowalny obszar.
*   **Floating Action Button (FAB)**: Wycentrowany na dole, nad paskiem nawigacji. Sticky, zawsze widoczny.
*   **Bottom Navigation Bar**:
    *   [Home/Dashboard]
    *   [Historia]
    *   (Pusty środek pod FAB)
    *   [Pomiary]
    *   [Profil]

### Desktop Layout (>= 768px)
*   **Top Header**:
    *   Lewa: Logo.
    *   Środek: Linki nawigacyjne (Dashboard, Historia, Pomiary, Profil).
    *   Prawa: Selektor Daty + Przycisk "Dodaj posiłek" (zastępuje FAB).
*   **Main Content**: Wycentrowana kolumna (max-width: ~800px) dla zachowania czytelności, ewentualnie dwukolumnowy układ na Dashboardzie (Lewa: Lista, Prawa: Podsumowanie).

## 5. Kluczowe komponenty

1.  **`MacroProgressRing` / `MacroBar`**: Wizualizacja stopnia realizacji celu. Musi obsługiwać stan "overload" (przekroczenie celu -> zmiana koloru na ostrzegawczy, np. pomarańczowy/czerwony).
2.  **`AIChatSheet` (Komponent React)**: Specjalizowany komponent czatu wewnątrz modala edycji. Zawiera historię krótkiej wymiany zdań z modelem w celu doprecyzowania posiłku.
3.  **`SkeletonLoader`**: Zestaw placeholderów imitujących układ karty posiłku, używany podczas oczekiwania na odpowiedź z `/api/ai/analyze`.
4.  **`ImageUploader`**: Komponent obsługujący Drag&Drop oraz natywne API aparatu. Musi zawierać logikę kompresji obrazu (WebP, resize) po stronie klienta przed wysłaniem do API, aby oszczędzać transfer i przyspieszyć request.
5.  **`InteractiveMealCard`**: Karta na liście posiłków. Obsługuje gesty (np. swipe to delete na mobile - opcjonalne) oraz wyświetla "dymki" z pasywnymi sugestiami AI, jeśli są dostępne w odpowiedzi API.
6.  **`ToastNotification`**: System powiadomień (sukces, błąd, info) zgodny z Shadcn/ui, używany do informowania o statusie operacji asynchronicznych.
