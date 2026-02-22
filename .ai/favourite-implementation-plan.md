# API Endpoint Implementation Plan: Favorites (Meal Templates)

## 1. Przegląd punktu końcowego
Celem tego wdrożenia jest umożliwienie użytkownikom zarządzania biblioteką "Ulubionych posiłków" (szablonów). Funkcjonalność ta pozwala na szybsze dodawanie posiłków do dziennika poprzez wykorzystanie wcześniej zdefiniowanych wartości makroskładników. Moduł obejmuje pełny cykl CRUD (Create, Read, Update, Delete) z uwzględnieniem limitów biznesowych (max 100 ulubionych na użytkownika).

## 2. Szczegóły żądania

### Endpointy

| Metoda | URL | Opis |
| :--- | :--- | :--- |
| `GET` | `/api/favorites` | Pobiera listę ulubionych z filtrowaniem i sortowaniem. |
| `POST` | `/api/favorites` | Tworzy nowy szablon (wymaga body, limit 100). |
| `PATCH` | `/api/favorites/[id]` | Aktualizuje istniejący szablon (partial update). |
| `DELETE` | `/api/favorites/[id]` | Usuwa szablon. |

### Parametry i Body

#### GET `/api/favorites`
- **Query Params:**
  - `search`: string (opcjonalny) - filtrowanie `ilike` po nazwie.
  - `sort`: string (opcjonalny) - wartości: `newest` (domyślnie), `name_asc`.

#### POST `/api/favorites`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "name": "string (min 1 char)",
    "calories": "number (int >= 0)",
    "protein": "number (float >= 0)",
    "fat": "number (float >= 0)",
    "carbs": "number (float >= 0)",
    "fiber": "number (float >= 0, optional, default 0)"
  }
  ```

#### PATCH `/api/favorites/[id]`
- **URL Params:** `id` (UUID)
- **Body (JSON):** Częściowy obiekt z definicji POST (np. tylko zmiana nazwy).

## 3. Wykorzystywane typy

### Zod Schemas (`src/lib/schemas/favorites.ts`)

Będziemy potrzebować schematów walidacji, aby zapewnić integralność danych przed wysłaniem ich do bazy.

```typescript
import { z } from 'zod';

export const createFavoriteSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  calories: z.number().int().min(0),
  protein: z.number().min(0),
  fat: z.number().min(0),
  carbs: z.number().min(0),
  fiber: z.number().min(0).default(0),
});

export const updateFavoriteSchema = createFavoriteSchema.partial();

export type CreateFavoriteDTO = z.infer<typeof createFavoriteSchema>;
export type UpdateFavoriteDTO = z.infer<typeof updateFavoriteSchema>;
```

### TypeScript Interfaces (`src/types.ts`)

Wykorzystamy wygenerowane typy z `src/db/database.types.ts` jako bazę (`Database['public']['Tables']['favorite_meals']['Row']`).

## 4. Szczegóły odpowiedzi

- **GET /api/favorites**: `200 OK`
  ```json
  [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Owsianka",
      "calories": 400,
      ...
      "created_at": "ISO-Date"
    }
  ]
  ```

- **POST /api/favorites**: `201 Created`
  - Body: Utworzony obiekt (j.w.)
  - Error `400`: Jeśli przekroczono limit 100 wpisów.

- **PATCH /api/favorites/[id]**: `200 OK`
  - Body: Zaktualizowany obiekt.

- **DELETE /api/favorites/[id]**: `204 No Content`
  - Body: Puste.

## 5. Przepływ danych

1. **Klient**: Wysyła żądanie do endpointu Astro (`src/pages/api/favorites/...`).
2. **Endpoint (Middleware/Context)**:
   - Weryfikuje sesję użytkownika (`Astro.locals`).
   - Jeśli brak sesji -> `401 Unauthorized`.
3. **Endpoint (Handler)**:
   - Parsuje i waliduje dane wejściowe za pomocą **Zod**.
   - Jeśli błąd walidacji -> `400 Bad Request`.
4. **Service (`FavoritesService`)**:
   - Wywołuje odpowiednią metodę biznesową.
   - **Dla POST**: Najpierw sprawdza `count` rekordów użytkownika. Jeśli >= 100 -> rzuca wyjątek biznesowy.
   - Komunikuje się z Supabase.
5. **Database**:
   - Wykonuje operację zgodnie z politykami RLS.
   - Zwraca dane lub błąd.
6. **Endpoint**: Mapuje wynik na odpowiedź JSON.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Każdy endpoint musi sprawdzić, czy `user` istnieje w kontekście żądania.
- **Row Level Security (RLS)**: Baza danych posiada już polityki `auth.uid() = user_id`. Mimo to, w zapytaniach `select/update/delete` w serwisie jawnie użyjemy filtra `.eq('user_id', user.id)` dla dodatkowej pewności i czytelności kodu.
- **Input Validation**: `zod` zapobiegnie wstrzyknięciu niepożądanych pól oraz ujemnych wartości makroskładników.
- **CSRF**: Astro domyślnie obsługuje ochronę w formularzach, dla API REST polegamy na mechanizmach sesji/tokenów Supabase (ciasteczka).

## 7. Obsługa błędów

Błędy będą mapowane w blokach `try-catch` w handlerach API:

| Sytuacja | Kod HTTP | Komunikat |
| :--- | :--- | :--- |
| Nieprawidłowe dane (Zod) | 400 | Szczegóły błędów walidacji. |
| Limit przekroczony (100) | 400 | "Osiągnięto limit 100 ulubionych posiłków." |
| Brak tokenu/sesji | 401 | "Unauthorized" |
| Nie znaleziono zasobu (ID) | 404 | "Resource not found" |
| Błąd bazy danych | 500 | "Internal Server Error" |

## 8. Rozważania dotyczące wydajności

- **Indeksy**: Baza posiada indeksy `(user_id, created_at)` oraz `(user_id, name)`.
  - Sortowanie `newest` wykorzysta pierwszy indeks.
  - Wyszukiwanie `search` i sortowanie `name_asc` wykorzysta drugi indeks.
- **Payload**: Obiekty są małe, brak konieczności paginacji w pierwszej wersji (limit sztywny 100 rekordów gwarantuje, że odpowiedź zawsze będzie lekka).
- **Prerender**: Endpointy muszą być dynamiczne (`export const prerender = false`).

## 9. Etapy wdrożenia

### Krok 1: Definicja schematów walidacji (Zod)
- Utworzenie pliku `src/lib/schemas/favorites.ts`.
- Zdefiniowanie `createFavoriteSchema` (z walidacją typów i wartości min/max).
- Zdefiniowanie `updateFavoriteSchema` jako `partial()`.
- Wyeksportowanie typów TypeScript (`DTO`).

### Krok 2: Inicjalizacja serwisu `FavoritesService`
- Utworzenie pliku `src/lib/services/favorites.service.ts`.
- Przygotowanie klasy i podstawowych metod pomocniczych (np. obsługa klienta Supabase).

### Krok 3: Implementacja logiki odczytu (`listFavorites`)
- Dodanie metody `findAll` do serwisu.
- Obsługa parametrów sortowania (`newest`, `name_asc`) i filtrowania (`search`).
- Implementacja zapytania do Supabase.

### Krok 4: Implementacja logiki zapisu (`createFavorite`)
- Dodanie metody `create` do serwisu.
- **Kluczowe**: Implementacja sprawdzenia limitu (count < 100) przed dodaniem.
- Rzucenie błędu w przypadku przekroczenia limitu.

### Krok 5: Implementacja logiki modyfikacji i usuwania (`update/delete`)
- Dodanie metod `update` i `delete` do serwisu.
- Zapewnienie, że operacje dotyczą tylko rekordów należących do użytkownika.

### Krok 6: Utworzenie endpointu listy (`GET /api/favorites`)
- Utworzenie pliku `src/pages/api/favorites/index.ts`.
- Pobranie i walidacja parametrów query.
- Zwrócenie listy w formacie JSON (200 OK).

### Krok 7: Utworzenie endpointu tworzenia (`POST /api/favorites`)
- Dodanie obsługi metody `POST` w `src/pages/api/favorites/index.ts`.
- Walidacja body za pomocą schematu Zod.
- Obsługa błędu przekroczenia limitu (400 Bad Request).
- Zwrócenie utworzonego zasobu (201 Created).

### Krok 8: Utworzenie endpointu edycji (`PATCH /api/favorites/[id]`)
- Utworzenie pliku `src/pages/api/favorites/[id].ts`.
- Walidacja `id` (UUID) i body (Zod partial).
- Obsługa błędu 404 (Not Found).
- Zwrócenie zaktualizowanego zasobu (200 OK).

### Krok 9: Utworzenie endpointu usuwania (`DELETE /api/favorites/[id]`)
- Dodanie obsługi metody `DELETE` w `src/pages/api/favorites/[id].ts`.
- Wywołanie serwisu i zwrócenie statusu 204 No Content.

### Krok 10: Weryfikacja i testy manualne
- Sprawdzenie poprawności sortowania i wyszukiwania.
- Próba dodania 101 elementu (weryfikacja limitu).
- Sprawdzenie kodów błędów dla nieprawidłowych danych.
