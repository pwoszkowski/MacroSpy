# Profile Components

Komponenty widoku profilu użytkownika - zarządzanie danymi biometrycznymi, celami dietetycznymi i ustawieniami aplikacji.

## Struktura komponentów

### ProfileView
Główny kontener widoku profilu. Zarządza stanem danych użytkownika i obsługuje komunikację z API.

**Funkcjonalność:**
- Pobiera dane użytkownika z `/api/profile/me`
- Wyświetla zakładki: Dane profilowe, Cele dietetyczne, Ustawienia
- Obsługuje zapisywanie zmian przez API
- Wyświetla loading states i błędy

### BioDataForm
Formularz edycji danych biometrycznych użytkownika.

**Pola:**
- Wzrost (cm) - liczba całkowita, zakres 50-300
- Płeć - select (Mężczyzna/Kobieta)
- Data urodzenia - input date, wiek 10-120 lat

**Props:**
- `initialData: ProfileDto` - dane początkowe
- `onSave: (data: UpdateProfileCommand) => Promise<void>` - callback zapisu

### DietaryGoalsForm
Formularz ustawiania celów makroskładnikowych.

**Pola:**
- Kalorie (kcal) - zakres 500-10000
- Białko (g) - liczba nieujemna
- Tłuszcz (g) - liczba nieujemna
- Węglowodany (g) - liczba nieujemna
- Błonnik (g) - opcjonalne, liczba nieujemna

**Funkcjonalność:**
- Przycisk otwierający TdeeCalculatorDialog
- Automatyczne wypełnianie pól wynikami z kalkulatora
- Dodawanie `start_date` (dzisiaj) przy zapisie

**Props:**
- `initialGoal: DietaryGoalDto | null` - aktualne cele
- `userProfile: ProfileDto` - dane profilu (do kalkulatora)
- `onSave: (data: SetDietaryGoalCommand) => Promise<void>` - callback zapisu

### TdeeCalculatorDialog
Modal obliczający dzienne zapotrzebowanie kaloryczne (TDEE).

**Funkcjonalność:**
- Pobiera dane biometryczne z profilu (wzrost, płeć, wiek)
- Pyta użytkownika o wagę i poziom aktywności
- Wysyła zapytanie do `/api/ai/calculate-tdee`
- Wyświetla wyniki: BMR, TDEE, sugerowane cele makro
- Przekazuje wyniki do formularza celów przez callback

**Props:**
- `profile: ProfileDto` - dane profilu
- `onApply: (targets: GoalTargets) => void` - callback aplikacji wyników
- `trigger?: React.ReactNode` - opcjonalny custom trigger button

### SettingsForm
Formularz ustawień aplikacji.

**Funkcjonalność:**
- Wybór motywu (Jasny/Ciemny/Systemowy)
- Natychmiastowa zmiana wyglądu bez przeładowania
- Zapisywanie preferencji w localStorage

## Custom Hooks

### useProfileData
Hook do pobierania i zarządzania danymi profilu użytkownika.

**Zwraca:**
```typescript
{
  profile: ProfileDto | null;
  currentGoal: DietaryGoalDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

### useTheme
Hook do zarządzania motywem aplikacji (w `src/components/hooks`).

**Zwraca:**
```typescript
{
  theme: "light" | "dark" | "system";
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}
```

## Walidacja (schemas.ts)

### bioDataSchema
Walidacja danych biometrycznych z użyciem Zod:
- `height`: 50-300 cm
- `gender`: "male" | "female"
- `birth_date`: YYYY-MM-DD, wiek 10-120 lat

### dietaryGoalsSchema
Walidacja celów dietetycznych:
- `calories_target`: 500-10000 kcal
- `protein_target`, `fat_target`, `carbs_target`: >= 0
- `fiber_target`: >= 0 (opcjonalne)

### calculatorInputsSchema
Walidacja inputów kalkulatora TDEE:
- `weight`: 20-300 kg
- `activity_level`: enum z 5 wartości

## API Integration

### Endpointy

**GET /api/profile/me**
- Pobiera profil użytkownika i aktywny cel dietetyczny
- Response: `UserProfileResponse`

**PUT /api/profile**
- Aktualizuje dane profilu
- Body: `UpdateProfileCommand`

**POST /api/goals**
- Tworzy nowy rekord celów dietetycznych
- Body: `SetDietaryGoalCommand` (z `start_date`)

**POST /api/ai/calculate-tdee**
- Oblicza TDEE na podstawie danych biometrycznych
- Body: `TDEECalculationRequest`
- Response: `TDEECalculationResponse`

## Wzorce użycia

### Podstawowe użycie
```tsx
import { ProfileView } from "@/components/profile";

// W stronie Astro
<ProfileView client:load />
```

### Użycie kalkulatora jako standalone
```tsx
import { TdeeCalculatorDialog } from "@/components/profile";

<TdeeCalculatorDialog
  profile={userProfile}
  onApply={(targets) => {
    // Obsługa wyników
    console.log(targets.calories, targets.protein, ...);
  }}
/>
```

### Użycie hooka motywu
```tsx
import { useTheme } from "@/components/hooks";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme("dark")}>
      Tryb ciemny
    </button>
  );
}
```

## Notatki

- Dane profilu są pobierane po stronie klienta dla lepszej interaktywności
- Formularz celów automatycznie dodaje dzisiejszą datę jako `start_date`
- Kalkulator TDEE wymaga wypełnionych danych biometrycznych w profilu
- Motyw jest inicjalizowany w `Layout.astro` aby uniknąć flashowania
- Wszystkie zmiany wyświetlają toast notifications
