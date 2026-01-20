# Plan implementacji widoku Historia Posiłków

## 1. Przegląd

Widok "Historia Posiłków" umożliwia użytkownikom przeglądanie spożytych posiłków w ujęciu dziennym, nawigację po kalendarzu oraz zarządzanie wpisami (dodawanie zaległych, edycja i usuwanie istniejących). Jest to realizacja wymagania US-009, mająca na celu utrzymanie porządku w dzienniku żywieniowym.

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
        │       └── MealActions (Menu: Edytuj, Usuń)
        └── MealDialog (Formularz dodawania/edycji - Modal)
```

## 4. Szczegóły komponentów

### 1. `HistoryView.tsx` (Container)

- **Opis:** Główny komponent zarządzający stanem wybranej daty, pobieraniem danych i koordynacją akcji (otwieranie modala).
- **Główne elementy:** Wrapper layoutu, przekazuje stan do dzieci.
- **Obsługiwane interakcje:** Zmiana daty, odświeżenie danych po mutacji.
- **Stan:** `selectedDate`, `meals` (data), `summary` (data), `isLoading`, `error`.

### 2. `HistoryCalendar.tsx`

- **Opis:** Komponent wizualny kalendarza (oparty na `shadcn/calendar`) pozwalający na wybór dnia.
- **Propsy:**
  - `selectedDate: Date`
  - `onSelectDate: (date: Date) => void`
- **UX:** Powinien być zawsze widoczny (lub łatwo dostępny), z wyraźnym zaznaczeniem aktywnego dnia.

### 3. `DaySummary.tsx`

- **Opis:** Karta podsumowująca makroskładniki dla wybranego dnia.
- **Propsy:**
  - `summary: MealSummary | null`
  - `isLoading: boolean`
- **Główne elementy:** Paski postępu (Progress Bar) lub proste liczniki dla Kalorii, Białka, Tłuszczy, Węglowodanów.

### 4. `MealList.tsx` & `MealItem.tsx`

- **Opis:** Lista renderująca posiłki. Obsługuje stan pusty.
- **Propsy:**
  - `meals: MealDto[]`
  - `onEdit: (meal: MealDto) => void`
  - `onDelete: (id: string) => void`
- **Elementy `MealItem`:** Nazwa, godzina, kalorie, makro (skrótowo), przycisk menu akcji (DropdownMenu).

### 5. `MealDialog.tsx`

- **Opis:** Uniwersalny modal do tworzenia i edycji posiłków.
- **Propsy:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onSubmit: (data: MealFormValues) => Promise<void>`
  - `initialData?: MealDto` (jeśli edycja)
  - `defaultDate: Date` (data do której dodajemy posiłek)
- **Walidacja formularza (Zod):**
  - `name`: wymagane, min 1 znak.
  - `calories`, `protein`, `fat`, `carbs`: wymagane, nieujemne.
  - `consumed_at`: wymagane (domyślnie ustawione na `defaultDate` + aktualna godzina lub godzina z `initialData`).

## 5. Typy

### DTO (zgodne z `src/types.ts`)

Wkorzystujemy istniejące typy:

- `MealDto`
- `MealSummary`
- `CreateMealCommand`
- `UpdateMealCommand`

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

Zalecane użycie customowego hooka `useHistoryMeals` wewnątrz `HistoryView`:

```typescript
const useHistoryMeals = (date: Date) => {
  // Logika fetchowania z użyciem useEffect lub React Query (jeśli dostępne)
  // URL: `/api/meals?date=${format(date, 'yyyy-MM-dd')}`
  // Zwraca: { meals, summary, isLoading, refresh, deleteMeal, updateMeal, createMeal }
};
```

Stan lokalny w `HistoryView`:

- `selectedDate`: `useState<Date>(new Date())`
- `isModalOpen`: `useState<boolean>(false)`
- `editingMeal`: `useState<MealDto | null>(null)` (jeśli null -> tryb dodawania)

## 7. Integracja API

### Pobieranie danych (GET)

- **Endpoint:** `/api/meals?date=YYYY-MM-DD`
- **Metoda:** `fetch`
- **Format daty:** `yyyy-MM-dd` (uwaga na strefy czasowe, formatować lokalnie).

### Dodawanie (POST)

- **Endpoint:** `/api/meals`
- **Body:** `CreateMealCommand`
- **Ważne:** Pole `consumed_at` musi zawierać pełną datę i godzinę. Jeśli dodajemy posiłek do przeszłości, data musi się zgadzać z wybranym dniem w kalendarzu.

### Edycja (PATCH)

- **Endpoint:** `/api/meals/[id]`
- **Body:** `UpdateMealCommand` (częściowe dane, np. tylko zmienione makro).

### Usuwanie (DELETE)

- **Endpoint:** `/api/meals/[id]`
- **Reakcja:** Po sukcesie usunięcia, należy przeładować listę lub usunąć element lokalnie.

## 8. Interakcje użytkownika

1. **Wybór daty:** Kliknięcie w kalendarz zmienia `selectedDate` -> triggeruje pobranie danych.
2. **Dodanie posiłku:** Kliknięcie "+" otwiera pusty `MealDialog`. Data w formularzu ustawiona domyślnie na `selectedDate`.
3. **Edycja posiłku:** Kliknięcie "Edytuj" w menu posiłku otwiera `MealDialog` wypełniony danymi.
4. **Zapis:** Walidacja formularza -> Request do API -> Zamknięcie modala -> Odświeżenie listy.
5. **Usuwanie:** Kliknięcie "Usuń" -> (Opcjonalnie: Potwierdzenie) -> Request DELETE -> Odświeżenie listy.

## 9. Warunki i walidacja

- **Data przyszła:** System pozwala na nawigację w przyszłość, ale lista będzie pusta (chyba że dodamy planowanie - poza zakresem MVP).
- **Formatowanie liczb:** Inputy numeryczne powinny blokować wartości ujemne.
- **Loading State:** Podczas zmiany daty, lista powinna pokazać szkielet (Skeleton) lub spinner.
- **Empty State:** Jeśli brak posiłków, wyświetlić komunikat "Brak wpisów dla tego dnia".

## 10. Obsługa błędów

- **Błąd pobierania:** Wyświetlenie komunikatu (Toast/Alert) "Nie udało się pobrać historii".
- **Błąd zapisu/edycji:** Wyświetlenie błędu walidacji (jeśli 400) lub ogólnego błędu (jeśli 500) wewnątrz modala, bez jego zamykania.
- **Meal Not Found (404):** Jeśli podczas edycji posiłek został usunięty przez innego klienta, odświeżyć listę i poinformować użytkownika.

## 11. Kroki implementacji

1. **Setup API Client:** Upewnienie się, że mamy helper do fetchowania (lub użycie natywnego `fetch` z obsługą błędów).
2. **Stworzenie Typów:** Zaktualizowanie/utworzenie definicji Zod dla formularza w `src/lib/schemas.ts` (lub lokalnie).
3. **Implementacja `HistoryCalendar`:** Podstawowy kalendarz zmieniający datę.
4. **Implementacja `DaySummary`:** Komponent wizualizujący `MealSummary`.
5. **Implementacja `MealList` i `MealItem`:** Wyświetlanie statycznej listy (mock data).
6. **Implementacja Logiki Pobierania:** Podpięcie `useEffect` do pobierania danych z API na podstawie daty.
7. **Implementacja `MealDialog`:** Formularz z react-hook-form i zod-resolver.
8. **Integracja CRUD:** Podpięcie funkcji `create`, `update`, `delete` pod interfejs.
9. **Styling & Polish:** Dopracowanie wyglądu (Shadcn/ui), stany ładowania, responsywność.
10. **Testy manualne:** Weryfikacja dodawania posiłku do przeszłości i aktualizacji podsumowania.
