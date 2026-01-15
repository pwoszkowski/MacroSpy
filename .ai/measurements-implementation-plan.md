# API Endpoint Implementation Plan: Body Measurements

## 1. Przegląd punktu końcowego
Zarządzanie pomiarami ciała użytkownika. Punkt końcowy umożliwia pobieranie historii pomiarów (waga, % tłuszczu, % mięśni) w celu wizualizacji postępów oraz dodawanie nowych pomiarów w celu śledzenia zmian w czasie.

## 2. Szczegóły żądania

### GET `/api/measurements`
Pobiera historię pomiarów posortowaną malejąco po dacie.
- **Parametry URL (Query Params):**
  - `limit` (opcjonalny, number): Liczba zwracanych rekordów. Domyślnie 30.

### POST `/api/measurements`
Dodaje nowy wpis pomiaru ciała.
- **Request Body (JSON):**
  ```json
  {
    "date": "2026-01-06",        // Wymagane, string (YYYY-MM-DD)
    "weight": 80.5,              // Wymagane, number (> 0)
    "body_fat_percentage": 15.2, // Opcjonalne, number (0-100)
    "muscle_percentage": 42.0    // Opcjonalne, number (0-100)
  }
  ```

### DELETE `/api/measurements/[id]`
Usuwa istniejący pomiar ciała.
- **Parametry URL:**
  - `id` (wymagany, string): UUID pomiaru do usunięcia.

## 3. Wykorzystywane typy
Wszystkie typy są już zdefiniowane w `src/types.ts` i `src/db/database.types.ts`.

- **DTO (Data Transfer Object):** `MeasurementDto`
  - Używany do zwracania danych do klienta.
  - Pola: `id`, `date`, `weight`, `body_fat_percentage`, `muscle_percentage`.

- **Command Model:** `LogMeasurementCommand`
  - Używany do walidacji i przekazywania danych wejściowych przy tworzeniu.
  - Pola: `date`, `weight`, `body_fat_percentage` (opcjonalne), `muscle_percentage` (opcjonalne).

## 4. Szczegóły odpowiedzi

### Pomyślne wykonanie

- **GET (200 OK):**
  ```json
  [
    {
      "id": "uuid",
      "date": "2026-01-06",
      "weight": 80.5,
      "body_fat_percentage": 15.2,
      "muscle_percentage": 42.0
    },
    ...
  ]
  ```

- **POST (201 Created):**
  Zwraca utworzony obiekt pomiaru (struktura jak w GET, pojedynczy obiekt).

- **DELETE (204 No Content):**
  Pomiar został pomyślnie usunięty. Brak zawartości w odpowiedzi.

### Błędy
- **400 Bad Request:** Błąd walidacji danych wejściowych (np. ujemna waga, zły format daty, brak ID).
- **401 Unauthorized:** Użytkownik nie jest zalogowany.
- **404 Not Found:** Pomiar o podanym ID nie istnieje lub nie należy do użytkownika.
- **500 Internal Server Error:** Błąd bazy danych lub serwera.

## 5. Przepływ danych

1.  **Klient** wysyła żądanie do `/api/measurements` lub `/api/measurements/[id]`.
2.  **Astro API Route** (`src/pages/api/measurements/index.ts` lub `src/pages/api/measurements/[id].ts`):
    *   Sprawdza autentykację użytkownika (`context.locals.user`).
    *   Parsuje i waliduje dane wejściowe za pomocą **Zod** (dla POST).
    *   Waliduje parametr `id` z URL (dla DELETE).
3.  **Service Layer** (`src/lib/services/measurement.service.ts`):
    *   Otrzymuje `SupabaseClient` oraz zwalidowane dane.
    *   Wywołuje odpowiednią metodę Supabase (`select`, `insert` lub `delete`).
4.  **Database (Supabase):**
    *   Wykonuje operację na tabeli `body_measurements`.
    *   Polityki RLS (Row Level Security) zapewniają, że użytkownik ma dostęp tylko do swoich danych.
    *   Constrainty bazy danych (np. `weight > 0`) są ostateczną linią obrony integralności danych.
5.  **Astro API Route**:
    *   Mapuje wynik z bazy na DTO (jeśli konieczne, choć struktura jest tożsama).
    *   Zwraca odpowiedź JSON (lub 204 No Content dla DELETE).

## 6. Względy bezpieczeństwa

- **Autentykacja:** Każde żądanie musi być zweryfikowane pod kątem istnienia sesji użytkownika.
- **Autoryzacja (RLS):** Baza danych posiada polityki RLS, które fizycznie uniemożliwiają dostęp do cudzych danych, nawet jeśli kod aplikacji by zawiódł.
- **Walidacja danych:** Biblioteka Zod jest używana do ścisłej kontroli typów i zakresów wartości przed wysłaniem ich do bazy.
  - Waga > 0.
  - Procenty w zakresie 0-100.
  - Data w poprawnym formacie.

## 7. Rozważania dotyczące wydajności

- **Indeksowanie:** Tabela `body_measurements` posiada indeks `(user_id, date DESC)`, co zapewnia szybkie sortowanie i filtrowanie po użytkowniku i dacie, idealne dla domyślnego widoku historii.
- **Paginacja/Limit:** Endpoint GET domyślnie ogranicza wyniki (parametr `limit`), co zapobiega pobieraniu zbyt dużej ilości danych na raz.
- **Lekki payload:** Struktura JSON jest płaska i minimalna.

## 8. Etapy wdrożenia

1.  **Utworzenie serwisu:**
    *   Plik: `src/lib/services/measurement.service.ts`
    *   Implementacja funkcji `getMeasurements` (pobieranie z limitem). ✅
    *   Implementacja funkcji `logMeasurement` (insert). ✅
    *   Implementacja funkcji `deleteMeasurement` (delete). ✅

2.  **Utworzenie API Endpointu:**
    *   Plik: `src/pages/api/measurements/index.ts` ✅
    *   Plik: `src/pages/api/measurements/[id].ts` ✅
    *   Konfiguracja: `export const prerender = false`.

3.  **Implementacja metody GET:**
    *   Pobranie `user.id` z `locals`. ✅
    *   Odczyt parametru `limit` z URL. ✅
    *   Wywołanie serwisu. ✅
    *   Zwrot danych JSON. ✅

4.  **Implementacja metody POST:**
    *   Definicja schematu Zod dla `LogMeasurementCommand`. ✅
    *   Parsowanie body żądania. ✅
    *   Walidacja Zod. ✅
    *   Wywołanie serwisu. ✅
    *   Zwrot kodu 201 i utworzonego zasobu. ✅

5.  **Implementacja metody DELETE:**
    *   Walidacja parametru `id` z URL. ✅
    *   Sprawdzenie autoryzacji (RLS). ✅
    *   Wywołanie serwisu. ✅
    *   Zwrot kodu 204 No Content. ✅

6.  **Weryfikacja:**
    *   Sprawdzenie lintera. ✅
    *   Manualne testy endpointów. ⏳
