# Plan implementacji widoku Modal Dodawania Posiłku (AI Meal Composer)

## 1. Przegląd

Widok "Modal Dodawania Posiłku" to centralny punkt interakcji użytkownika w aplikacji MacroSpy. Umożliwia on:

- **Tryb AI**: Multimodalne (tekst + zdjęcia) wprowadzanie danych, analiza przez model `grok-4.1-fast`, interaktywna korekta (refinement).
- **Tryb ręczny**: Bezpośrednie wprowadzanie nazwy posiłku i wartości makroskładników bez użycia AI.

Widok działa jako nakładka (Dialog/Drawer) dostępna z poziomu Dashboardu.

## 2. Routing widoku

Widok nie posiada dedykowanej ścieżki URL (route). Jest to komponent typu Modal/Dialog renderowany warunkowo wewnątrz layoutu lub na stronie głównej (`/`), wywoływany przyciskiem FAB (Floating Action Button).

## 3. Struktura komponentów

Głównym kontenerem jest `AddMealDialog`. Zarządza on maszyną stanów (Input -> Analyzing -> Review/Refine -> Saving).

```text
AddMealDialog (Smart Component)
├── DialogContent / DrawerContent
│   ├── MealInputView (State: IDLE)
│   │   ├── ModeSwitch (Przełącznik: AI / Manual)
│   │   ├── [Tryb AI]
│   │   │   ├── MediaUploader (Zdjęcia)
│   │   │   └── TextInputArea (Opis)
│   │   └── [Tryb Manual]
│   │       └── ManualEntryForm (Formularz ręczny)
│   ├── AnalysisLoadingView (State: ANALYZING - tylko tryb AI)
│   │   └── SkeletonLoader
│   └── MealReviewView (State: REVIEW)
│       ├── [Wspólne]
│       │   ├── MacroEditableStats (Edytowalne pola makro)
│       │   └── ActionButtons (Anuluj / Zapisz)
│       ├── [Tylko tryb AI]
│       │   ├── AIResponseSummary (Dymek z komentarzem AI)
│       │   ├── InteractionHistory (Historia czatu)
│       │   └── RefineInputBar (Pasek korekty AI)
│       └── [Tylko tryb Manual]
│           └── ManualEntryNotice (Informacja o ręcznym wpisie)
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

- **Opis**: Ekran początkowy z przełącznikiem trybów (AI / Manual). Wyświetla odpowiedni formularz w zależności od wybranego trybu.
- **Główne elementy**:
  - Przełącznik trybu (`Button` group z ikonami Sparkles/Edit3)
  - **Tryb AI**: `Textarea`, `Input type="file"`, podgląd miniatur zdjęć z przyciskiem usuwania
  - **Tryb Manual**: Komponent `ManualEntryForm`
- **Obsługiwane interakcje**:
  - Przełączanie między trybami (AI ↔ Manual)
  - **Tryb AI**:
    - Wpisanie tekstu
    - Wybór zdjęć (wielokrotny)
    - Usunięcie zdjęcia
    - Submit -> przejście do analizy AI
  - **Tryb Manual**:
    - Wypełnienie formularza ręcznego
    - Submit -> przejście bezpośrednio do review (pominięcie analizy)
- **Walidacja**:
  - **Tryb AI**: Minimum 2 znaki w opisie LUB przynajmniej 1 zdjęcie. Maksymalnie 5 zdjęć.
  - **Tryb Manual**: Nazwa min. 2 znaki, wartości >= 0.
- **Propsy**:
  - `onSubmit: (text: string, images: string[]) => void` - callback analizy AI
  - `onManualSubmit: (data: ManualEntryData) => void` - callback ręcznego wprowadzenia
  - `isSubmitting: boolean`

### `ManualEntryForm`

- **Opis**: Formularz do bezpośredniego wprowadzania nazwy posiłku i wartości makroskładników.
- **Główne elementy**:
  - Input (Nazwa posiłku)
  - Number inputs (Kalorie, Białko, Tłuszcze, Węglowodany, Błonnik)
  - Przycisk "Przejdź do podsumowania"
- **Obsługiwane interakcje**:
  - Wpisanie nazwy
  - Wprowadzanie wartości liczbowych (z walidacją >= 0)
  - Submit -> przejście do review
- **Walidacja**: Nazwa min. 2 znaki, wszystkie wartości >= 0
- **Propsy**:
  - `onSubmit: (data: ManualEntryData) => void`
  - `isSubmitting: boolean`

### `AnalysisLoadingView`

- **Opis**: Ekran oczekiwania na odpowiedź AI.
- **Główne elementy**: Animowany `Skeleton` odwzorowujący układ formularza, tekst "AI analizuje Twój posiłek...".
- **Propsy**: Brak (komponent prezentacyjny).

### `MealReviewView`

- **Opis**: Ekran weryfikacji. Wyświetla dane do sprawdzenia i pozwala na ich korektę (ręczną lub przez AI - tylko dla wpisów z AI).
- **Główne elementy**:
  - `Input` (Nazwa posiłku)
  - `NumberInput` (Kalorie, Białko, Tłuszcze, Węglowodany, Błonnik)
  - **Dla wpisów z AI**:
    - Dymek z odpowiedzią AI (`AIResponseSummary`)
    - Historia interakcji (`InteractionHistory`)
    - Sekcja Czat/Refine (`RefineInputBar`)
  - **Dla wpisów ręcznych**:
    - Informacja tekstowa: "Posiłek dodany ręcznie. Sprawdź wartości przed zapisem."
- **Obsługiwane interakcje**:
  - Ręczna edycja wartości liczbowych (aktualizuje stan lokalny)
  - **Tylko wpisy z AI**:
    - Wpisanie komendy korekcyjnej (np. "bez masła") -> wywołuje API `refine` -> aktualizuje wartości
    - Przeglądanie historii interakcji
  - Zapisz -> wywołuje API `create`
  - Anuluj -> zamyka modal (z potwierdzeniem)
- **Walidacja**: Wartości numeryczne muszą być nieujemne. Nazwa wymagana.
- **Propsy**:
  - `mealCandidate`: `MealCandidateViewModel`
  - `interactions`: `InteractionLog[]`
  - `onRefine`: `(prompt: string) => Promise<void>`
  - `onSave`: `() => Promise<void>`
  - `onCancel`: `() => void`
  - `onManualChange`: `(field: keyof MealCandidateViewModel, value: any) => void`
  - `isRefining`: `boolean`
  - `isSaving`: `boolean`

## 5. Typy

Wymagane zdefiniowanie w `src/components/dashboard/composer/types.ts`:

```typescript
// Stan procesu
export type ComposerStatus = "idle" | "analyzing" | "refining" | "review" | "saving" | "success";

// Model widoku dla edytowanego posiłku
export interface MealCandidateViewModel {
  name: string;
  calories: number; // float
  protein: number; // float
  fat: number; // float
  carbs: number; // float
  fiber: number; // float
  ai_suggestion: string | null;
  assistant_response: string | null; // Ostatnia odpowiedź AI (null dla ręcznych wpisów)
  ai_context: any; // Blob JSON potrzebny do endpointu refine (null dla ręcznych wpisów)
  original_prompt: string;
  is_image_analyzed: boolean;
  consumed_at: string; // ISO Date
}

// Historia interakcji (do wyświetlenia w sekcji Refine)
export interface InteractionLog {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Dane z ręcznego wprowadzenia
export interface ManualEntryData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
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

- `analyze(text, images)`: Wywołuje `POST /api/ai/analyze`. Ustawia `candidate`. (Tylko tryb AI)
- `createManualEntry(data)`: Tworzy `candidate` z danych ręcznych, pomija analizę AI, przechodzi do stanu 'review'. (Tylko tryb Manual)
- `refine(prompt)`: Wywołuje `POST /api/ai/refine` z `ai_context`. Aktualizuje `candidate` i `interactions`. (Tylko tryb AI)
- `updateCandidate(field, value)`: Obsługa ręcznej edycji pól. (Oba tryby)
- `save()`: Wywołuje `POST /api/meals`. Emituje zdarzenie odświeżenia dashboardu. (Oba tryby)
- `reset()`: Czyści stan do domyślnego. (Oba tryby)

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

### Scenariusz A: Tryb AI (z analizą)

1. **Otwarcie**: Użytkownik klika "+" na Dashboardzie. Otwiera się Dialog w stanie `IDLE`.
2. **Wybór trybu**: Domyślnie aktywny tryb "Analiza AI".
3. **Input**: Użytkownik wpisuje "Jajecznica" i opcjonalnie dodaje zdjęcie.
4. **Analiza**: Użytkownik klika "Analizuj". UI blokuje się, pokazuje Skeleton.
5. **Wynik**: UI przechodzi do `REVIEW`. Pola formularza wypełniają się danymi z AI. Pojawia się dymek z komentarzem asystenta.
6. **Korekta (Refine)**:
   - Użytkownik widzi, że AI przyjęło "masło", a było na oleju.
   - Wpisuje w dolnym pasku: "zmień masło na olej rzepakowy".
   - Stan zmienia się na `REFINING` (lokalny loading).
   - Wartości makro aktualizują się, dymek asystenta zmienia treść.
   - Historia interakcji wyświetla wymianę zdań.
7. **Edycja ręczna**: Użytkownik widzi, że gramatura jajecznicy to 200g, a nie 150g. Ręcznie zmienia kalorie w inputcie numerycznym.
8. **Zapis**: Użytkownik klika "Zapisz". Dane trafiają do bazy. Modal zamyka się. Toast informuje o sukcesie. Dashboard odświeża listę.

### Scenariusz B: Tryb ręczny (bez AI)

1. **Otwarcie**: Użytkownik klika "+" na Dashboardzie. Otwiera się Dialog w stanie `IDLE`.
2. **Wybór trybu**: Użytkownik przełącza na tryb "Ręczne dodanie".
3. **Input**: Użytkownik wypełnia formularz:
   - Nazwa: "Ser żółty 100g"
   - Kalorie: 400
   - Białko: 25g
   - Tłuszcze: 33g
   - Węglowodany: 0g
   - Błonnik: 0g
4. **Przejście**: Użytkownik klika "Przejdź do podsumowania". UI przechodzi do stanu `REVIEW`.
5. **Weryfikacja**:
   - Formularz wypełniony wprowadzonymi danymi.
   - Widoczna informacja: "Posiłek dodany ręcznie. Sprawdź wartości przed zapisem."
   - Brak dymku AI, brak sekcji refine.
   - Użytkownik może ręcznie skorygować wartości.
6. **Zapis**: Użytkownik klika "Zapisz". Dane trafiają do bazy. Modal zamyka się. Toast informuje o sukcesie. Dashboard odświeża listę.

## 9. Warunki i walidacja

- **Przed analizą (tryb AI)**:
  - `Input`: Musi zawierać tekst (>2 znaki) LUB zdjęcie.
  - `Images`: Max 5 zdjęć, formaty jpg/png/webp.
- **Przed przejściem do review (tryb Manual)**:
  - `Name`: Min. 2 znaki.
  - `Macros`: Wartości >= 0.
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
2. **Implementacja Hooka**: Napisanie logiki `useMealComposer` z metodami `analyze()` i `createManualEntry()`.
3. **Komponent ManualEntryForm**: Implementacja formularza ręcznego wprowadzania danych.
4. **Komponent InputView**: Implementacja formularza wejściowego z przełącznikiem trybów i obsługą plików (konwersja File -> Base64).
5. **Komponent ReviewView**: Implementacja widoku podsumowania z edytowalnymi inputami, sekcją czatu (dla AI) i informacją o ręcznym wpisie.
6. **Integracja API**: Podpięcie rzeczywistych endpointów `/api/ai/*` oraz `/api/meals` w hooku.
7. **Kontener Dialog**: Złożenie wszystkiego w `AddMealDialog` i podpięcie pod przycisk na Dashboardzie.
8. **Obsługa zdarzeń**: Dodanie event listenera lub contextu do odświeżania listy posiłków po dodaniu.
9. **Stylowanie i UX**: Dopracowanie animacji (Skeleton), responsywności (Dialog vs Drawer) i przełącznika trybów.
10. **Testy manualne**:
    - Ścieżka AI: Tekst -> Analiza -> Korekta -> Zapis
    - Ścieżka Manual: Formularz -> Review -> Zapis
