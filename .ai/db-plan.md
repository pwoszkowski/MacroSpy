# Plan Schematu Bazy Danych - MacroSpy

Ten dokument definiuje schemat bazy danych PostgreSQL dla projektu MacroSpy, oparty na platformie Supabase. Schemat został zaprojektowany zgodnie z wymaganiami PRD oraz ustaleniami z sesji planowania technicznego.

## 1. Tabele i Struktura Danych

### 1.1 `profiles`
Tabela przechowująca dane statyczne i antropometryczne użytkownika. Relacja 1:1 z tabelą `auth.users` Supabase.

| Kolumna | Typ Danych | Wymagalność | Opis |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | Klucz główny, referencja do `auth.users.id`. |
| `height` | `integer` | NULL | Wzrost w centymetrach (cm). |
| `gender` | `text` | NULL | Płeć (np. 'male', 'female') - wymagane do wzorów BMR. |
| `birth_date` | `date` | NULL | Data urodzenia do obliczania wieku. |
| `created_at` | `timestamptz` | NOT NULL | Data utworzenia rekordu (default: `now()`). |
| `updated_at` | `timestamptz` | NOT NULL | Data ostatniej aktualizacji. |

**Ograniczenia (Constraints):**
- `height_check`: `height > 0`

---

### 1.2 `dietary_goals`
Historia celów żywieniowych użytkownika. Pozwala na zmianę celów w czasie bez utraty kontekstu historycznego.

| Kolumna | Typ Danych | Wymagalność | Opis |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | Unikalny identyfikator celu (default: `gen_random_uuid()`). |
| `user_id` | `uuid` | NOT NULL, **FK** | Referencja do `profiles.id` / `auth.users.id`. |
| `start_date` | `date` | NOT NULL | Data od której obowiązuje dany cel. |
| `activity_level` | `text` | NULL | Poziom aktywności fizycznej (klucz enum/string) dla danego okresu. |
| `calories_target` | `integer` | NOT NULL | Dzienny cel kalorii (kcal). |
| `protein_target` | `integer` | NOT NULL | Dzienny cel białka (g). |
| `fat_target` | `integer` | NOT NULL | Dzienny cel tłuszczów (g). |
| `carbs_target` | `integer` | NOT NULL | Dzienny cel węglowodanów (g). |
| `fiber_target` | `integer` | NULL | Dzienny cel błonnika (g). |
| `tdee` | `integer` | NULL | Całkowite dzienne zapotrzebowanie energetyczne (wyliczone). |
| `bmr` | `integer` | NULL | Podstawowa przemiana materii (wyliczona). |
| `created_at` | `timestamptz` | NOT NULL | Data utworzenia wpisu. |

**Ograniczenia (Constraints):**
- `positive_targets`: Wszystkie wartości liczbowe (calories, macros) muszą być `>= 0`.

---

### 1.3 `meals`
Centralna tabela przechowująca spożyte posiłki. Zawiera dane sumaryczne wyliczone przez AI oraz kontekst interakcji.

| Kolumna | Typ Danych | Wymagalność | Opis |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | Unikalny identyfikator posiłku (default: `gen_random_uuid()`). |
| `user_id` | `uuid` | NOT NULL, **FK** | Referencja do użytkownika. |
| `name` | `text` | NOT NULL | Nazwa posiłku generowana przez AI (np. "Jajecznica z awokado"). |
| `consumed_at` | `timestamptz` | NOT NULL | Czas spożycia posiłku (UTC). |
| `calories` | `integer` | NOT NULL | Kaloryczność posiłku (kcal). |
| `protein` | `numeric(10, 1)` | NOT NULL | Białko (g). |
| `fat` | `numeric(10, 1)` | NOT NULL | Tłuszcze (g). |
| `carbs` | `numeric(10, 1)` | NOT NULL | Węglowodany (g). |
| `fiber` | `numeric(10, 1)` | DEFAULT 0 | Błonnik (g). |
| `original_prompt` | `text` | NULL | Oryginalny tekst wprowadzony przez użytkownika. |
| `last_ai_context` | `jsonb` | NULL | Zrzut kontekstu rozmowy z AI (umożliwia edycję/korektę). |
| `ai_suggestion` | `text` | NULL | Pasywna sugestia dietetyczna od AI. |
| `is_image_analyzed` | `boolean` | DEFAULT false | Flaga informująca, czy posiłek pochodzi z analizy zdjęcia. |
| `created_at` | `timestamptz` | NOT NULL | Data utworzenia rekordu. |
| `updated_at` | `timestamptz` | NOT NULL | Data ostatniej aktualizacji. |

**Ograniczenia (Constraints):**
- `macros_check`: Wszystkie makroskładniki i kalorie `>= 0`.

---

### 1.4 `body_measurements`
Tabela do śledzenia postępów w wadze i składzie ciała (zgodnie z US-010).

| Kolumna | Typ Danych | Wymagalność | Opis |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | Unikalny identyfikator pomiaru. |
| `user_id` | `uuid` | NOT NULL, **FK** | Referencja do użytkownika. |
| `date` | `date` | NOT NULL | Data wykonania pomiaru. |
| `weight` | `numeric(5, 2)` | NOT NULL | Waga ciała (kg). |
| `body_fat_percentage` | `numeric(4, 1)` | NULL | Procent tkanki tłuszczowej (%). |
| `muscle_percentage` | `numeric(4, 1)` | NULL | Procent tkanki mięśniowej (%). |
| `created_at` | `timestamptz` | NOT NULL | Data zapisu. |

**Ograniczenia (Constraints):**
- `weight_check`: `weight > 0`.
- `percentage_check`: `body_fat` i `muscle` pomiędzy 0 a 100.

---

## 2. Relacje (ERD)

1.  **Users ↔ Profiles (1:1)**
    *   `profiles.id` odwołuje się bezpośrednio do `auth.users.id`.
    *   Relacja egzekwowana przez klucz obcy (FK) i logikę aplikacji (Trigger przy rejestracji).

2.  **Users ↔ Dietary Goals (1:N)**
    *   Użytkownik może mieć wiele historycznych celów.
    *   Obowiązujący cel to ten z najnowszą datą `start_date`, która jest `<=` `current_date`.

3.  **Users ↔ Meals (1:N)**
    *   Jeden użytkownik posiada wiele posiłków.
    *   Usunięcie użytkownika (Cascade) usuwa jego posiłki.

4.  **Users ↔ Body Measurements (1:N)**
    *   Jeden użytkownik posiada wiele pomiarów w czasie.

## 3. Indeksy i Wydajność

Dla zapewnienia szybkiego działania dashboardu i widoków historii, zostaną utworzone następujące indeksy:

1.  **`profiles`**:
    *   PK `id` jest domyślnie indeksowany.

2.  **`meals`**:
    *   `idx_meals_user_consumed`: Indeks złożony `(user_id, consumed_at DESC)`. Kluczowy dla pobierania "Dzisiejszych" posiłków oraz historii.

3.  **`dietary_goals`**:
    *   `idx_goals_user_start`: Indeks złożony `(user_id, start_date DESC)`. Służy do szybkiego znajdowania aktualnego celu.

4.  **`body_measurements`**:
    *   `idx_measurements_user_date`: Indeks złożony `(user_id, date DESC)`.

## 4. Bezpieczeństwo (Row Level Security - RLS)

Zgodnie z wymaganiami, dane są ściśle prywatne. Wszystkie tabele będą miały włączone RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

### Polityki (Policies)
Dla każdej tabeli (`profiles`, `dietary_goals`, `meals`, `body_measurements`) zostaną zdefiniowane polityki CRUD, które pozwalają na dostęp **tylko właścicielowi** danych:

*   **SELECT**: `auth.uid() = user_id` (lub `id` w przypadku `profiles`)
*   **INSERT**: `auth.uid() = user_id` (lub `id` w przypadku `profiles`)
*   **UPDATE**: `auth.uid() = user_id` (lub `id` w przypadku `profiles`)
*   **DELETE**: `auth.uid() = user_id` (lub `id` w przypadku `profiles`)

*Uwaga: Funkcja Realtime jest wyłączona dla oszczędności zasobów.*

## 5. Automatyzacja i Dodatkowe Uwagi

### 5.1 Trigger: `handle_new_user`
Funkcja PL/pgSQL uruchamiana `AFTER INSERT` na tabeli `auth.users`.
*   **Cel**: Automatyczne utworzenie pustego rekordu w tabeli `public.profiles` natychmiast po rejestracji użytkownika. Zapewnia to spójność relacji 1:1.

### 5.2 Trigger: `handle_updated_at`
Funkcja PL/pgSQL do automatycznej aktualizacji kolumny `updated_at` na bieżący czas przy każdej modyfikacji rekordu (dla tabel `profiles`, `meals`, `body_measurements`).

### 5.3 Decyzje Projektowe
*   **JSONB dla kontekstu AI**: Zamiast tworzyć skomplikowaną strukturę relacyjną dla historii czatu z AI (która jest ulotna i służy tylko do korekty bieżącego posiłku), przechowujemy ją jako obiekt JSONB w rekordzie posiłku. Pozwala to na elastyczność i upraszcza schemat.
*   **Brak tabeli produktów**: W modelu MVP nie budujemy własnej bazy produktów spożywczych. Polegamy całkowicie na wiedzy modelu LLM (grok-4.1-fast). Tabela `meals` przechowuje tylko wynikowe makro dla całego posiłku.
*   **Typy liczbowe**: Użycie `NUMERIC(10,1)` dla makroskładników pozwala na precyzję do jednego miejsca po przecinku (np. 4.5g tłuszczu), co jest wystarczające dla celów dietetycznych, unikając problemów z zaokrąglaniem `float`.

