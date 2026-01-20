# Specyfikacja Techniczna Modułu Autentykacji

Dokument definiuje architekturę techniczną modułu rejestracji, logowania i odzyskiwania hasła w aplikacji MacroSpy, zgodnie z wymaganiami US-001 i US-002 oraz kontekstem US-003 (Onboarding).

## 1. Architektura Interfejsu Użytkownika

Interfejs autentykacji zostanie wydzielony z głównego layoutu aplikacji, aby zapewnić skupienie użytkownika na procesie logowania/rejestracji.

### 1.1 Layouty i Strony

- **`src/layouts/AuthLayout.astro`**: Nowy layout dedykowany stronom autentykacji.
  - Cechy: Minimalistyczny design, wyśrodkowany kontener formularza, brak głównej nawigacji, logo aplikacji.
  - Odpowiedzialność: Wrapper dla stron logowania i rejestracji.

- **Nowe strony (Astro)**:
  - `src/pages/login.astro`: Strona logowania.
  - `src/pages/register.astro`: Strona rejestracji.
  - `src/pages/forgot-password.astro`: Strona inicjowania resetu hasła (Rozszerzenie wymagań dla UX).
  - `src/pages/auth/callback.ts`: Endpoint API (route handler) do obsługi przekierowań OAuth/MagicLink i ustawiania ciasteczek (Code Exchange).

### 1.2 Komponenty (React & Shadcn/ui)

Wszystkie formularze będą komponentami React („Islands”) z hydracją (`client:load`), aby obsłużyć interaktywną walidację i komunikację z Supabase Client.

- **Lokalizacja**: `src/components/auth/`
- **Komponenty**:
  1.  `LoginForm.tsx`:
      - Pola: Email, Hasło.
      - Akcje: Logowanie (z opcją persist session - "Remember me" domyślne w Supabase), link do "Zapomniałem hasła", link do rejestracji.
  2.  `RegisterForm.tsx`:
      - Pola: Email, Hasło, Powtórz hasło.
      - Akcje: Rejestracja, link do logowania.
      - Walidacja hasła: min. 8 znaków (zgodnie z US-001).
  3.  `ForgotPasswordForm.tsx`:
      - Pola: Email.
      - Akcje: Wysłanie linku resetującego.

### 1.3 Walidacja i Obsługa Błędów

- **Biblioteki**: `react-hook-form` do zarządzania stanem formularzy oraz `zod` do definicji schematów walidacji.
- **Scenariusze walidacji (Client-side)**:
  - Format email (regex).
  - Długość hasła (min. 8 znaków).
  - Zgodność haseł (przy rejestracji).
- **Komunikaty błędów (UI)**:
  - Błędy walidacji: Wyświetlane bezpośrednio pod polami formularza (czerwony tekst, komponent `FormMessage` z shadcn/ui).
  - Błędy API (np. "Błędne hasło", "Użytkownik istnieje"): Wyświetlane jako `Alert` (destuctive) nad formularzem lub Toast.

## 2. Logika Backendowa i Integracja z Astro

Ze względu na hybrydową naturę Astro (SSR + Client), autentykacja musi być spójna pomiędzy serwerem a przeglądarką.

### 2.1 Zarządzanie Sesją (Server-Side)

- **Biblioteka**: Zmiana z prostego `@supabase/supabase-js` na `@supabase/ssr` (zalecane do Astro SSR).
  - _Uwaga: Wymaga instalacji pakietu, którego obecnie brak w package.json._
- **Mechanizm**: PKCE Flow. Sesja przechowywana jest w ciasteczkach (`sb-access-token`, `sb-refresh-token`), co pozwala na dostęp do danych użytkownika zarówno w API Routes, jak i podczas renderowania stron Astro (`Astro.locals`).

### 2.2 Middleware (`src/middleware/index.ts`)

Middleware pełni rolę strażnika (Guard).

1.  Tworzy instancję `supabase` server-client na podstawie ciasteczek żądania.
2.  Odświeża sesję, jeśli token wygasł (i aktualizuje ciasteczka w odpowiedzi).
3.  Zapisuje obiekt `user` i `session` w `context.locals`.
4.  **Logika przekierowań (Routing Rules)**:
    - **Public Routes**: `/login`, `/register`, `/forgot-password`, `/auth/callback`.
    - **Protected Routes**: Wszystkie pozostałe (w tym `/`, `/onboarding`).
    - **Zasada 1 (Dostęp do chronionych)**: Jeśli użytkownik **niezalogowany** wchodzi na trasę chronioną -> Przekierowanie na `/login`.
    - **Zasada 2 (Dostęp do auth)**: Jeśli użytkownik **zalogowany** wchodzi na trasę auth (`/login`, `/register`) -> Przekierowanie na `/` (lub `/onboarding` jeśli nieukończony).
    - **Zasada 3 (Wymuszenie Onboardingu)**: Jeśli użytkownik **zalogowany** wchodzi na dowolną trasę chronioną (inną niż `/onboarding`), a nie posiada flagi ukończenia profilu (sprawdzenie w `profiles` lub metadata) -> Przekierowanie na `/onboarding`.

### 2.3 Modele Danych

Wymagane jest rozszerzenie typowania w `src/env.d.ts` dla `App.Locals`:

```typescript
interface Locals {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
}
```

## 3. System Autentykacji (Supabase Auth)

### 3.1 Konfiguracja

- Wykorzystanie wbudowanego providera Email/Password.
- Wyłączenie potwierdzenia email (opcjonalnie dla MVP dla płynniejszego UX).

### 3.2 Przepływy (Flows)

1.  **Rejestracja (US-001)**:
    - Frontend: `supabase.auth.signUp({ email, password })`.
    - Sukces: Automatyczne przekierowanie (przez router klienta lub middleware po odświeżeniu) na `/onboarding`.
    - Backend (Supabase): Trigger `create_new_user_trigger` tworzy wpis w `public.profiles`.

2.  **Logowanie (US-002)**:
    - Frontend: `supabase.auth.signInWithPassword({ email, password })`.
    - Sukces: Przekierowanie na `/`. Middleware sprawdzi status onboardingu.

3.  **Wylogowanie**:
    - Akcja: `supabase.auth.signOut()`.
    - Formularz POST do endpointu API `/api/auth/signout` (aby wyczyścić ciasteczka po stronie serwera).

4.  **Odzyskiwanie hasła**:
    - Frontend: `supabase.auth.resetPasswordForEmail(email, { redirectTo: '.../auth/callback?next=/settings/profile' })`.
    - Użytkownik klika link w emailu -> trafia na stronę z formularzem zmiany hasła.

## 4. Plan Wdrożenia

1.  Instalacja `@supabase/ssr` (brak w obecnych zależnościach).
2.  Implementacja `src/lib/supabase.ts` (konfiguracja klienta serwerowego z obsługą ciasteczek Astro).
3.  Aktualizacja `src/middleware/index.ts` o logikę sesji i reguły przekierowań (w tym check onboardingu).
4.  Stworzenie `AuthLayout` i stron Astro (`login`, `register`, `forgot-password`).
5.  Implementacja komponentów formularzy z walidacją Zod.
6.  Weryfikacja:
    - Rejestracja -> Onboarding (US-001).
    - Logowanie -> Dashboard (US-002).
    - Pominięcie onboardingu -> Przymusowe przekierowanie (US-003 context).
