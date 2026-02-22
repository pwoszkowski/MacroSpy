# Plan implementacji widoku Ulubionych (Favorites View)

## 1. Przegląd
Widok "Ulubione" służy do zarządzania biblioteką zapisanych szablonów posiłków. Umożliwia użytkownikowi szybkie wyszukiwanie, przeglądanie zapisanych dań, edycję ich definicji, usuwanie oraz – co najważniejsze – szybkie dodawanie ich do dziennika spożycia (z możliwością modyfikacji "w locie").

## 2. Routing widoku
*   **Ścieżka:** `/favorites`
*   **Dostęp:** Widok chroniony (wymaga uwierzytelnienia).
*   **Integracja:** Nowa pozycja w dolnym pasku nawigacji (Layout).

## 3. Struktura komponentów

```text
src/pages/favorites.astro (Page Wrapper)
└── FavoritesView.tsx (Container Component - Smart)
    ├── FavoritesToolbar.tsx (Search & Sort)
    ├── FavoritesList.tsx (List Presentation)
    │   ├── FavoriteCard.tsx (Item Display)
    │   │   └── FavoriteCardActions.tsx (Dropdown Menu)
    │   └── FavoritesEmptyState.tsx (Placeholder)
    ├── LogFavoriteDialog.tsx (US-016: Add to Diary Modal)
    ├── EditFavoriteDialog.tsx (US-017: Edit Template Modal)
    └── DeleteFavoriteAlert.tsx (US-017: Delete Confirmation)
```

## 4. Szczegóły komponentów

### `FavoritesView` (Container)
*   **Opis:** Główny komponent zarządzający stanem widoku. Odpowiada za pobieranie danych, obsługę filtrów i otwieranie odpowiednich modali.
*   **Główne elementy:** Wrapper layoutu, Toolbar, Lista, Modale.
*   **Stan:** Lista ulubionych, status ładowania, parametry wyszukiwania/sortowania, aktualnie wybrany element do akcji.

### `FavoritesToolbar`
*   **Opis:** Pasek narzędziowy nad listą.
*   **Główne elementy:**
    *   Input tekstowy (Search) z ikoną lupy.
    *   Select/Dropdown do sortowania (Najnowsze / Alfabetycznie).
*   **Propsy:** `searchQuery`, `onSearchChange`, `sortBy`, `onSortChange`.

### `FavoriteCard`
*   **Opis:** Karta prezentująca pojedynczy ulubiony posiłek.
*   **Główne elementy:**
    *   Nazwa posiłku (nagłówek).
    *   Pigułki/Badge z makroskładnikami (Kcal, B, T, W).
    *   Przycisk "Menu" (trzy kropki) otwierający `FavoriteCardActions`.
*   **Interakcje:**
    *   Kliknięcie w obszar karty -> Otwiera `LogFavoriteDialog`.
    *   Kliknięcie w menu -> Otwiera opcje zarządzania.
*   **Propsy:** `favorite: FavoriteMeal`, `onSelect`, `onEdit`, `onDelete`.

### `FavoriteCardActions`
*   **Opis:** Menu kontekstowe dla karty (DropdownMenu z shadcn/ui).
*   **Opcje:**
    *   "Edytuj szablon" (Edit)
    *   "Usuń z ulubionych" (Delete - kolor czerwony)

### `LogFavoriteDialog` (US-016)
*   **Opis:** Modal służący do dodania wybranego ulubionego posiłku do dziennika.
*   **Funkcjonalność:**
    *   Prezentuje formularz wstępnie wypełniony danymi z szablonu.
    *   Pozwala na zmianę daty (DatePicker).
    *   Pozwala na edycję makroskładników i nazwy (tylko dla tego wpisu).
*   **Propsy:** `isOpen`, `onClose`, `favorite: FavoriteMeal`, `onSubmit`.

### `EditFavoriteDialog` (US-017)
*   **Opis:** Modal służący do trwałej edycji szablonu ulubionego posiłku.
*   **Funkcjonalność:** Edycja nazwy i makroskładników w bazie danych `favorites`.
*   **Propsy:** `isOpen`, `onClose`, `favorite: FavoriteMeal`, `onSubmit`.

## 5. Typy

Należy zdefiniować lub zaktualizować `src/types.ts` oraz `src/lib/services/favorites.service.ts`:

```typescript
// Reprezentacja ulubionego posiłku (z bazy)
export interface FavoriteMeal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  created_at: string;
}

// DTO do tworzenia/edycji
export interface CreateFavoriteDTO {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

// Opcje sortowania
export type SortOption = 'newest' | 'name_asc';

// Stan modali w widoku
export interface ModalState {
  type: 'log' | 'edit' | 'delete' | null;
  selectedId: string | null;
}
```

## 6. Zarządzanie stanem

Stan będzie zarządzany lokalnie w komponencie `FavoritesView` przy użyciu React Hooks:

1.  **Data Fetching:** `useEffect` wywołujący serwis API przy zmianie `searchQuery` (debounced) lub `sortBy`.
2.  **UI State:**
    *   `isLoading` (boolean) - spinner podczas ładowania.
    *   `modalState` (obiekt) - steruje widocznością i typem aktywnego modalu.
3.  **Local Mutations:** Po udanej edycji/usunięciu, aktualizacja lokalnej tablicy `favorites` bez konieczności pełnego przeładowania (optimistic UI lub update po sukcesie).

## 7. Integracja API

Wykorzystanie serwisu `src/lib/services/favorites.service.ts` (do utworzenia/rozszerzenia), który komunikuje się z endpointami:

*   **Pobieranie listy:** `GET /api/favorites?search=...&sort=...`
    *   Response: `FavoriteMeal[]`
*   **Edycja szablonu:** `PATCH /api/favorites/[id]`
    *   Body: `Partial<CreateFavoriteDTO>`
*   **Usuwanie:** `DELETE /api/favorites/[id]`
*   **Dodawanie do dziennika:** `POST /api/meals` (lub odpowiedni endpoint dziennika)
    *   Body: Obiekt posiłku z datą i zmodyfikowanymi makro.

## 8. Interakcje użytkownika

1.  **Wejście na stronę:** Pobranie listy ulubionych (domyślnie sortowane po najnowszych).
2.  **Wyszukiwanie:** Wpisanie frazy filtruje listę po nazwie (debounce 300ms).
3.  **Kliknięcie karty:**
    *   Otwiera modal "Dodaj do dziennika".
    *   Użytkownik może zmienić datę (np. na wczoraj).
    *   Użytkownik zmienia kalorie (bo zjadł inną porcję).
    *   Kliknięcie "Dodaj" zapisuje posiłek w historii i zamyka modal.
4.  **Edycja szablonu:**
    *   Kliknięcie ikony menu -> Wybór "Edytuj".
    *   Zmiana nazwy na "Owsianka (duża)".
    *   Zapisanie aktualizuje kartę na liście.
5.  **Usuwanie:**
    *   Kliknięcie ikony menu -> Wybór "Usuń".
    *   Potwierdzenie w alercie.
    *   Karta znika z listy.

## 9. Warunki i walidacja

*   **Formularze (Edycja/Dodawanie):**
    *   Nazwa: Wymagana, min. 3 znaki.
    *   Makroskładniki: Wymagane, liczby nieujemne.
*   **Limit ulubionych:**
    *   Mimo że dodawanie odbywa się głównie z innych widoków, jeśli endpoint zwróci błąd limitu (400 Bad Request), należy wyświetlić `Toast` z informacją "Osiągnięto limit 100 ulubionych posiłków".
*   **Empty State:**
    *   Jeśli brak wyników wyszukiwania -> Komunikat "Brak wyników".
    *   Jeśli brak ulubionych w ogóle -> Ekran zachęcający do dodania pierwszego posiłku z historii.

## 10. Obsługa błędów

*   **Błąd pobierania:** Wyświetlenie komunikatu błędu z przyciskiem "Spróbuj ponownie".
*   **Błąd zapisu/edycji:** Zachowanie formularza otwartego i wyświetlenie błędu walidacji lub toasta z błędem API.
*   **Błąd usuwania:** Toast z informacją "Nie udało się usunąć szablonu".

## 11. Kroki implementacji

1.  **Backend Services:** Utworzenie/aktualizacja `src/lib/services/favorites.service.ts` z metodami `getAll`, `update`, `delete`.
2.  **Page Setup:** Utworzenie pliku `src/pages/favorites.astro` i podstawowego szkieletu `FavoritesView.tsx`.
3.  **UI Components:** Implementacja `FavoriteCard` i `FavoritesToolbar` przy użyciu komponentów Shadcn/ui.
4.  **List Logic:** Implementacja pobierania danych, sortowania i filtrowania w `FavoritesView`.
5.  **Log Modal:** Implementacja `LogFavoriteDialog` i integracja z serwisem dodawania posiłków.
6.  **Edit/Delete:** Implementacja `EditFavoriteDialog` i obsługi usuwania.
7.  **Integracja:** Podpięcie wszystkich akcji pod interfejs użytkownika.
8.  **Weryfikacja:** Sprawdzenie zgodności z User Stories (szczególnie rozróżnienie między edycją szablonu a edycją wpisu do dziennika).
