# API Endpoint Implementation Plan: AI Services

## 1. Przegląd punktów końcowych
Celem jest wdrożenie zestawu trzech endpointów REST API obsługujących funkcje sztucznej inteligencji w aplikacji MacroSpy. Endpointy te odpowiadają za analizę posiłków (z tekstu i zdjęć), ich korektę (refinement) oraz obliczanie zapotrzebowania kalorycznego (TDEE). Wszystkie endpointy komunikują się z modelem `grok-4.1-fast` za pośrednictwem OpenRouter.

## 2. Szczegóły żądania

### A. Analyze Meal
- **Metoda HTTP:** `POST`
- **URL:** `/api/ai/analyze`
- **Walidacja:** Wymagana sesja użytkownika (ochrona zasobów AI).
- **Request Body (JSON):**
  - `text_prompt`: string (wymagane, min. 2 znaki)
  - `images`: string[] (opcjonalne, tablica base64)

### B. Refine Meal
- **Metoda HTTP:** `POST`
- **URL:** `/api/ai/refine`
- **Walidacja:** Wymagana sesja użytkownika.
- **Request Body (JSON):**
  - `previous_context`: object (wymagane, JSON z poprzedniej odpowiedzi AI)
  - `correction_prompt`: string (wymagane, instrukcja korekty)

### C. Calculate TDEE
- **Metoda HTTP:** `POST`
- **URL:** `/api/ai/calculate-tdee`
- **Walidacja:** Publiczny (dostępny dla onboardingu), sugerowany rate-limit.
- **Request Body (JSON):**
  - `gender`: string ('male' | 'female')
  - `weight_kg`: number (> 0)
  - `height_cm`: number (> 0)
  - `age`: number (> 0)
  - `activity_level`: string (enum)

## 3. Wykorzystywane typy
Typy są już zdefiniowane w `src/types.ts`. Należy utworzyć schematy Zod do walidacji w runtime.

**Istniejące interfejsy:**
- `AnalyzeMealRequest`
- `AnalyzeMealResponse`
- `RefineMealRequest`
- `TDEECalculationRequest`
- `TDEECalculationResponse`

## 4. Przepływ danych

### Analyze / Refine
1. **Klient:** Wysyła żądanie z opisem/zdjęciem.
2. **API Handler:**
   - Weryfikuje sesję użytkownika (Supabase Auth).
   - Waliduje dane wejściowe (Zod).
   - Przekazuje dane do `AiService`.
3. **AiService:**
   - Konstruuje prompt systemowy (instrukcje dot. formatu JSON, roli dietetyka).
   - Konstruuje prompt użytkownika (tekst + opcjonalnie obraz).
   - Wysyła zapytanie do OpenRouter (`grok-4.1-fast`).
4. **OpenRouter:** Przetwarza zapytanie i zwraca JSON.
5. **AiService:** Parsuje odpowiedź, obsługuje ewentualne błędy formatowania.
6. **API Handler:** Zwraca ustrukturyzowane dane (`AnalyzeMealResponse`) do klienta.

### Calculate TDEE
1. **Klient:** Wysyła dane biometryczne.
2. **API Handler:** Waliduje dane (Zod).
3. **AiService:**
   - Oblicza BMR i TDEE matematycznie (wzór Mifflin-St Jeor) dla precyzji.
   - Wysyła zapytanie do AI z wynikami BMR/TDEE, prosząc o `suggested_targets` (rozkład makro) i komentarz.
4. **API Handler:** Łączy wyniki obliczeń matematycznych z sugestiami AI i zwraca `TDEECalculationResponse`.

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie:** Endpointy `/analyze` i `/refine` muszą sprawdzać `locals.user` (z middleware Supabase), aby zapobiec nieautoryzowanemu zużyciu tokenów AI.
- **Zmienne środowiskowe:** Klucz `OPENROUTER_API_KEY` przechowywany tylko po stronie serwera (.env).
- **Sanityzacja:** Walidacja Zod odrzuca niebezpieczne lub niepoprawne typy danych.
- **Ograniczenia:** Limit wielkości payloadu (szczególnie dla zdjęć base64) konfigurowany w serwerze Astro.

## 6. Obsługa błędów
- **400 Bad Request:** Niepoprawne dane wejściowe (walidacja Zod).
- **401 Unauthorized:** Brak sesji użytkownika (dla analyze/refine).
- **500 Internal Server Error:**
  - Błąd komunikacji z OpenRouter.
  - Błąd parsowania odpowiedzi JSON od AI (model zwrócił niepoprawny format).
  - Inne nieoczekiwane błędy serwera.

## 7. Rozważania dotyczące wydajności
- **Prompt Caching:** Jeśli OpenRouter wspiera cache promptów, struktura systemowa powinna być stała.
- **Image Optimization:** Jeśli klient wysyła zdjęcia, powinny być wstępnie przeskalowane/skompresowane po stronie klienta (frontend) przed wysłaniem base64, aby zmniejszyć rozmiar żądania i koszt tokenów.
- **TDEE Hybrid:** Wykonywanie obliczeń matematycznych lokalnie zamiast pytania o nie AI oszczędza tokeny i eliminuje ryzyko halucynacji w prostych działaniach.

## 8. Etapy wdrożenia

### Krok 1: Konfiguracja środowiska
- Dodanie `OPENROUTER_API_KEY` do pliku `.env`.
- Zainstalowanie biblioteki `openai` (oficjalne SDK jest kompatybilne z OpenRouter) lub użycie `fetch`.

### Krok 2: Implementacja serwisu AI (`src/lib/services/ai.service.ts`)
- Utworzenie klasy/modułu `AiService`.
- Implementacja metod:
  - `analyzeMeal(request: AnalyzeMealRequest): Promise<AnalyzeMealResponse>`
  - `refineMeal(request: RefineMealRequest): Promise<AnalyzeMealResponse>`
  - `calculateTDEE(request: TDEECalculationRequest): Promise<TDEECalculationResponse>`
- Opracowanie promptów systemowych wymuszających format JSON.
- Implementacja logiki retry dla błędnych odpowiedzi JSON.

### Krok 3: Implementacja endpointu Analyze (`src/pages/api/ai/analyze.ts`)
- Konfiguracja `prerender = false`.
- Implementacja handlera POST.
- Walidacja Zod.
- Integracja z `AiService`.

### Krok 4: Implementacja endpointu Refine (`src/pages/api/ai/refine.ts`)
- Analogicznie do analyze, z obsługą kontekstu rozmowy.

### Krok 5: Implementacja endpointu TDEE (`src/pages/api/ai/calculate-tdee.ts`)
- Implementacja logiki hybrydowej (matematyka + AI).

### Krok 6: Testy manualne
- Weryfikacja poprawności formatu zwracanych danych (Postman/Curl).
- Sprawdzenie zachowania przy błędnych danych i braku autoryzacji.