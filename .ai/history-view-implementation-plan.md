# Plan implementacji widoku Historia Posiłków

## 1. Przegląd

Widok "Historia Posiłków" umożliwia użytkownikom przeglądanie spożytych posiłków w ujęciu dziennym, nawigację po kalendarzu oraz zarządzanie wpisami (dodawanie zaległych, edycja i usuwanie istniejących). Jest to realizacja wymagania US-009, rozszerzona o funkcjonalność dodawania posiłków z historii do ulubionych (US-014).

## 2. Routing widoku

- **Ścieżka:** `/history`
- **Plik strony:** `src/pages/history.astro` (kontener dla aplikacji React)

## 3. Struktura komponentów

Głównym kontenerem będzie komponent React osadzony w stronie Astro.

```text
src/pages/history.astro
└── HistoryPage (Layout)
    └── HistoryView (Smart Container)
        ├── HistoryCalendar (Nawigacja po datach)
        ├── DaySummary (Pasek postępu/Statystyki dnia)
        ├── MealList (Lista posiłków)
        │   └── MealItem (Pojedynczy wiersz/karta)
        │       └── MealActions (Menu: Edytuj, Dodaj do ulubionych, Usuń)
        └── MealDialog (Formularz dodawania/edycji - Modal)
```

## 4. Szczegóły komponentów

### 1. `HistoryView.tsx` (Container)

- **Opis:** Główny komponent zarządzający stanem wybranej daty, pobieraniem danych i koordynacją akcji (otwieranie modala, obsługa ulubionych).
- **Główne elementy:** Wrapper layoutu, przekazuje stan do dzieci.
- **Obsługiwane interakcje:** Zmiana daty, odświeżenie danych po mutacji, obsługa akcji "Dodaj do ulubionych".
- **Stan:** `selectedDate`, `meals` (data), `summary` (data), `isLoading`, `error`.

### 2. `HistoryCalendar.tsx`

- **Opis:** Komponent wizualny kalendarza (oparty na `shadcn/calendar`) pozwalający na wybór dnia.
- **Propsy:** `selectedDate`, `onSelectDate`.

### 3. `DaySummary.tsx`

- **Opis:** Karta podsumowująca makroskładniki dla wybranego dnia.
- **Propsy:** `summary`, `isLoading`.

### 4. `MealList.tsx` & `MealItem.tsx`

- **Opis:** Lista renderująca posiłki. Obsługuje stan pusty.
- **Propsy:** `meals`, `onEdit`, `onDelete`, `onAddToFavorites` (nowy prop).
- **Elementy `MealItem`:** Nazwa, godzina, kalorie, makro (skrótowo), przycisk menu akcji (DropdownMenu).
- **Menu Akcji (MealActions):**
  - "Edytuj"
  - "Dodaj do ulubionych" (realizacja US-014)
  - "Usuń" (czerwony kolor)

### 5. `MealDialog.tsx`

- **Opis:** Uniwersalny modal do tworzenia i edycji posiłków (edycja wpisu historycznego).
- **Propsy:** `isOpen`, `onClose`, `onSubmit`, `initialData`.

## 5. Typy

### DTO (zgodne z `src/types.ts`)

- `MealDto`
- `MealSummary`
- `CreateMealCommand`
- `UpdateMealCommand`
- `CreateFavoriteDTO` (dla US-014)

### View Models & Form Schemas

```typescript
// Schema dla formularza edycji/dodawania
export const mealFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0).optional(),
  consumed_at: z.string().datetime(), // ISO string z datą i godziną
});

export type MealFormValues = z.infer<typeof mealFormSchema>;
```

## 6. Zarządzanie stanem

Zalecane użycie customowego hooka `useHistoryMeals` wewnątrz `HistoryView`.

**Hook `useHistoryMeals`**:
- Fetchuje posiłki dla danej daty.
- Udostępnia metody CRUD: `deleteMeal`, `updateMeal`.
- Udostępnia metodę `addToFavorites(meal: MealDto)`:
  - Wywołuje `POST /api/favorites`.
  - Obsługuje sukces (Toast: "Dodano do ulubionych").
  - Obsługuje błąd (Toast: "Limit ulubionych osiągnięty" lub inny błąd).

## 7. Integracja API

### Pobieranie i Mutacje Posiłków

- `GET /api/meals?date=YYYY-MM-DD`
- `POST /api/meals`
- `PATCH /api/meals/[id]`
- `DELETE /api/meals/[id]`

### Dodawanie do Ulubionych (Nowe)

- **Endpoint:** `POST /api/favorites`
- **Body:**
  ```json
  {
    "name": "Nazwa z historii",
    "calories": 500,
    "protein": 30,
    "fat": 20,
    "carbs": 50,
    "fiber": 5
  }
  ```
- **Obsługa:** Wywoływane po kliknięciu w menu kontekstowym. Nie usuwa wpisu z historii.

## 8. Interakcje użytkownika

1. **Wybór daty:** Kliknięcie w kalendarz zmienia `selectedDate` -> triggeruje pobranie danych.
2. **Dodanie posiłku do historii:** Kliknięcie "+" otwiera pusty `MealDialog`.
3. **Dodanie do ulubionych (US-014):**
   - Użytkownik klika ikonę menu (trzy kropki) przy posiłku na liście.
   - Wybiera "Dodaj do ulubionych".
   - System wysyła żądanie API.
   - Pojawia się powiadomienie "Szablon został utworzony".
4. **Edycja posiłku:** Zmiana makro lub godziny spożycia.
5. **Usuwanie:** Usunięcie wpisu z historii.

## 9. Warunki i walidacja

- **Limit Ulubionych:** Jeśli użytkownik ma już 100 ulubionych, akcja "Dodaj do ulubionych" powinna zwrócić błąd (400 Bad Request), który frontend wyświetli jako zrozumiały komunikat.
- **Unikalność:** API ulubionych nie wymusza unikalności nazw, więc można dodać "Owsiankę" drugi raz.

## 10. Obsługa błędów

- **Błąd pobierania:** Wyświetlenie komunikatu (Toast/Alert).
- **Błąd zapisu/edycji:** Błąd w modalu.
- **Błąd dodawania do ulubionych:** Toast z informacją o błędzie (np. "Nie udało się dodać do ulubionych. Sprawdź limit.").

## 11. Kroki implementacji

1. **Aktualizacja Serwisu:** Dodanie metody `addToFavorites` do serwisu frontendowego.
2. **Aktualizacja `MealItem`:** Dodanie `DropdownMenu` z opcją "Dodaj do ulubionych".
3. **Logika w `HistoryView`:** Implementacja handlera `handleAddToFavorites`, który wywołuje API i pokazuje Toast.
4. **Integracja:** Połączenie widoku listy z logiką biznesową.
5. **Testy:** Sprawdzenie czy kliknięcie przycisku faktycznie tworzy nowy wpis w tabeli `favorites`.
