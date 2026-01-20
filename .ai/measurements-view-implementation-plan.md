# Plan implementacji widoku Pomiarów Ciała

## 1. Przegląd

Widok "Pomiary Ciała" (`/measurements`) służy do monitorowania postępów użytkownika w zakresie wagi oraz składu ciała (tkanka tłuszczowa, masa mięśniowa). Umożliwia przeglądanie historii pomiarów na interaktywnych wykresach i w tabeli, a także dodawanie nowych wpisów (również z datą wsteczną). Jest to realizacja wymagania US-010 (Should Have).

## 2. Routing widoku

- **Ścieżka:** `/measurements`
- **Plik Astro:** `src/pages/measurements/index.astro`
- **Dostęp:** Wymaga zalogowania (Chroniony przez middleware).

## 3. Struktura komponentów

Widok zostanie zbudowany jako wyspa interaktywności (React) osadzona w layoutcie Astro.

```text
src/pages/measurements/index.astro (Page Wrapper)
└── Layout (Astro)
    └── MeasurementsDashboard (React Container)
        ├── MeasurementsSummary (Statystyki: obecna waga, zmiany)
        ├── MeasurementsChart (Wykresy: Waga / Skład ciała - Recharts)
        ├── MeasurementLogDialog (Modal z formularzem - Shadcn Dialog)
        │   └── MeasurementForm (Formularz - React Hook Form + Zod)
        └── MeasurementsHistory (Tabela/Lista ostatnich pomiarów)
```

## 4. Szczegóły komponentów

### 1. `MeasurementsDashboard` (Container)

- **Opis:** Główny kontener zarządzający stanem widoku (pobieranie danych, otwieranie modala).
- **Główne elementy:** Wrapper `div` z `className="space-y-6"`, nagłówek z przyciskiem "Dodaj pomiar".
- **Interakcje:**
  - Inicjalne pobranie danych.
  - Obsługa odświeżenia danych po dodaniu nowego pomiaru.
- **Typy:** Zarządza listą `MeasurementDto[]`.

### 2. `MeasurementsSummary`

- **Opis:** Komponent wyświetlający kluczowe metryki w formie kart (np. "Aktualna waga", "Ostatnie BMI", "Zmiana od początku").
- **Główne elementy:** `Card` (Shadcn), `lucide-react` icons.
- **Props:** `latest: MeasurementDto | null`, `previous: MeasurementDto | null`.

### 3. `MeasurementsChart`

- **Opis:** Wizualizacja trendów w czasie. Użytkownik może przełączać się między widokiem wagi a składu ciała.
- **Główne elementy:** `ResponsiveContainer`, `LineChart`, `XAxis`, `YAxis`, `Tooltip`, `Area` (Recharts). Przełącznik (Tabs/ToggleGroup) do zmiany typu wykresu.
- **Props:** `data: MeasurementDto[]`.
- **Logika:** Sortowanie danych chronologicznie (API zwraca DESC, wykres potrzebuje ASC). Formatowanie daty na osi X.

### 4. `MeasurementLogDialog` & `MeasurementForm`

- **Opis:** Modal zawierający formularz dodawania pomiaru.
- **Główne elementy:** `Dialog`, `DialogContent`, `DialogHeader`, `Input` (type="number"), `Input` (type="date"), `Button`.
- **Biblioteki:** `react-hook-form`, `zod`, `@hookform/resolvers/zod`.
- **Walidacja (Zod):**
  - `date`: wymagane, format YYYY-MM-DD.
  - `weight`: wymagane, liczba dodatnia > 0.
  - `body_fat_percentage`: opcjonalne, 0-100.
  - `muscle_percentage`: opcjonalne, 0-100.
- **Props:** `isOpen: boolean`, `onClose: () => void`, `onSuccess: () => void`.

### 5. `MeasurementsHistory`

- **Opis:** Tabela lub lista (na mobile) wyświetlająca historię pomiarów z możliwością usuwania.
- **Główne elementy:** `Table`, `TableHeader`, `TableRow`, `TableCell`, `AlertDialog` (Shadcn), przycisk usuwania z ikoną `Trash2` (lucide-react).
- **Props:** `data: MeasurementDto[]`, `onDelete: (measurementId: string) => Promise<void>`.
- **Funkcjonalności:**
  - Wyświetlanie kolumn: Data, Waga (kg), Tłuszcz (%), Mięśnie (%), Akcje.
  - Przycisk usuwania w każdym wierszu.
  - AlertDialog z potwierdzeniem przed usunięciem.
  - Wyświetlanie szczegółów pomiaru w dialogu potwierdzenia.
  - Stan ładowania podczas usuwania.

## 5. Typy

Należy wykorzystać istniejące typy z `src/types.ts` oraz dodać typy pomocnicze dla formularzy.

```typescript
// Import z src/types.ts
import type { MeasurementDto, LogMeasurementCommand } from "@/types";

// Schema walidacji dla formularza (zod)
export const measurementFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Wymagany format YYYY-MM-DD"),
  weight: z.number({ invalid_type_error: "Waga jest wymagana" }).positive("Waga musi być dodatnia"),
  body_fat_percentage: z.number().min(0).max(100).optional().nullable(),
  muscle_percentage: z.number().min(0).max(100).optional().nullable(),
});

export type MeasurementFormValues = z.infer<typeof measurementFormSchema>;
```

## 6. Zarządzanie stanem

Zalecane użycie customowego hooka `useMeasurements` wewnątrz `MeasurementsDashboard`.

### `useMeasurements`

- **State:**
  - `measurements`: `MeasurementDto[]`
  - `isLoading`: `boolean`
  - `error`: `string | null`
- **Methods:**
  - `fetchMeasurements()`: Pobiera dane z GET `/api/measurements`.
  - `addMeasurement(data: LogMeasurementCommand)`: Wysyła POST `/api/measurements`.
  - `removeMeasurement(measurementId: string)`: Wysyła DELETE `/api/measurements/[id]`.

## 7. Integracja API

### Pobieranie danych (GET)

- **Endpoint:** `/api/measurements?limit=30`
- **Response:** `MeasurementDto[]`
- **Obsługa:** Parsowanie JSON, obsługa błędów sieci.

### Dodawanie danych (POST)

- **Endpoint:** `/api/measurements`
- **Body:**
  ```json
  {
    "date": "2026-01-11",
    "weight": 85.5,
    "body_fat_percentage": 20,
    "muscle_percentage": 40
  }
  ```
- **Success:** Odświeżenie listy pomiarów, zamknięcie modala, toast success.
- **Error:** Wyświetlenie błędu w formularzu lub toast error.

### Usuwanie danych (DELETE)

- **Endpoint:** `/api/measurements/{id}`
- **Response:** `204 No Content`
- **Success:** Odświeżenie listy pomiarów, zamknięcie dialogu potwierdzenia, toast success.
- **Error:** Toast error z komunikatem z API.

## 8. Interakcje użytkownika

1. **Wejście na stronę:** Automatyczne pobranie ostatnich 30 pomiarów. Wyświetlenie wykresu i listy.
2. **Dodanie pomiaru:**
   - Kliknięcie "Dodaj pomiar" -> Otwarcie modala.
   - Wypełnienie daty (domyślnie dzisiaj) i wagi.
   - Opcjonalne wypełnienie % tłuszczu/mięśni.
   - Kliknięcie "Zapisz".
   - Walidacja front-end.
   - Wysłanie żądania do API.
   - Po sukcesie: zamknięcie modala, odświeżenie danych na wykresie i liście.
3. **Usunięcie pomiaru:**
   - Kliknięcie ikony kosza w wierszu tabeli historii.
   - Otwarcie AlertDialog z potwierdzeniem.
   - Wyświetlenie szczegółów pomiaru (data, waga).
   - Kliknięcie "Usuń" lub "Anuluj".
   - Po potwierdzeniu: wysłanie żądania DELETE do API.
   - Po sukcesie: zamknięcie dialogu, odświeżenie danych, toast success.
4. **Przełączanie wykresu:** Zmiana widoku z "Waga" na "Skład ciała" za pomocą zakładek nad wykresem.

## 9. Warunki i walidacja

- **Data:** Nie można dodać pomiaru z niepoprawnym formatem daty. (API wymaga YYYY-MM-DD).
- **Wartości liczbowe:** Waga musi być > 0. Procenty muszą mieścić się w przedziale 0-100.
- **Formularz:** Przycisk zapisu jest zablokowany (disabled) lub pokazuje błędy walidacji, jeśli pola są niepoprawne.
- **Stan ładowania:** Podczas pobierania danych wyświetlany jest szkielet (Skeleton) lub spinner. Podczas zapisywania przycisk w formularzu pokazuje stan `isSubmitting`.

## 10. Obsługa błędów

- **Błąd pobierania:** Wyświetlenie komunikatu "Nie udało się pobrać historii pomiarów" z przyciskiem "Spróbuj ponownie".
- **Błąd zapisu:**
  - Błąd walidacji API (400): Wyświetlenie komunikatu pod odpowiednim polem formularza.
  - Błąd serwera (500): Wyświetlenie ogólnego toasta z błędem "Wystąpił błąd podczas zapisywania".
- **Błąd usuwania:**
  - Błąd serwera (500): Wyświetlenie toasta z błędem "Nie udało się usunąć pomiaru".
  - Błąd 404: Wyświetlenie toasta "Pomiar nie istnieje lub został już usunięty".

## 11. Kroki implementacji

1. **Przygotowanie środowiska:** ✅
   - Upewnij się, że `recharts` jest zainstalowane (`npm install recharts`).
   - Upewnij się, że komponenty UI (Dialog, Input, Button, Table, Card, AlertDialog) są dostępne w `src/components/ui`.

2. **Stworzenie serwisu API (Frontend):** ✅
   - Dodaj metody `getMeasurements`, `logMeasurement` i `deleteMeasurement` w `src/lib/api.ts`.

3. **Implementacja `MeasurementForm`:** ✅
   - Stwórz komponent formularza z użyciem `react-hook-form` i `zod`.
   - Podłącz walidację.

4. **Implementacja `MeasurementsChart`:** ✅
   - Skonfiguruj wykres liniowy Recharts.
   - Dodaj obsługę pustego stanu (brak danych).
   - Dodaj wyraźne punkty pomiarowe.

5. **Implementacja `MeasurementsDashboard`:** ✅
   - Złóż komponenty (Chart, Summary, History, Dialog).
   - Zaimplementuj logikę pobierania, dodawania i usuwania danych.
   - Dodaj custom hook `useMeasurements`.

6. **Implementacja `MeasurementsHistory` z funkcją usuwania:** ✅
   - Dodaj przycisk usuwania w każdym wierszu.
   - Implementuj AlertDialog z potwierdzeniem.
   - Obsłuż stan ładowania podczas usuwania.

7. **Stworzenie strony Astro:** ✅
   - Utwórz `src/pages/measurements.astro`.
   - Dodaj sprawdzenie sesji (middleware).
   - Wyrenderuj `MeasurementsDashboard` jako `<MeasurementsDashboard client:load />`.

8. **Testowanie manualne:** ⏳
   - Sprawdź dodawanie pomiaru z dzisiejszą datą.
   - Sprawdź dodawanie pomiaru z datą wsteczną.
   - Sprawdź usuwanie pomiaru z potwierdzeniem.
   - Sprawdź anulowanie usuwania.
   - Zweryfikuj poprawność wykresu.
   - Sprawdź walidację błędnych danych.
