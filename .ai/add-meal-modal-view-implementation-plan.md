# Plan implementacji widoku Modal Dodawania Posiłku (AI Meal Composer)

## 1. Przegląd
Widok "Modal Dodawania Posiłku" to centralny punkt interakcji użytkownika z AI w aplikacji MacroSpy. Umożliwia on multimodalne (tekst + zdjęcia) wprowadzanie danych o posiłkach, ich analizę przez model `grok-4.1-fast`, interaktywną korektę (refinement) oraz ostateczne zapisanie zweryfikowanych danych do bazy. Widok działa jako nakładka (Dialog/Drawer) dostępna z poziomu Dashboardu.

## 2. Routing widoku
Widok nie posiada dedykowanej ścieżki URL (route). Jest to komponent typu Modal/Dialog renderowany warunkowo wewnątrz layoutu lub na stronie głównej (`/`), wywoływany przyciskiem FAB (Floating Action Button).

## 3. Struktura komponentów
Głównym kontenerem jest `AddMealDialog`. Zarządza on maszyną stanów (Input -> Analyzing -> Review/Refine -> Saving).

```text
AddMealDialog (Smart Component)
├── DialogContent / DrawerContent
│   ├── MealInputView (State: IDLE)
│   │   ├── MediaUploader (Zdjęcia)
│   │   └── TextInputArea (Opis)
│   ├── AnalysisLoadingView (State: ANALYZING)
│   │   └── SkeletonLoader
│   └── MealReviewView (State: REVIEW)
│       ├── AIResponseSummary (Dymek z komentarzem AI)
│       ├── MacroEditableStats (Edytowalne pola makro)
│       ├── RefineInputBar (Pasek korekty AI)
│       └── ActionButtons (Anuluj / Zapisz)
└── Toaster (dla powiadomień)
```

## 4. Szczegóły komponentów

### `AddMealDialog` (Container)
- **Opis**: Główny orkiestrator. Zarządza stanem widoczności modala (otwarcie/zamknięcie) oraz logiką biznesową (hook `useMealComposer`).
- **Główne elementy**: `Dialog` (Desktop) / `Drawer` (Mobile) z `shadcn/ui`.
- **Obsługiwane interakcje**: Zamykanie modala (z potwierdzeniem, jeśli są niezapisane dane), przełączanie widoków na podstawie stanu.
- **Typy**: `ComposerState` ('idle', 'analyzing', 'review', 'saving').
- **Propsy**: `isOpen: boolean`, `onClose: () => void`.

### `MealInputView`
- **Opis**: Ekran początkowy. Pozwala na wpisanie tekstu i dodanie zdjęć.
- **Główne elementy**: `Textarea`, `Input type="file"`, podgląd miniatur zdjęć z przyciskiem usuwania.
- **Obsługiwane interakcje**:
    - Wpisanie tekstu.
    - Wybór zdjęć (wielokrotny).
    - Usunięcie zdjęcia.
    - Submit -> przejście do analizy.
- **Walidacja**: Wymagane minimum 2 znaki w opisie LUB przynajmniej 1 zdjęcie. Maksymalnie 5 zdjęć.
- **Propsy**: `onSubmit: (text: string, images: string[]) => void`, `isSubmitting: boolean`.

### `AnalysisLoadingView`
- **Opis**: Ekran oczekiwania na odpowiedź AI.
- **Główne elementy**: Animowany `Skeleton` odwzorowujący układ formularza, tekst "AI analizuje Twój posiłek...".
- **Propsy**: Brak (komponent prezentacyjny).

### `MealReviewView`
- **Opis**: Ekran weryfikacji. Wyświetla wyniki analizy i pozwala na ich korektę (ręczną lub przez AI).
- **Główne elementy**:
    - `Input` (Nazwa posiłku).
    - `NumberInput` (Kalorie, Białko, Tłuszcze, Węglowodany, Błonnik).
    - Sekcja Czat/Refine (historia zmian + input).
- **Obsługiwane interakcje**:
    - Ręczna edycja wartości liczbowych (aktualizuje stan lokalny).
    - Wpisanie komendy korekcyjnej (np. "bez masła") -> wywołuje API `refine` -> aktualizuje wartości.
    - Zapisz -> wywołuje API `create`.
- **Walidacja**: Wartości numeryczne muszą być nieujemne. Nazwa wymagana.
- **Propsy**:
    - `mealCandidate`: `MealCandidateViewModel`.
    - `onRefine`: `(prompt: string) => Promise<void>`.
    - `onSave`: `() => Promise<void>`.
    - `onManualChange`: `(field: keyof MealCandidateViewModel, value: any) => void`.

## 5. Typy

Wymagane zdefiniowanie w `src/components/dashboard/composer/types.ts`:

```typescript
// Stan procesu
export type ComposerStatus = 'idle' | 'analyzing' | 'refining' | 'review' | 'saving' | 'success';

// Model widoku dla edytowanego posiłku
export interface MealCandidateViewModel {
  name: string;
  calories: number; // float
  protein: number;  // float
  fat: number;      // float
  carbs: number;    // float
  fiber: number;    // float
  ai_suggestion: string | null;
  assistant_response: string | null; // Ostatnia odpowiedź AI
  ai_context: any; // Blob JSON potrzebny do endpointu refine
  original_prompt: string;
  is_image_analyzed: boolean;
  consumed_at: string; // ISO Date
}

// Historia interakcji (do wyświetlenia w sekcji Refine)
export interface InteractionLog {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

## 6. Zarządzanie stanem

Logika zostanie wydzielona do customowego hooka `useMealComposer` w `src/components/dashboard/composer/useMealComposer.ts`.

**Stan hooka:**
- `status`: `ComposerStatus`
- `inputText`: string
- `selectedImages`: string[] (base64)
- `candidate`: `MealCandidateViewModel | null`
- `interactions`: `InteractionLog[]`
- `error`: string | null

**Metody hooka:**
- `analyze(text, images)`: Wywołuje `POST /api/ai/analyze`. Ustawia `candidate`.
- `refine(prompt)`: Wywołuje `POST /api/ai/refine` z `ai_context`. Aktualizuje `candidate` i `interactions`.
- `updateCandidate(field, value)`: Obsługa ręcznej edycji pól.
- `save()`: Wywołuje `POST /api/meals`. Emituje zdarzenie odświeżenia dashboardu.
- `reset()`: Czyści stan do domyślnego.

## 7. Integracja API

### 1. Analiza (Analyze)
- **Endpoint**: `POST /api/ai/analyze`
- **Żądanie**:
  ```typescript
  {
    text_prompt: string;
    images?: string[]; // array of base64 strings
  }
  ```
- **Odpowiedź**: `AnalyzeMealResponse` (zgodnie z `src/types.ts`).

### 2. Korekta (Refine)
- **Endpoint**: `POST /api/ai/refine`
- **Żądanie**:
  ```typescript
  {
    previous_context: any; // json from candidate.ai_context
    correction_prompt: string;
  }
  ```
- **Odpowiedź**: `AnalyzeMealResponse` (zaktualizowane makro i kontekst).

### 3. Zapis (Create)
- **Endpoint**: `POST /api/meals`
- **Żądanie**: `CreateMealCommand` (zgodnie z `src/types.ts`).
- **Odpowiedź**: `Meal` (zapisany obiekt).

## 8. Interakcje użytkownika

1. **Otwarcie**: Użytkownik klika "+" na Dashboardzie. Otwiera się Dialog w stanie `IDLE`.
2. **Input**: Użytkownik wpisuje "Jajecznica" i opcjonalnie dodaje zdjęcie.
3. **Analiza**: Użytkownik klika "Analizuj". UI blokuje się, pokazuje Skeleton.
4. **Wynik**: UI przechodzi do `REVIEW`. Pola formularza wypełniają się danymi z AI. Pojawia się dymek z komentarzem asystenta.
5. **Korekta (Refine)**:
   - Użytkownik widzi, że AI przyjęło "masło", a było na oleju.
   - Wpisuje w dolnym pasku: "zmień masło na olej rzepakowy".
   - Stan zmienia się na `REFINING` (lokalny loading).
   - Wartości makro aktualizują się, dymek asystenta zmienia treść.
6. **Edycja ręczna**: Użytkownik widzi, że gramatura jajecznicy to 200g, a nie 150g. Ręcznie zmienia kalorie w inputcie numerycznym.
7. **Zapis**: Użytkownik klika "Zapisz". Dane trafiają do bazy. Modal zamyka się. Toast informuje o sukcesie. Dashboard odświeża listę.

## 9. Warunki i walidacja

- **Przed analizą**:
  - `Input`: Musi zawierać tekst (>2 znaki) LUB zdjęcie.
  - `Images`: Max 5 zdjęć, formaty jpg/png/webp.
- **Przed zapisem**:
  - `Name`: Niepuste.
  - `Macros`: Wartości >= 0.
  - `Date`: Prawidłowa data/czas (domyślnie `new Date()`).
- **Blokady**: Przycisk "Zapisz" zablokowany podczas trwania requestu (`isSubmitting`).

## 10. Obsługa błędów

- **Błąd analizy AI**: Wyświetlenie komunikatu błędu wewnątrz modala (np. "Nie udało się przeanalizować posiłku. Spróbuj ponownie."). Powrót do stanu `IDLE` z zachowanym inputem.
- **Błąd korekty (Refine)**: Toast z błędem ("Nie udało się zaktualizować posiłku"), zachowanie poprzedniego stanu `candidate`.
- **Błąd zapisu**: Toast z błędem ("Błąd połączenia"), formularz pozostaje otwarty, aby użytkownik nie stracił danych.

## 11. Kroki implementacji

1. **Setup struktur**: Stworzenie katalogu `src/components/dashboard/composer` i plików `types.ts`, `useMealComposer.ts`.
2. **Implementacja Hooka**: Napisanie logiki `useMealComposer` z mockowanymi wywołaniami API na początek.
3. **Komponent InputView**: Implementacja formularza wejściowego z obsługą plików (konwersja File -> Base64).
4. **Komponent ReviewView**: Implementacja widoku podsumowania z edytowalnymi inputami i sekcją czatu.
5. **Integracja API**: Podpięcie rzeczywistych endpointów `/api/ai/*` oraz `/api/meals` w hooku.
6. **Kontener Dialog**: Złożenie wszystkiego w `AddMealDialog` i podpięcie pod przycisk na Dashboardzie.
7. **Obsługa zdarzeń**: Dodanie event listenera lub contextu do odświeżania listy posiłków po dodaniu.
8. **Stylowanie i UX**: Dopracowanie animacji (Skeleton) i responsywności (Dialog vs Drawer).
9. **Testy manualne**: Przejście pełnej ścieżki: Tekst -> Analiza -> Korekta -> Zapis.
