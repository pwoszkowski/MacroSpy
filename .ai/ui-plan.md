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

#### 5. Ulubione Posiłki (Biblioteka)

- **Ścieżka**: `/favorites`
- **Główny cel**: Zarządzanie biblioteką szablonów posiłków (US-015, US-017) oraz dodawanie ich do dziennika.
- **Kluczowe informacje**: Lista zapisanych szablonów, Wyszukiwarka.
- **Kluczowe komponenty**:
  - `FavoritesList`: Siatka lub lista kart ulubionych posiłków.
  - `FavoriteMealCard`: Karta z makroskładnikami i przyciskiem akcji "Użyj" (Dodaj do dziennika).
  - `SearchFilterBar`: Pole wyszukiwania i sortowania (Najnowsze / A-Z).
- **UX**: Kliknięcie w kartę otwiera modal edycji posiłku z wypełnionymi danymi.

#### 6. Pomiary Ciała (Should Have)

- **Ścieżka**: `/measurements`
- **Główny cel**: Monitorowanie wagi i składu ciała (US-010).
- **Kluczowe informacje**: Wykresy trendu (Waga, % tłuszczu), tabela ostatnich pomiarów.
- **Kluczowe komponenty**: `WeightChart` (Recharts), `MeasurementLogForm` (Modal lub inline).
- **UX**: Czytelne wykresy, możliwość dodawania pomiarów z datą wsteczną.

#### 7. Profil i Ustawienia

- **Ścieżka**: `/profile`
- **Główny cel**: Zarządzanie kontem i celami.
- **Kluczowe informacje**: Dane użytkownika, Aktualne cele makro, Ustawienia aplikacji (Motyw).
- **Kluczowe komponenty**: `ProfileEditForm`, `DietaryGoalsForm` (ponowna edycja celów z onboardingu).

### C. Modale i Nakładki (Kluczowe interakcje)

#### 8. Modal Dodawania Posiłku (AI Meal Composer)

- **Typ**: Pełnoekranowy Modal (Mobile) / Dialog (Desktop).
- **Ścieżka**: Wywoływany z FAB na Dashboardzie (pusty) LUB z listy Ulubionych (wypełniony).
- **Główny cel**: Multimodalne wprowadzenie danych z analizą AI lub ręczne wprowadzenie wartości (US-004 - US-008, US-013).
- **Tryby działania**:
  1.  **Tryb AI**: Analiza tekstowa/wizualna z pomocą AI, interaktywna korekta.
  2.  **Tryb ręczny**: Bezpośrednie wprowadzanie nazwy i makroskładników bez AI (używany również przy edycji posiłku z Ulubionych).
- **Stany widoku**:
  1.  **Input**: Przełącznik trybu (AI/Ręczny).
      - Tryb AI: Pole tekstowe, uploader zdjęć.
      - Tryb ręczny: Formularz z polami.
  2.  **Analyzing** (tylko tryb AI): Szkieletowy ekran ładowania (Skeleton UI) z animacją "AI myśli".
  3.  **Review & Refine**: Formularz ze wstępnie wypełnionymi danymi (Nazwa, Makro).
      - **Sekcja "Zapisz jako ulubione"**: Checkbox/Toggle pozwalający zapisać nowy posiłek jako szablon.
      - Tryb AI: Dymek z odpowiedzią AI + sekcja "Refine" (Czat).
      - Tryb ręczny: Edytowalne pola (umożliwia modyfikację danych wczytanych z ulubionych).
- **Kluczowe komponenty**:
  - `ModeSwitch`: Przełącznik "Analiza AI" ↔ "Ręczne dodanie".
  - `MealInputView`: Kontener przełączający między trybami.
  - `AddToFavoritesToggle`: Kontrolka w widoku podsumowania (Review).
  - `RefineChatSheet`: Dolny panel (Bottom Sheet) do wydawania poleceń korekcyjnych dla AI.
- **UX**: Płynne przejścia między stanami, zapobieganie przypadkowemu zamknięciu.

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
7.  **Zatwierdzenie**: Użytkownik klika "Zapisz".
8.  **Finalizacja**:
    - Request `POST /api/meals`.
    - Modal zamyka się.
    - Toast z informacją o sukcesie.
    - Dashboard aktualizuje paski postępu i listę (optimistic update lub re-fetch).

### Scenariusz B: Tryb ręczny (bez AI)

1.  **Inicjacja**: Użytkownik klika przycisk `+` (FAB) na Dashboardzie.
2.  **Wybór trybu**: Otwiera się `AddMealModal`. Użytkownik przełącza na tryb "Ręczne dodanie".
3.  **Wprowadzanie**: Użytkownik wypełnia formularz (Nazwa, Makro).
4.  **Przejście do weryfikacji**: Klika "Przejdź do podsumowania".
5.  **Weryfikacja (Review)**:
    - UI wyświetla wprowadzone dane do weryfikacji.
    - Użytkownik zaznacza opcję "Zapisz jako ulubiony", aby zachować przepis na przyszłość.
6.  **Zatwierdzenie**: Użytkownik klika "Zapisz".
7.  **Finalizacja**:
    - Request `POST /api/meals` (oraz `POST /api/favorites` w tle lub jako flaga w requeście).
    - Modal zamyka się.

### Scenariusz C: Dodawanie z Ulubionych

1.  **Inicjacja**: Użytkownik przechodzi do zakładki **Ulubione** w dolnym pasku nawigacji.
2.  **Wybór**: Przegląda listę swoich szablonów. Klika w kartę "Owsianka Królewska" (przycisk "Użyj" lub całą kartę).
3.  **Otwarcie Modala**: Otwiera się `AddMealModal` w trybie ręcznym, ale pola formularza są **wstępnie wypełnione** danymi z szablonu.
4.  **Edycja (Opcjonalna)**:
    - Użytkownik zmienia ilość kalorii (dzisiaj dodał mniej orzechów).
    - Szablon źródłowy pozostaje bez zmian.
5.  **Zatwierdzenie**: Kliknięcie "Zapisz" dodaje wpis do dziennika (Dashboard).
6.  **Finalizacja**: Przekierowanie do Dashboardu lub zamknięcie modala i pozostanie na liście (zależnie od preferencji UX - sugerowane przekierowanie do Dashboardu, aby zobaczyć efekt).

## 4. Układ i struktura nawigacji

### Mobile Layout (< 768px)

- **Top Bar**: Logo + Selektor Daty.
- **Main Content**: Scrollowalny obszar.
- **Floating Action Button (FAB)**: Wycentrowany na dole, nad paskiem nawigacji. Sticky, zawsze widoczny.
- **Bottom Navigation Bar**:
  - [Dashboard] (Home)
  - [Historia] (Calendar)
  - (Pusty środek pod FAB)
  - [Ulubione] (Heart)
  - [Więcej] (Menu/Profil)

### Desktop Layout (>= 768px)

- **Top Header**:
  - Lewa: Logo.
  - Środek: Linki nawigacyjne (Dashboard, Historia, Ulubione, Pomiary).
  - Prawa: Profil + Przycisk "Dodaj posiłek".
- **Main Content**: Wycentrowana kolumna (max-width: ~800px).

## 5. Kluczowe komponenty

1.  **`MacroProgressRing` / `MacroBar`**: Wizualizacja stopnia realizacji celu. Obsługa stanu "overload".
2.  **`AIChatSheet` (Komponent React)**: Specjalizowany komponent czatu wewnątrz modala edycji.
3.  **`SkeletonLoader`**: Zestaw placeholderów imitujących układ karty posiłku.
4.  **`ImageUploader`**: Komponent obsługujący Drag&Drop oraz natywne API aparatu z kompresją kliencką.
5.  **`InteractiveMealCard`**: Karta na liście posiłków. Obsługuje gesty oraz menu kontekstowe.
6.  **`ToastNotification`**: System powiadomień (Shadcn/ui).
7.  **`AddToFavoritesToggle`**: Przycisk (zwykle ikona serca) pozwalający zapisać aktualnie edytowany posiłek jako szablon.
