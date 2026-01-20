# API Endpoint Implementation Plan: Profile & Goals

## 1. Przegląd punktów końcowych

Celem jest wdrożenie zestawu endpointów REST API umożliwiających zarządzanie danymi profilowymi użytkownika (dane antropometryczne) oraz jego celami żywieniowymi. System musi obsługiwać pobieranie zagregowanych danych profilowych, aktualizację wymiarów ciała oraz definiowanie nowych celów dietetycznych z datą obowiązywania.

Punkty końcowe:

1.  `GET /api/profile/me` - Pobiera profil i aktualny cel.
2.  `PUT /api/profile` - Aktualizuje dane biometryczne.
3.  `POST /api/goals` - Dodaje nowy cel żywieniowy.

## 2. Szczegóły żądań

### 2.1 GET /api/profile/me

- **Metoda:** `GET`
- **Autoryzacja:** Wymagana sesja użytkownika (cookie).
- **Parametry:** Brak.
- **Opis:** Zwraca obiekt zawierający dane profilowe oraz cel żywieniowy, który jest "aktualny" (najnowszy wpis w historii, którego `start_date` jest mniejsza lub równa dzisiejszej dacie).

### 2.2 PUT /api/profile

- **Metoda:** `PUT`
- **Autoryzacja:** Wymagana sesja użytkownika.
- **Request Body (JSON):**
  ```json
  {
    "height": 180, // number (int), wymagane, > 0
    "gender": "male", // string ('male'|'female'), wymagane
    "birth_date": "1995-05-12" // string (YYYY-MM-DD), wymagane
  }
  ```

### 2.3 POST /api/goals

- **Metoda:** `POST`
- **Autoryzacja:** Wymagana sesja użytkownika.
- **Request Body (JSON):**
  ```json
  {
    "start_date": "2026-01-07", // string (YYYY-MM-DD), wymagane
    "calories_target": 2400, // number (int), > 0
    "protein_target": 180, // number (int), >= 0
    "fat_target": 70, // number (int), >= 0
    "carbs_target": 250, // number (int), >= 0
    "fiber_target": 35 // number (int), >= 0, opcjonalne (zgodnie z typami w DB może być null, ale API powinno wymagać lub ustawić default)
  }
  ```

## 3. Wykorzystywane typy

Należy wykorzystać istniejące definicje z `src/types.ts`:

**DTO (Data Transfer Objects):**

- `UserProfileResponse`: Główny typ odpowiedzi dla GET.
- `ProfileDto`: Część składowa odpowiedzi.
- `DietaryGoalDto`: Część składowa odpowiedzi.

**Command Models (Typy wejściowe):**

- `UpdateProfileCommand`: Typ dla body w PUT.
- `SetDietaryGoalCommand`: Typ dla body w POST.

## 4. Architektura i Przepływ danych

### 4.1 Warstwa Serwisów

Należy utworzyć dwa nowe serwisy w katalogu `src/lib/services` w celu separacji logiki biznesowej od warstwy API:

1.  **`src/lib/services/profile.service.ts`**
    - `getProfile(userId: string)`: Pobiera dane z tabeli `profiles`.
    - `updateProfile(userId: string, data: UpdateProfileCommand)`: Aktualizuje rekord.

2.  **`src/lib/services/goal.service.ts`**
    - `getCurrentGoal(userId: string)`: Wykonuje zapytanie do `dietary_goals` pobierając jeden rekord: `WHERE user_id = uid AND start_date <= NOW() ORDER BY start_date DESC LIMIT 1`.
    - `createGoal(userId: string, data: SetDietaryGoalCommand)`: Wstawia nowy rekord.

### 4.2 Przepływ

1.  **API Route (Astro Endpoint)**:
    - Odbiera żądanie.
    - Weryfikuje sesję użytkownika (`context.locals.supabase`).
    - Waliduje dane wejściowe za pomocą **Zod**.
    - Wywołuje odpowiednią metodę serwisu.
2.  **Service**:
    - Wykonuje operację na bazie danych przy użyciu klienta Supabase przekazanego z kontekstu lub stworzonego wewnątrz (zgodnie z zasadami `backend.mdc` używamy klienta z `locals`).
    - Mapuje wynik surowy z DB na odpowiednie DTO (np. konwersja snake_case na camelCase jeśli wymagana, choć tutaj struktura jest spójna).
3.  **Response**:
    - API zwraca JSON z kodem statusu.

## 5. Walidacja i Bezpieczeństwo

### 5.1 Schematy Zod

Należy utworzyć schematy walidacji wewnątrz plików endpointów lub w osobnym pliku `src/lib/validators.ts`:

- **ProfileSchema**:
  - `height`: min(50), max(300).
  - `gender`: enum(['male', 'female']).
  - `birth_date`: data w przeszłości, sensowny zakres wieku.
- **GoalSchema**:
  - `calories_target`: min(500), max(10000).
  - `start_date`: poprawny format daty.

### 5.2 Bezpieczeństwo

- **Authentication**: Każdy endpoint musi sprawdzać `user` z `await supabase.auth.getUser()`. Jeśli brak użytkownika -> `401 Unauthorized`.
- **RLS (Row Level Security)**: Baza danych ma włączone RLS, co jest drugą linią obrony. Serwis powinien obsługiwać błędy DB.

## 6. Obsługa błędów

API powinno zwracać spójne komunikaty błędów:

- **400 Bad Request**: Błąd walidacji Zod (np. ujemne kalorie).
- **401 Unauthorized**: Brak zalogowanego użytkownika.
- **404 Not Found**: Jeśli profil użytkownika nie istnieje (teoretycznie niemożliwe dzięki triggerowi, ale warto obsłużyć) lub brak zdefiniowanych celów (wtedy `current_goal` może być `null`).
- **500 Internal Server Error**: Błąd połączenia z bazą, nieoczekiwany wyjątek.

## 7. Etapy wdrożenia

1. Utwórz plik `src/lib/services/profile.service.ts` i zaimplementuj metody pobierania oraz aktualizacji profilu.
2. Utwórz plik `src/lib/services/goal.service.ts` i zaimplementuj metodę pobierania aktualnego celu.
3. Dodaj metodę tworzenia nowego celu w `src/lib/services/goal.service.ts`.
4. Utwórz plik `src/pages/api/profile/me.ts` i zaimplementuj obsługę metody GET.
5. W endpointcie `me.ts` połącz dane z obu serwisów i zwróć zagregowany obiekt `UserProfileResponse`.
6. Utwórz plik `src/pages/api/profile/index.ts` i zdefiniuj schemat walidacji Zod dla aktualizacji profilu.
7. W endpointcie `profile/index.ts` zaimplementuj obsługę metody PUT do aktualizacji danych użytkownika.
8. Utwórz plik `src/pages/api/goals/index.ts` i zdefiniuj schemat walidacji Zod dla nowego celu.
9. W endpointcie `goals/index.ts` zaimplementuj obsługę metody POST do tworzenia nowego celu dietetycznego.
