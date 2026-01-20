# Architektura UI dla MacroSpy

## 1. Przegląd struktury UI

MacroSpy wykorzystuje architekturę hybrydową opartą na **Astro 5 (SSR)** jako szkielecie aplikacji oraz **React 19** dla interaktywnych komponentów ("wysp"). Podejście to zapewnia szybkie ładowanie początkowe (SSR) oraz bogatą interaktywność w kluczowych procesach (dodawanie posiłków, onboarding).

- **Paradygmat**: Mobile-First, PWA-ready.
- **Stylizacja**: Tailwind CSS v4 + Shadcn/ui.
- **Zarządzanie stanem**: Nano Stores (współdzielenie stanu między wyspami a Astro), React Query lub lokalny stan Reacta dla danych tymczasowych (formularze, czat AI).
- **Layout**: Responsywny – Sticky Bottom Navigation Bar na urządzeniach mobilnych, Top Header Navigation na desktopach.

## 2. Lista widoków

### A. Widoki Publiczne (Auth)

#### 1. Ekran Logowania / Rejestracji

- **Ścieżka**: `/login`, `/register`
- **Główny cel**: Uwierzytelnienie użytkownika lub utworzenie nowego konta.
- **Kluczowe informacje**: Formularze email/hasło, komunikaty błędów walidacji.
- **Kluczowe komponenty**: `AuthForm`, `SocialLoginButtons` (placeholder pod przyszłe funkcje), linki nawigacyjne.
- **UX/Bezpieczeństwo**: Jasne komunikaty błędów, walidacja hasła (min. 8 znaków), przekierowanie po sukcesie.

### B. Widoki Chronione (Główne)

#### 2. Onboarding (Kreator Celów)

- **Ścieżka**: `/onboarding` (Dostępny tylko dla użytkowników bez zdefiniowanych celów).
- **Główny cel**: Zebranie danych biometrycznych i wyliczenie TDEE/BMR (US-003).
- **Kluczowe informacje**: Formularz wieloetapowy (Płeć, Wiek, Waga, Wzrost, Aktywność) -> Wynik obliczeń -> Edycja celów.
- **Kluczowe komponenty**: `MultiStepWizard`, `ActivityLevelSelector`, `MacroSplitSlider` (suwaki proporcji makro).
- **UX**: Pasek postępu kroków, blokada wyjścia przed ukończeniem, domyślne wartości sugerowane przez AI.

#### 3. Dashboard (Ekran Główny)

- **Ścieżka**: `/`
- **Główny cel**: Szybki podgląd postępów dnia i dostęp do dodawania posiłków (US-008).
- **Kluczowe informacje**: Data, Podsumowanie kalorii/makro (Zjedzone vs Cel), Lista posiłków.
- **Kluczowe komponenty**:
  - `DaySelector`: Pasek przewijania dni (tydzień) + kalendarz.
  - `DailyProgressSummary`: Duże pierścienie lub paski postępu.
  - `MealList`: Lista kart posiłków z podziałem chronologicznym.
  - `FloatingActionButton (FAB)`: Główny przycisk "Dodaj posiłek".
- **UX**: Optimistic UI (natychmiastowa reakcja interfejsu), "Sticky" nagłówek z datą.

#### 4. Historia Posiłków

- **Ścieżka**: `/history`
- **Główny cel**: Przeglądanie i edycja przeszłości (US-009).
- **Kluczowe informacje**: Kalendarz miesięczny z wizualizacją (np. kropki w kolorach zależnych od realizacji celu).
- **Kluczowe komponenty**: `CalendarView`, `DaySummaryCard` (skrócona wersja dashboardu dla wybranego dnia).
- **UX**: Łatwe przełączanie miesięcy, szybki podgląd szczegółów dnia po kliknięciu.

#### 5. Pomiary Ciała (Should Have)

- **Ścieżka**: `/measurements`
- **Główny cel**: Monitorowanie wagi i składu ciała (US-010).
- **Kluczowe informacje**: Wykresy trendu (Waga, % tłuszczu), tabela ostatnich pomiarów.
- **Kluczowe komponenty**: `WeightChart` (Recharts), `MeasurementLogForm` (Modal lub inline).
- **UX**: Czytelne wykresy, możliwość dodawania pomiarów z datą wsteczną.

#### 6. Profil i Ustawienia

- **Ścieżka**: `/profile`
- **Główny cel**: Zarządzanie kontem i celami.
- **Kluczowe informacje**: Dane użytkownika, Aktualne cele makro, Ustawienia aplikacji (Motyw).
- **Kluczowe komponenty**: `ProfileEditForm`, `DietaryGoalsForm` (ponowna edycja celów z onboardingu).

### C. Modale i Nakładki (Kluczowe interakcje)

#### 7. Modal Dodawania Posiłku (AI Meal Composer)

- **Typ**: Pełnoekranowy Modal (Mobile) / Dialog (Desktop).
- **Ścieżka**: Wywoływany z FAB na Dashboardzie.
- **Główny cel**: Multimodalne wprowadzenie danych z analizą AI lub ręczne wprowadzenie wartości (US-004, US-005, US-006, US-007, US-008).
- **Tryby działania**:
  1.  **Tryb AI**: Analiza tekstowa/wizualna z pomocą AI, interaktywna korekta.
  2.  **Tryb ręczny**: Bezpośrednie wprowadzanie nazwy i makroskładników bez AI.
- **Stany widoku** (wspólne dla obu trybów):
  1.  **Input**: Przełącznik trybu (AI/Ręczny) + odpowiedni formularz.
      - Tryb AI: Pole tekstowe, uploader zdjęć.
      - Tryb ręczny: Formularz z polami: nazwa, kalorie, białko, tłuszcze, węglowodany, błonnik.
  2.  **Analyzing** (tylko tryb AI): Szkieletowy ekran ładowania (Skeleton UI) z animacją "AI myśli".
  3.  **Review & Refine**: Formularz ze wstępnie wypełnionymi danymi (Nazwa, Makro).
      - Tryb AI: Dymek z odpowiedzią AI + sekcja "Refine" (Czat) + historia interakcji.
      - Tryb ręczny: Informacja o ręcznym wprowadzeniu + edytowalne pola (bez AI refine).
- **Kluczowe komponenty**:
  - `ModeSwitch`: Przełącznik "Analiza AI" ↔ "Ręczne dodanie".
  - `MealInputView`: Kontener przełączający między trybami.
  - `ManualEntryForm`: Formularz ręcznego wprowadzania.
  - `InputBar`: Hybryda text input + photo button (tryb AI).
  - `MacroInputs`: Pola numeryczne do ręcznej korekty.
  - `RefineChatSheet`: Dolny panel (Bottom Sheet) do wydawania poleceń korekcyjnych dla AI (tylko tryb AI).
- **UX**: Płynne przejścia między stanami, zapobieganie przypadkowemu zamknięciu (utrata danych), obsługa przycisku "Wstecz", jasne oznaczenie trybu wprowadzania.

## 3. Mapa podróży użytkownika

### Scenariusz A: Dodawanie posiłku z pomocą AI

1.  **Inicjacja**: Użytkownik klika przycisk `+` (FAB) na Dashboardzie.
2.  **Wybór trybu**: Otwiera się `AddMealModal` z domyślnie aktywnym trybem "Analiza AI".
3.  **Wprowadzanie**: Użytkownik robi zdjęcie talerza i opcjonalnie dopisuje "Kawa z mlekiem". Klika "Analizuj".
4.  **Przetwarzanie**: UI blokuje interakcję, wyświetla animację ładowania. W tle leci request `POST /api/ai/analyze`.
5.  **Weryfikacja (Review)**:
    - UI wyświetla rozpoznany posiłek: "Jajecznica z 3 jaj" i wyliczone makro.
    - Wyświetla się dymek z odpowiedzią AI i sugestią dietetyczną.
    - Użytkownik zauważa błąd (za dużo masła).
6.  **Korekta (Refine Loop)**:
    - Użytkownik wpisuje w pole czatu: "Mniej masła, tylko 5g".
    - Wysyłany request `POST /api/ai/refine` z kontekstem.
    - UI aktualizuje wartości w formularzu na podstawie nowej odpowiedzi.
    - Historia interakcji wyświetla wymianę zdań z AI.
7.  **Zatwierdzenie**: Użytkownik klika "Zapisz".
8.  **Finalizacja**:
    - Request `POST /api/meals`.
    - Modal zamyka się.
    - Toast z informacją o sukcesie.
    - Dashboard aktualizuje paski postępu i listę (optimistic update lub re-fetch).

### Scenariusz B: Tryb ręczny (bez AI)

1.  **Inicjacja**: Użytkownik klika przycisk `+` (FAB) na Dashboardzie.
2.  **Wybór trybu**: Otwiera się `AddMealModal`. Użytkownik przełącza na tryb "Ręczne dodanie".
3.  **Wprowadzanie**: Użytkownik wypełnia formularz:
    - Nazwa: "Ser żółty"
    - Kalorie: 400
    - Białko: 25g
    - Tłuszcze: 33g
    - Węglowodany: 0g
    - Błonnik: 0g
4.  **Przejście do weryfikacji**: Klika "Przejdź do podsumowania".
5.  **Weryfikacja (Review)**:
    - UI wyświetla wprowadzone dane do weryfikacji.
    - Widoczna informacja: "Posiłek dodany ręcznie. Sprawdź wartości przed zapisem."
    - Brak opcji refine AI, brak dymku z sugestią.
    - Użytkownik może ręcznie skorygować wartości.
6.  **Zatwierdzenie**: Użytkownik klika "Zapisz".
7.  **Finalizacja**:
    - Request `POST /api/meals`.
    - Modal zamyka się.
    - Toast z informacją o sukcesie.
    - Dashboard aktualizuje paski postępu i listę.

## 4. Układ i struktura nawigacji

### Mobile Layout (< 768px)

- **Top Bar**: Logo + Selektor Daty.
- **Main Content**: Scrollowalny obszar.
- **Floating Action Button (FAB)**: Wycentrowany na dole, nad paskiem nawigacji. Sticky, zawsze widoczny.
- **Bottom Navigation Bar**:
  - [Home/Dashboard]
  - [Historia]
  - (Pusty środek pod FAB)
  - [Pomiary]
  - [Profil]

### Desktop Layout (>= 768px)

- **Top Header**:
  - Lewa: Logo.
  - Środek: Linki nawigacyjne (Dashboard, Historia, Pomiary, Profil).
  - Prawa: Selektor Daty + Przycisk "Dodaj posiłek" (zastępuje FAB).
- **Main Content**: Wycentrowana kolumna (max-width: ~800px) dla zachowania czytelności, ewentualnie dwukolumnowy układ na Dashboardzie (Lewa: Lista, Prawa: Podsumowanie).

## 5. Kluczowe komponenty

1.  **`MacroProgressRing` / `MacroBar`**: Wizualizacja stopnia realizacji celu. Musi obsługiwać stan "overload" (przekroczenie celu -> zmiana koloru na ostrzegawczy, np. pomarańczowy/czerwony).
2.  **`AIChatSheet` (Komponent React)**: Specjalizowany komponent czatu wewnątrz modala edycji. Zawiera historię krótkiej wymiany zdań z modelem w celu doprecyzowania posiłku.
3.  **`SkeletonLoader`**: Zestaw placeholderów imitujących układ karty posiłku, używany podczas oczekiwania na odpowiedź z `/api/ai/analyze`.
4.  **`ImageUploader`**: Komponent obsługujący Drag&Drop oraz natywne API aparatu. Musi zawierać logikę kompresji obrazu (WebP, resize) po stronie klienta przed wysłaniem do API, aby oszczędzać transfer i przyspieszyć request.
5.  **`InteractiveMealCard`**: Karta na liście posiłków. Obsługuje gesty (np. swipe to delete na mobile - opcjonalne) oraz wyświetla "dymki" z pasywnymi sugestiami AI, jeśli są dostępne w odpowiedzi API.
6.  **`ToastNotification`**: System powiadomień (sukces, błąd, info) zgodny z Shadcn/ui, używany do informowania o statusie operacji asynchronicznych.
