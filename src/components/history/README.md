# Historia Posiłków - Komponenty

Widok historii posiłków pozwala użytkownikom przeglądać, dodawać, edytować i usuwać posiłki w ujęciu dziennym.

## Struktura komponentów

```
HistoryView (Container)
├── HistoryCalendar (Nawigacja po datach)
├── DaySummary (Statystyki dnia)
├── MealList (Lista posiłków)
│   └── MealItem (Pojedynczy posiłek z menu akcji)
├── MealDialog (Formularz dodawania/edycji)
└── AddMealFAB (Przycisk dodawania)
```

## Komponenty

### HistoryView
Główny kontener zarządzający stanem i koordynujący wszystkie podkomponenty.

**Stan:**
- `selectedDate` - wybrana data
- `isDialogOpen` - stan modala
- `editingMeal` - posiłek w trybie edycji

**Hook:** Używa `useHistoryMeals` do zarządzania danymi i operacjami CRUD.

### HistoryCalendar
Komponent kalendarza oparty na shadcn/ui Calendar.

**Props:**
- `selectedDate: Date` - wybrana data
- `onSelectDate: (date: Date) => void` - callback zmiany daty

**Features:**
- Polska lokalizacja
- Blokada dat przyszłych
- Sticky positioning na desktop

### DaySummary
Wyświetla podsumowanie makroskładników dla wybranego dnia.

**Props:**
- `summary: MealSummary | null` - dane podsumowania
- `isLoading: boolean` - stan ładowania

**Features:**
- Responsywna siatka statystyk
- Skeleton loading states
- Empty state

### MealList & MealItem
Lista i pojedynczy element posiłku.

**MealList Props:**
- `meals: MealDto[]` - lista posiłków
- `isLoading: boolean` - stan ładowania
- `onEdit: (meal: MealDto) => void` - callback edycji
- `onDelete: (id: string) => void` - callback usunięcia

**MealItem Features:**
- Menu akcji (DropdownMenu) z opcjami Edytuj/Usuń
- Wyświetlanie makroskładników
- AI suggestions badge
- Ikony z lucide-react

### MealDialog
Uniwersalny modal do dodawania i edycji posiłków.

**Props:**
- `isOpen: boolean` - stan otwarcia
- `onClose: () => void` - callback zamknięcia
- `onSubmit: (data: MealFormValues) => Promise<void>` - callback zapisu
- `initialData?: MealDto` - dane początkowe (edycja)
- `defaultDate: Date` - domyślna data (dodawanie)

**Features:**
- react-hook-form z zod validation
- Automatyczny reset formularza
- Walidacja wszystkich pól
- Obsługa błędów

## Hook: useHistoryMeals

Custom hook zarządzający danymi historii posiłków.

**Params:**
- `selectedDate: Date` - data do pobrania posiłków

**Returns:**
- `meals: MealDto[]` - lista posiłków
- `summary: MealSummary | null` - podsumowanie dnia
- `isLoading: boolean` - stan ładowania
- `error: string | null` - błąd
- `refresh: () => Promise<void>` - odświeżenie danych
- `createMeal: (command: CreateMealCommand) => Promise<void>` - dodanie posiłku
- `updateMeal: (id: string, command: UpdateMealCommand) => Promise<void>` - edycja
- `deleteMeal: (id: string) => Promise<void>` - usunięcie

## Walidacja (Zod Schema)

```typescript
mealFormSchema:
  - name: string, min 1 znak
  - calories: number, >= 0
  - protein: number, >= 0
  - fat: number, >= 0
  - carbs: number, >= 0
  - fiber: number, >= 0 (optional)
  - consumed_at: datetime string (ISO 8601)
```

## Routing

**Ścieżka:** `/history`  
**Plik:** `src/pages/history.astro`

## Integracja API

- `GET /api/meals?date=YYYY-MM-DD` - pobieranie posiłków
- `POST /api/meals` - dodawanie posiłku
- `PATCH /api/meals/[id]` - edycja posiłku
- `DELETE /api/meals/[id]` - usuwanie posiłku

## Zależności

- shadcn/ui: Calendar, Dialog, Card, Button, Input, Label, DropdownMenu, Skeleton, Progress
- react-hook-form + @hookform/resolvers
- zod
- date-fns
- lucide-react
- sonner (toasts)
