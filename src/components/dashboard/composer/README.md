# Modal Dodawania Posiłku (AI Meal Composer)

Zestaw komponentów do interaktywnego dodawania posiłków z wykorzystaniem AI. Umożliwia multimodalne wprowadzanie danych (tekst + zdjęcia), analizę przez AI, interaktywną korektę oraz zapis do bazy.

## Struktura komponentów

```
composer/
├── AddMealDialog.tsx          # Główny kontener (orkiestrator)
├── MealInputView.tsx          # Widok wejściowy (tekst + zdjęcia)
├── AnalysisLoadingView.tsx    # Ekran ładowania podczas analizy AI
├── MealReviewView.tsx         # Widok weryfikacji i edycji
├── AIResponseSummary.tsx      # Dymek z komentarzem AI
├── MacroEditableStats.tsx     # Edytowalne pola makroskładników
├── RefineInputBar.tsx         # Pasek do korekt AI
├── InteractionHistory.tsx     # Historia czatu user-AI
├── useMealComposer.ts         # Custom hook - logika biznesowa
├── types.ts                   # Typy TypeScript
└── index.ts                   # Eksporty
```

## Użycie

### Podstawowa implementacja

```tsx
import { AddMealDialog } from '@/components/dashboard/composer';

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);

  const handleMealSaved = () => {
    // Odśwież listę posiłków
    refetchMeals();
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Dodaj posiłek</button>
      
      <AddMealDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleMealSaved}
      />
    </>
  );
}
```

## API komponentów

### AddMealDialog

Główny kontener modala. Automatycznie wybiera Dialog (desktop) lub Drawer (mobile).

**Props:**
- `isOpen: boolean` - Stan widoczności modala
- `onClose: () => void` - Callback zamknięcia modala
- `onSuccess?: () => void` - Callback po udanym zapisie posiłku

**Funkcjonalności:**
- Automatyczne przełączanie Dialog/Drawer na podstawie rozmiaru ekranu
- Potwierdzenie zamknięcia przy niezapisanych zmianach
- Toast notifications dla błędów i sukcesu
- Reset stanu po zamknięciu

### MealInputView

Formularz wejściowy do wprowadzania opisu i zdjęć posiłku.

**Props:**
- `initialText?: string` - Początkowa wartość tekstu
- `initialImages?: string[]` - Początkowe zdjęcia (base64)
- `onSubmit: (text: string, images: string[]) => void` - Callback wysłania
- `isSubmitting: boolean` - Stan ładowania

**Walidacja:**
- Minimum 2 znaki w opisie LUB przynajmniej 1 zdjęcie
- Maksymalnie 5 zdjęć
- Akceptowane formaty: JPG, PNG, WEBP

### MealReviewView

Widok weryfikacji wyników analizy AI z możliwością edycji i korekty.

**Props:**
- `candidate: MealCandidateViewModel` - Dane posiłku do weryfikacji
- `interactions: InteractionLog[]` - Historia interakcji user-AI
- `onRefine: (prompt: string) => Promise<void>` - Callback korekty AI
- `onSave: () => Promise<void>` - Callback zapisu
- `onCancel: () => void` - Callback anulowania
- `onManualChange: (field, value) => void` - Callback ręcznej edycji
- `isRefining: boolean` - Stan korekty AI
- `isSaving: boolean` - Stan zapisywania

## Hook: useMealComposer

Custom hook zarządzający całą logiką biznesową procesu dodawania posiłku.

### Użycie

```tsx
const {
  status,           // 'idle' | 'analyzing' | 'refining' | 'review' | 'saving' | 'success'
  inputText,        // Tekst z inputa
  selectedImages,   // Wybrane zdjęcia (base64[])
  candidate,        // Dane posiłku po analizie
  interactions,     // Historia czatu
  error,            // Komunikat błędu
  setInputText,     // Ustawienie tekstu
  setSelectedImages,// Ustawienie zdjęć
  analyze,          // Analiza posiłku przez AI
  refine,           // Korekta przez AI
  updateCandidate,  // Ręczna edycja pól
  save,             // Zapis do bazy
  reset,            // Reset stanu
} = useMealComposer(onSuccess);
```

### Stany procesu (ComposerStatus)

1. **idle** - Oczekiwanie na input użytkownika
2. **analyzing** - Analiza przez AI (POST /api/ai/analyze)
3. **review** - Weryfikacja wyników, edycja
4. **refining** - Korekta przez AI (POST /api/ai/refine)
5. **saving** - Zapis do bazy (POST /api/meals)
6. **success** - Sukces (krótkotrwały stan przed reset)

### Integracja API

Hook automatycznie wywołuje następujące endpointy:

#### 1. Analiza (Analyze)
- **Endpoint:** `POST /api/ai/analyze`
- **Request:**
  ```typescript
  {
    text_prompt: string;
    images?: string[]; // base64
  }
  ```
- **Response:** `AnalyzeMealResponse`

#### 2. Korekta (Refine)
- **Endpoint:** `POST /api/ai/refine`
- **Request:**
  ```typescript
  {
    previous_context: Json;
    correction_prompt: string;
  }
  ```
- **Response:** `AnalyzeMealResponse`

#### 3. Zapis (Create)
- **Endpoint:** `POST /api/meals`
- **Request:** `CreateMealCommand`
- **Response:** `Meal`

## Typy

### ComposerStatus
```typescript
type ComposerStatus = 'idle' | 'analyzing' | 'refining' | 'review' | 'saving' | 'success';
```

### MealCandidateViewModel
```typescript
interface MealCandidateViewModel {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  ai_suggestion: string | null;
  assistant_response: string | null;
  ai_context: any;
  original_prompt: string;
  is_image_analyzed: boolean;
  consumed_at: string; // ISO Date
}
```

### InteractionLog
```typescript
interface InteractionLog {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

## Przepływ użytkownika

1. **Otwarcie modala** - Użytkownik klika FAB "+"
2. **Input** - Wpisuje opis ("Jajecznica z dwóch jajek") i/lub dodaje zdjęcia
3. **Analiza** - Klika "Analizuj", widzi skeleton loading
4. **Review** - AI wypełnia formularz, pokazuje dymek z komentarzem
5. **Korekta (opcjonalnie)**:
   - Użytkownik może ręcznie edytować wartości
   - Lub wpisać korektę dla AI: "zmień masło na olej"
6. **Zapis** - Klika "Zapisz posiłek"
7. **Sukces** - Toast + zamknięcie modala + odświeżenie dashboardu

## Obsługa błędów

Hook automatycznie obsługuje błędy:
- **Błąd analizy** - Toast + powrót do stanu `idle` z zachowanym inputem
- **Błąd korekty** - Toast + pozostanie w stanie `review` z poprzednimi danymi
- **Błąd zapisu** - Toast + pozostanie w `review`, aby użytkownik nie stracił danych

## Walidacja

### Przed analizą:
- Tekst: min. 2 znaki LUB przynajmniej 1 zdjęcie
- Zdjęcia: max 5, formaty JPG/PNG/WEBP

### Przed zapisem:
- Nazwa: niepusta
- Makroskładniki: wartości >= 0
- Data: prawidłowa data/czas (domyślnie `new Date()`)

## Responsywność

Komponenty automatycznie dostosowują się do rozmiaru ekranu:
- **Desktop (>768px)**: Dialog z `max-w-2xl`
- **Mobile (≤768px)**: Drawer od dołu ekranu, `max-h-[70vh]`

## Toast Notifications

Wymagana integracja `ToastProvider` w głównym layoutcie:

```tsx
// Layout.astro
import { ToastProvider } from '../components/ToastProvider';

<body>
  <slot />
  <ToastProvider client:load />
</body>
```

## Przykłady

### Pełny przepływ z hookiem

```tsx
function CustomMealComposer() {
  const {
    status,
    candidate,
    analyze,
    save,
  } = useMealComposer(() => console.log('Saved!'));

  if (status === 'idle') {
    return <button onClick={() => analyze('Jajecznica', [])}>Analizuj</button>;
  }

  if (status === 'review' && candidate) {
    return (
      <div>
        <h2>{candidate.name}</h2>
        <p>Kalorie: {candidate.calories}</p>
        <button onClick={save}>Zapisz</button>
      </div>
    );
  }

  return <p>Ładowanie...</p>;
}
```

## Zależności

- `@/components/ui/dialog` - shadcn/ui
- `@/components/ui/drawer` - shadcn/ui (vaul)
- `@/components/ui/input` - shadcn/ui
- `@/components/ui/textarea` - shadcn/ui
- `@/components/ui/button` - shadcn/ui
- `@/components/ui/label` - shadcn/ui
- `@/components/ui/skeleton` - shadcn/ui
- `sonner` - Toast notifications
- `lucide-react` - Ikony

## Optymalizacje wydajności

- Konwersja zdjęć do Base64 jest asynchroniczna
- Hook używa `useCallback` dla stabilności referencji
- Komponenty używają `React.memo` gdzie to potrzebne
- Obrazy są kompresowane przed wysłaniem (przez API)

## Dostępność (a11y)

- Wszystkie interaktywne elementy mają odpowiednie `aria-label`
- Formularze są powiązane z `label` przez `htmlFor`
- Obsługa klawiatury: Enter w `RefineInputBar`
- Focus management w modalach (automatyczne przez Dialog/Drawer)

## TODO / Możliwe rozszerzenia

- [ ] Dodanie obsługi głosu (Web Speech API)
- [ ] Zapisywanie drafts w localStorage
- [ ] Historia ostatnio dodanych posiłków (quick add)
- [ ] Skanowanie kodów kreskowych
- [ ] Integracja z bazą produktów
- [ ] Batch add (wiele posiłków na raz)
