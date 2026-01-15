# Plan implementacji widoku Dashboard (Ekran Główny)

## 1. Przegląd
Dashboard jest centralnym punktem aplikacji MacroSpy, dostępnym pod ścieżką główną. Służy do monitorowania dziennego postępu w realizacji celów żywieniowych oraz zapewnia szybki dostęp do historii posiłków i dodawania nowych wpisów. Widok charakteryzuje się wysoką interaktywnością (zmiana daty, natychmiastowe przeliczanie wskaźników) i wykorzystuje podejście Hybrid Rendering (SSR dla pierwszego ładowania, CSR dla interakcji).

## 2. Routing widoku
*   **Ścieżka URL:** `/`
*   **Plik wejściowy Astro:** `src/pages/index.astro`
*   **Główny komponent kontenera:** `src/components/dashboard/DashboardContainer.tsx`

## 3. Struktura komponentów

```text
src/pages/index.astro (SSR Entry Point)
└── Layout.astro
    └── DashboardContainer.tsx (React, client:load)
        ├── DateHeader.tsx (Sticky Header)
        │   └── DaySelector.tsx (Horizontal Scroll + Calendar Popover)
        ├── NutritionSummary.tsx (Progress Section)
        │   ├── CaloriesRing.tsx (Circular Progress)
        │   └── MacroBars.tsx (Linear Progress x3)
        ├── MealList.tsx (Daily Log)
        │   └── MealCard.tsx (Individual Item)
        └── AddMealFAB.tsx (Floating Action Button)
```

## 4. Szczegóły komponentów

### `DashboardContainer`
*   **Opis:** Główny komponent zarządzający stanem widoku (wybrana data, dane posiłków, cele). Odpowiada za pobieranie danych przy zmianie daty.
*   **Główne elementy:** `div` (wrapper), Zarządzanie stanem (`useState`, `useEffect` / `useQuery`).
*   **Obsługiwane interakcje:** Zmiana daty, obsługa ładowania, obsługa błędów API.
*   **Propsy:**
    *   `initialMeals`: `MealListResponse` (dane z SSR dla "dzisiaj")
    *   `userProfile`: `UserProfileResponse` (cele i profil użytkownika)

### `DateHeader` / `DaySelector`
*   **Opis:** "Przyklejony" do góry ekranu pasek pozwalający na wybór dnia.
*   **Główne elementy:** `nav`, `Button` (Shadcn), `Calendar` (Shadcn w `Popover`).
*   **Obsługiwane interakcje:**
    *   Kliknięcie w konkretny dzień tygodnia (ostatnie 7 dni).
    *   Kliknięcie w ikonę kalendarza -> wybór dowolnej daty.
*   **Propsy:**
    *   `selectedDate`: `Date`
    *   `onDateChange`: `(date: Date) => void`

### `NutritionSummary`
*   **Opis:** Wizualizacja postępów. Wyświetla duży pierścień kalorii i mniejsze paski dla makroskładników.
*   **Główne elementy:**
    *   `CaloriesRing`: SVG/Canvas lub gotowy komponent radial progress.
    *   `MacroBars`: Komponent `Progress` (Shadcn).
*   **Logika:** Oblicza procent realizacji celu. Koloruje paski na czerwono/zielono/żółto w zależności od stopnia realizacji (opcjonalnie).
*   **Propsy:**
    *   `summary`: `MealSummary` (spożyte)
    *   `goals`: `DietaryGoalDto` (cele)

### `MealList` / `MealCard`
*   **Opis:** Lista kart posiłków. Jeśli lista jest pusta, wyświetla "Empty State" zachęcający do dodania posiłku.
*   **Główne elementy:** `ul`/`li`, `Card` (Shadcn), `Badge` (dla sugestii AI).
*   **Obsługiwane interakcje:** Kliknięcie w kartę (może prowadzić do szczegółów/edycji - w MVP opcjonalne, ale warto przygotować `onClick`).
*   **Propsy:**
    *   `meals`: `MealDto[]`

### `AddMealFAB`
*   **Opis:** Pływający przycisk (Fixed position bottom-right) "+" do szybkiego dodawania.
*   **Główne elementy:** `Button` (Shadcn, rounded-full, fixed).
*   **Obsługiwane interakcje:** Nawigacja do `/meals/new` (lub otwarcie modala).

## 5. Typy

Poniższe typy bazują na `src/types.ts` i zostaną rozszerzone o specyficzne dla widoku interfejsy propsów.

```typescript
// Istniejące w src/types.ts (do wykorzystania)
import type { MealDto, MealSummary, MealListResponse, UserProfileResponse, DietaryGoalDto } from '@/types';

// Typy lokalne (view-specific)
export interface DashboardState {
  currentDate: Date;
  mealsData: MealListResponse;
  isLoading: boolean;
  error: string | null;
}

export interface DaySelectorProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export interface NutritionSummaryProps {
  current: MealSummary;
  targets: DietaryGoalDto | null; // Nullable if not set
}
```

## 6. Zarządzanie stanem

Wykorzystamy React `useState` wewnątrz `DashboardContainer` oraz custom hook `useDashboardData`.

*   **Hook `useDashboardData(date: Date, initialData?: MealListResponse)`**:
    *   Utrzymuje stan: `data` (`MealListResponse`), `loading`, `error`.
    *   Na zmianę `date`:
        *   Ustawia `loading = true`.
        *   Wywołuje `GET /api/meals?date=YYYY-MM-DD`.
        *   Aktualizuje stan.
    *   Inicjalizacja: Jeśli podano `initialData` (z SSR) i data to "dzisiaj", używa danych startowych bez fetchowania.

## 7. Integracja API

### Ładowanie danych (Server-Side - SSR)
W pliku `src/pages/index.astro`:
1.  Pobranie sesji użytkownika (Middleware).
2.  Równoległe wywołanie:
    *   `GET /api/profile/me` (helper service function, nie przez fetch HTTP dla wydajności, jeśli możliwe, lub via `locals`).
    *   `GET /api/meals` (dla dzisiejszej daty).
3.  Przekazanie danych jako propsy do komponentu React.

### Ładowanie danych (Client-Side - CSR)
*   **Endpoint:** `GET /api/meals?date=YYYY-MM-DD`
*   **Metoda:** `fetch`
*   **Obsługa:** W hooku `useDashboardData`.

## 8. Interakcje użytkownika

1.  **Wybór daty:**
    *   Użytkownik klika dzień w pasku -> aplikacja pobiera posiłki dla tego dnia.
    *   Użytkownik wybiera datę z kalendarza -> aplikacja pobiera posiłki dla wybranej daty historycznej.
2.  **Przewijanie:**
    *   Przy przewijaniu listy posiłków nagłówek z datą pozostaje przyklejony (`sticky`).
3.  **Dodawanie posiłku:**
    *   Kliknięcie FAB przekierowuje do widoku dodawania posiłku (kontekst aktualnie wybranej daty może być przekazany w query params, np. `/meals/new?date=2026-01-06`).

## 9. Warunki i walidacja

*   **Brak celów żywieniowych:** Jeśli `UserProfileResponse.current_goal` jest `null`, sekcja `NutritionSummary` powinna wyświetlić komunikat "Ustal cele w profilu" zamiast pustych pasków.
*   **Przyszła data:** Dashboard pozwala wybrać przyszłą datę, ale lista posiłków będzie pusta. (Planer posiłków jest wyłączony z MVP, więc to tylko pusty widok).
*   **Formatowanie daty:** Użycie biblioteki `date-fns` do bezpiecznego formatowania daty w URL (`yyyy-MM-dd`) unikając problemów ze strefami czasowymi.

## 10. Obsługa błędów

*   **Błąd pobierania posiłków:** Wyświetlenie komponentu `ErrorState` z przyciskiem "Spróbuj ponownie".
*   **Błąd pobierania profilu:** Fallback do domyślnych wartości celów (np. 2000 kcal) z ostrzeżeniem lub przekierowanie do logowania/konfiguracji.
*   **Brak autoryzacji:** Middleware Astro powinno obsłużyć przekierowanie do `/login` przed renderowaniem strony.

## 11. Kroki implementacji

1.  **Przygotowanie serwisów/api:** Upewnienie się, że endpointy `/api/meals` i `/api/profile/me` działają poprawnie (już istnieją).
2.  **Stworzenie komponentów UI (Shadcn):**
    *   Instalacja/kopia komponentów: `Button`, `Card`, `Progress`, `Calendar`, `Popover`.
3.  **Implementacja komponentów prezentacyjnych:**
    *   `CaloriesRing` (SVG/CSS).
    *   `MacroBars`.
    *   `MealCard`.
    *   `DaySelector` (logika dat).
4.  **Implementacja `DashboardContainer`:**
    *   Złożenie layoutu.
    *   Dodanie logiki pobierania danych (hook `useDashboardData`).
5.  **Integracja z Astro (`index.astro`):**
    *   Pobranie danych po stronie serwera.
    *   Przekazanie ich do komponentu React.
6.  **Stylowanie i UX:**
    *   Dopracowanie sticky header.
    *   Animacje pasków postępu.
    *   Obsługa RWD (mobilne vs desktop).
