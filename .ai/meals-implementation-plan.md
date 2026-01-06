# API Endpoint Implementation Plan: Meals CRUD

## 1. Przegląd punktu końcowego
Plan dotyczy wdrożenia zestawu endpointów REST API służących do zarządzania posiłkami użytkownika. Umożliwiają one pobieranie dziennika posiłków z podsumowaniem makroskładników, dodawanie nowych posiłków, oraz ich edycję i usuwanie. Logika biznesowa zostanie odseparowana do serwisu, a walidacja oparta o bibliotekę Zod.

## 2. Szczegóły żądania

### Endpointy

1.  **List Meals**
    *   **Metoda:** `GET`
    *   **URL:** `/api/meals`
    *   **Parametry:**
        *   Opcjonalne: `date` (Query Param, format `YYYY-MM-DD`, default: dzisiaj)

2.  **Create Meal**
    *   **Metoda:** `POST`
    *   **URL:** `/api/meals`
    *   **Body:** JSON zgodny z `CreateMealCommand`

3.  **Update Meal**
    *   **Metoda:** `PATCH`
    *   **URL:** `/api/meals/[id]`
    *   **Parametry:**
        *   Wymagane: `id` (Path Param, UUID)
    *   **Body:** JSON zgodny z `UpdateMealCommand` (Partial)

4.  **Delete Meal**
    *   **Metoda:** `DELETE`
    *   **URL:** `/api/meals/[id]`
    *   **Parametry:**
        *   Wymagane: `id` (Path Param, UUID)

## 3. Wykorzystywane typy

Implementacja oprze się na typach zdefiniowanych w `src/types.ts`:

*   **DTO (Response):** `MealDto`, `MealListResponse`, `MealSummary`
*   **Command (Request):** `CreateMealCommand`, `UpdateMealCommand`
*   **Encje:** `Meal` (z `database.types.ts`)

## 4. Szczegóły odpowiedzi

*   **GET /api/meals**: `200 OK`
    ```json
    {
      "data": [ ...MealDto[] ],
      "summary": {
        "total_calories": number,
        "total_protein": number,
        "total_fat": number,
        "total_carbs": number,
        "total_fiber": number
      }
    }
    ```
*   **POST /api/meals**: `201 Created`
    *   Zwraca utworzony obiekt `MealDto`.
*   **PATCH /api/meals/[id]**: `200 OK`
    *   Zwraca zaktualizowany obiekt `MealDto`.
*   **DELETE /api/meals/[id]**: `204 No Content`
    *   Brak treści odpowiedzi.

## 5. Przepływ danych

1.  **Odbiór żądania:** Astro Server Endpoint (`src/pages/api/meals/index.ts` lub `[id].ts`) odbiera żądanie.
2.  **Autentykacja:** Middleware Astro weryfikuje sesję użytkownika (`context.locals.user`).
3.  **Walidacja:** Dane wejściowe (body, query params) są walidowane schematami **Zod**.
4.  **Warstwa Serwisu:** Kontroler przekazuje dane do `MealService`.
5.  **Baza Danych:** `MealService` komunikuje się z Supabase (PostgreSQL) używając klienta z kontekstu.
    *   Dla GET: Pobiera posiłki, a następnie aplikacja (serwis) sumuje makroskładniki.
    *   Dla POST/PATCH/DELETE: Wykonuje operacje DML na tabeli `meals`.
6.  **Odpowiedź:** Serwis zwraca DTO, endpoint serializuje je do JSON i zwraca odpowiedni kod HTTP.

## 6. Względy bezpieczeństwa

*   **Uwierzytelnianie:** Każdy request musi być zautoryzowany. Brak sesji skutkuje `401 Unauthorized`.
*   **Izolacja danych (Multi-tenancy):** Wszystkie zapytania do bazy danych muszą zawierać klauzulę `user_id = session.user.id`, aby zapobiec dostępowi do danych innych użytkowników.
*   **Sanityzacja:** Zod odrzuca nadmiarowe pola i sprawdza typy danych, chroniąc przed wstrzyknięciem nieprawidłowych struktur.
*   **CSRF:** Astro domyślnie chroni przed CSRF dla metod mutujących stan (gdy używane są formularze), w przypadku REST API klient (SPA) musi zarządzać nagłówkami autoryzacyjnymi/ciasteczkami.

## 7. Obsługa błędów

| Scenariusz | Kod HTTP | Opis |
| :--- | :--- | :--- |
| Pomyślny odczyt/aktualizacja | 200 | Operacja zakończona sukcesem. |
| Utworzono zasób | 201 | Nowy posiłek zapisany. |
| Usunięto zasób | 204 | Posiłek usunięty. |
| Błąd walidacji | 400 | Niepoprawne dane (np. ujemne kalorie, zły format daty). |
| Brak autoryzacji | 401 | Użytkownik nie jest zalogowany. |
| Nie znaleziono | 404 | Posiłek o danym ID nie istnieje lub należy do innego użytkownika. |
| Błąd serwera | 500 | Błąd połączenia z bazą danych lub błąd logiczny. |

## 8. Rozważania dotyczące wydajności

*   **Indeksy:** Tabela `meals` powinna posiadać indeks na kolumnie `user_id` oraz `consumed_at` dla szybkiego filtrowania po dacie dla konkretnego użytkownika.
*   **Selekcja pól:** Pobieramy tylko potrzebne kolumny zdefiniowane w `MealDto`, aby ograniczyć transfer danych.
*   **Agregacja:** Sumowanie makroskładników (`summary`) odbywa się po stronie aplikacji (Node.js/Deno) na pobranym zestawie danych dziennych. Dla typowego użytkownika (3-6 posiłków dziennie) jest to szybsze niż osobne zapytanie agregujące do DB.

## 9. Etapy wdrożenia

1.  Utwórz plik `src/lib/services/meal.service.ts` i zaimplementuj klasę `MealService` z metodami CRUD.
2.  Zaimplementuj logikę `getMealsByDate` w serwisie, uwzględniającą filtrowanie po dacie i agregację makroskładników (`summary`).
3.  Zaimplementuj metody `createMeal`, `updateMeal` i `deleteMeal` w serwisie, zapewniając izolację danych (`user_id`) i mapowanie na DTO.
4.  Utwórz plik endpointu `src/pages/api/meals/index.ts` i skonfiguruj `prerender = false`.
5.  W `src/pages/api/meals/index.ts` zaimplementuj obsługę metody `GET` (lista posiłków) z walidacją parametru daty.
6.  W `src/pages/api/meals/index.ts` zaimplementuj obsługę metody `POST` (dodawanie posiłku) z walidacją body za pomocą Zod.
7.  Utwórz plik endpointu `src/pages/api/meals/[id].ts` dla operacji na pojedynczym zasobie.
8.  W `src/pages/api/meals/[id].ts` zaimplementuj obsługę metody `PATCH` (aktualizacja) z walidacją ID i danych częściowych.
9.  W `src/pages/api/meals/[id].ts` zaimplementuj obsługę metody `DELETE` (usuwanie) z weryfikacją uprawnień do zasobu.
10. Przeprowadź weryfikację endpointów pod kątem poprawności kodów HTTP, struktury odpowiedzi i obsługi błędów.
