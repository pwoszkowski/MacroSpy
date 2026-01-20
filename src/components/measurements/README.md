# Measurements Components

Zestaw komponentów do zarządzania pomiarami ciała użytkownika (waga, procent tłuszczu, procent mięśni).

## Struktura

```
measurements/
├── MeasurementsDashboard.tsx      # Główny kontener (entry point)
├── MeasurementsSummary.tsx        # Karty z podsumowaniem (aktualna waga, zmiany)
├── MeasurementsChart.tsx          # Wykres postępów (Recharts)
├── MeasurementLogDialog.tsx       # Modal z formularzem
├── MeasurementForm.tsx            # Formularz dodawania pomiaru
├── MeasurementsHistory.tsx        # Tabela z historią pomiarów
├── useMeasurements.ts             # Custom hook do zarządzania stanem
├── schemas.ts                     # Walidacja Zod
└── index.ts                       # Eksporty
```

## Użycie

### W stronie Astro

```astro
---
import Layout from "../layouts/Layout.astro";
import { MeasurementsDashboard } from "../components/measurements";
---

<Layout title="MacroSpy - Pomiary ciała">
  <MeasurementsDashboard client:load />
</Layout>
```

## Komponenty

### MeasurementsDashboard

Główny kontener zarządzający całym widokiem pomiarów.

**Funkcjonalności:**

- Pobieranie danych z API przy montowaniu
- Zarządzanie stanem modala dodawania pomiaru
- Obsługa błędów i stanów ładowania
- Wyświetlanie szkieletów podczas ładowania

### MeasurementsSummary

Wyświetla kluczowe metryki w formie kart:

- Aktualna waga
- Zmiana wagi (od poprzedniego pomiaru)
- Procent tłuszczu (jeśli dostępny)
- Procent mięśni (jeśli dostępny)

**Props:**

```typescript
interface MeasurementsSummaryProps {
  latest: MeasurementDto | null; // Najnowszy pomiar
  previous: MeasurementDto | null; // Poprzedni pomiar (do obliczenia zmian)
}
```

### MeasurementsChart

Interaktywny wykres postępów z możliwością przełączania między:

- Widok wagi (wykres liniowy wagi w czasie)
- Skład ciała (dwa wykresy: % tłuszczu i % mięśni)

**Props:**

```typescript
interface MeasurementsChartProps {
  data: MeasurementDto[]; // Dane posortowane automatycznie
}
```

**Funkcjonalności:**

- Automatyczne sortowanie danych chronologicznie
- Formatowanie dat na osi X
- Obsługa pustego stanu
- Responsywność
- Przycisk "Skład ciała" jest nieaktywny, jeśli brak danych o składzie
- Wyraźne punkty pomiarowe (białe wypełnienie, kolorowe obramowanie)
- Linie proste między punktami (type="linear")

### MeasurementLogDialog

Modal zawierający formularz dodawania nowego pomiaru.

**Props:**

```typescript
interface MeasurementLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: MeasurementFormValues) => Promise<void>;
}
```

### MeasurementForm

Formularz z walidacją (React Hook Form + Zod).

**Pola:**

- Data (wymagane, domyślnie dzisiaj)
- Waga w kg (wymagane, 20-300 kg)
- Procent tłuszczu (opcjonalne, 0-100%)
- Procent mięśni (opcjonalne, 0-100%)

**Props:**

```typescript
interface MeasurementFormProps {
  onSubmit: (data: MeasurementFormValues) => Promise<void>;
  onCancel: () => void;
}
```

### MeasurementsHistory

Tabela z historią pomiarów oraz możliwością usuwania wpisów.

**Props:**

```typescript
interface MeasurementsHistoryProps {
  data: MeasurementDto[]; // Wyświetlane w kolejności z API (DESC)
  onDelete: (measurementId: string) => Promise<void>; // Callback usuwania
}
```

**Kolumny:**

- Data (formatowana jako "1 stycznia 2026")
- Waga (kg)
- Tłuszcz (%)
- Mięśnie (%)
- Akcje (przycisk usuń)

**Funkcjonalności:**

- Przycisk usuwania (ikona kosza) w każdym wierszu
- AlertDialog z potwierdzeniem przed usunięciem
- Wyświetlanie szczegółów pomiaru w dialogu potwierdzenia
- Stan ładowania podczas usuwania

## Custom Hook

### useMeasurements

Hook zarządzający stanem pomiarów i komunikacją z API.

**Parametry:**

```typescript
useMeasurements(limit?: number)  // Domyślnie: 30
```

**Zwraca:**

```typescript
interface UseMeasurementsReturn {
  measurements: MeasurementDto[];
  isLoading: boolean;
  error: string | null;
  fetchMeasurements: () => Promise<void>;
  addMeasurement: (data: LogMeasurementCommand) => Promise<void>;
  removeMeasurement: (measurementId: string) => Promise<void>;
}
```

**Funkcjonalności:**

- Automatyczne pobieranie danych przy montowaniu
- Automatyczne odświeżanie po dodaniu/usunięciu pomiaru
- Obsługa błędów
- Stany ładowania

## API Client

Funkcje w `src/lib/api.ts`:

```typescript
// Pobieranie pomiarów
getMeasurements(limit?: number): Promise<MeasurementDto[]>

// Dodawanie pomiaru
logMeasurement(command: LogMeasurementCommand): Promise<MeasurementDto>

// Usuwanie pomiaru
deleteMeasurement(measurementId: string): Promise<void>
```

## Walidacja

Schema Zod w `schemas.ts`:

```typescript
const measurementFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  weight: z.number().positive().min(20).max(300), // kg
  body_fat_percentage: z.number().min(0).max(100).optional().nullable(),
  muscle_percentage: z.number().min(0).max(100).optional().nullable(),
});
```

## Integracja z API

Komponenty komunikują się z endpointami:

- `GET /api/measurements?limit=30` - pobieranie historii
- `POST /api/measurements` - dodawanie nowego pomiaru
- `DELETE /api/measurements/[id]` - usuwanie pomiaru

## Toast Notifications

Używa `sonner` do wyświetlania powiadomień:

- Sukces dodania: "Pomiar został zapisany"
- Sukces usunięcia: "Pomiar został usunięty"
- Błąd: Komunikat błędu z API

## Dostępność

- ARIA labels na polach formularza
- aria-invalid dla pól z błędami
- Obsługa klawiatury w dialogu
- Responsywne na różnych urządzeniach
