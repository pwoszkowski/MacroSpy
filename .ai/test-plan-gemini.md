# Plan Testów Projektu MacroSpy

## 1. Wprowadzenie i cele testowania

Celem niniejszego planu jest zapewnienie wysokiej jakości aplikacji webowej **MacroSpy** – inteligentnego dziennika żywieniowego opartego o stos technologiczny Astro, React i Supabase.

Głównym priorytetem jest weryfikacja poprawności działania kluczowych funkcjonalności:

- Analizy posiłków przy użyciu AI (tekst i obraz).
- Algorytmów obliczania zapotrzebowania kalorycznego (TDEE).
- Integracji z bazą danych Supabase (bezpieczeństwo i spójność danych).
- Responsywności interfejsu (specyficzne zachowanie mobile vs desktop).

## 2. Zakres testów

**W zakresie (In-Scope):**

- **Frontend:** Interfejs użytkownika, walidacja formularzy (Zod), responsywność (Tailwind CSS), działanie komponentów React wewnątrz Astro.
- **Backend/API:** Endpoints w katalogu `src/pages/api/` (proxy do AI, operacje na bazie danych).
- **Integracje:** Supabase (Auth, DB), OpenRouter/OpenAI (analiza posiłków), Web Speech API.
- **Logika Biznesowa:** Obliczanie makroskładników, TDEE, obsługa historii pomiarów.

**Poza zakresem (Out-of-Scope):**

- Testy wydajnościowe infrastruktury Supabase (polegamy na SLA dostawcy).
- Weryfikacja merytoryczna porad dietetycznych generowanych przez AI (skupiamy się na poprawności technicznej struktury JSON i obsłudze odpowiedzi).
- Testy bezpieczeństwa samego modelu LLM (Prompt Injection testing jest opcjonalny w tej fazie).

## 3. Typy testów do przeprowadzenia

### 3.1. Testy Jednostkowe (Unit Tests)

- **Cel:** Weryfikacja izolowanej logiki biznesowej.
- **Kluczowe obszary:**
- Schematy walidacji (`src/**/schemas.ts`).
- Custom hooki: `useMealComposer`, `useMeasurements`, `useHistoryMeals`.
- Funkcje użytkowe i konwertery danych.

### 3.2. Testy Integracyjne

- **Cel:** Weryfikacja współpracy między modułami a API.
- **Kluczowe obszary:**
- Przesyłanie danych z formularzy do API Routes.
- Obsługa odpowiedzi z serwisów AI (mockowanie odpowiedzi z OpenRouter).
- Sprawdzenie flow autoryzacji (Middleware + Supabase Auth).

### 3.3. Testy End-to-End (E2E)

- **Cel:** Symulacja pełnych ścieżek użytkownika w przeglądarce.
- **Kluczowe obszary:**
- Proces rejestracji i onboardingu.
- Dodawanie posiłku (ścieżka Happy Path).
- Edycja profilu i celów.

### 3.4. Testy UI/UX i Responsywności

- **Cel:** Weryfikacja adaptacji interfejsu do różnych ekranów.
- **Kluczowe obszary:**
- Przełączanie między `Drawer` (Mobile) a `Dialog` (Desktop) w `AddMealDialog`.
- Wyświetlanie wykresów (`Recharts`) na małych ekranach.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Moduł: AI Meal Composer (Kreator Posiłków)

Jest to najbardziej krytyczny element systemu.

| ID        | Tytuł Scenariusza       | Kroki Testowe              | Oczekiwany Rezultat |
| --------- | ----------------------- | -------------------------- | ------------------- |
| **MC-01** | Analiza posiłku (Tekst) | 1. Otwórz kreator (+).<br> |

<br>2. Wybierz tryb "Analiza AI".<br>

<br>3. Wpisz "Jajecznica z 3 jajek".<br>

<br>4. Kliknij "Analizuj". | Wyświetla się podsumowanie z poprawną nazwą i estymowanymi makroskładnikami. |
| **MC-02** | Analiza posiłku (Obraz) | 1. Wgraj poprawne zdjęcie (JPG/PNG, <5MB).<br>

<br>2. Kliknij "Analizuj". | System przetwarza obraz i zwraca propozycję posiłku. |
| **MC-03** | Walidacja limitu zdjęć | 1. Spróbuj dodać 6 zdjęć do analizy. | Wyświetla się błąd walidacji (Max 5 zdjęć). |
| **MC-04** | Obsługa błędów AI | 1. Symuluj błąd 500 z API `/api/ai/analyze`. | Wyświetla się Toast z informacją o błędzie, stan formularza nie jest czyszczony. |
| **MC-05** | Interaktywna korekta (Refine) | 1. Po analizie wpisz: "Zmień masło na oliwę".<br>

<br>2. Wyślij. | Wartości tłuszczu/kalorii aktualizują się, historia czatu jest widoczna. |
| **MC-06** | Rozpoznawanie mowy | 1. Kliknij ikonę mikrofonu.<br>

<br>2. Powiedz opis posiłku. | Tekst pojawia się w polu input (wymaga przeglądarki wspierającej Web Speech API). |
| **MC-07** | Tryb Manualny | 1. Przełącz na "Ręczne dodanie".<br>

<br>2. Wypełnij formularz i zapisz. | Posiłek dodany bez użycia AI, widoczny na Dashboardzie. |

### 4.2. Moduł: Onboarding i Profil

Kluczowy dla poprawnego działania algorytmów dashboardu.

| ID        | Tytuł Scenariusza        | Kroki Testowe                          | Oczekiwany Rezultat |
| --------- | ------------------------ | -------------------------------------- | ------------------- |
| **ON-01** | Pełny proces Onboardingu | 1. Zarejestruj nowego użytkownika.<br> |

<br>2. Przejdź 3 kroki kreatora (Bio, Aktywność, Cele). | Użytkownik przekierowany na Dashboard, dane zapisane w tabelach `profiles`, `dietary_goals`. |
| **ON-02** | Walidacja wieku | 1. Wpisz datę urodzenia wskazującą na wiek < 10 lat lub > 120 lat. | Blokada przejścia dalej, komunikat błędu. |
| **ON-03** | Kalkulator TDEE (Profil) | 1. W zakładce Profil otwórz kalkulator.<br>

<br>2. Zmień parametry i zastosuj. | Formularz celów dietetycznych aktualizuje się o nowe wartości. |

### 4.3. Dashboard i Historia

Weryfikacja wizualizacji i spójności danych.

| ID        | Tytuł Scenariusza | Kroki Testowe                  | Oczekiwany Rezultat |
| --------- | ----------------- | ------------------------------ | ------------------- |
| **DB-01** | Sumowanie Makro   | 1. Dodaj posiłek 500 kcal.<br> |

<br>2. Dodaj posiłek 300 kcal. | `CaloriesRing` pokazuje 800 kcal / Cel. Paski postępu są zaktualizowane. |
| **DB-02** | Zmiana Daty | 1. Zmień datę na wczorajszą.<br>

<br>2. Dodaj posiłek. | Posiłek nie wpływa na dzisiejsze podsumowanie ("Dziś"). |
| **DB-03** | Usuwanie Posiłku | 1. Wejdź w Historię.<br>

<br>2. Usuń posiłek. | Posiłek znika z listy, `DaySummary` przelicza wartości w dół. |

### 4.4. Pomiary Ciała (Measurements)

| ID        | Tytuł Scenariusza | Kroki Testowe                            | Oczekiwany Rezultat                              |
| --------- | ----------------- | ---------------------------------------- | ------------------------------------------------ |
| **MS-01** | Wykres Postępów   | 1. Dodaj pomiary z 3 różnych dni.        | Wykres liniowy poprawnie rysuje punkty w czasie. |
| **MS-02** | Walidacja Danych  | 1. Spróbuj dodać pomiar z datą przyszłą. | Walidacja Zod blokuje zapis.                     |

## 5. Środowisko testowe

- **Lokalne (Development):** Uruchomienie `npm run dev` z lokalną bazą danych Supabase (lub połączoną z projektem "Dev" w chmurze).
- **Staging:** Wersja produkcyjna aplikacji (build) podłączona do oddzielnej instancji Supabase (z danymi testowymi), aby nie nadpisywać danych produkcyjnych.
- **Przeglądarki:**
- Chrome (Latest) - główne środowisko.
- Safari (iOS/macOS) - weryfikacja Web Speech API i styli iOS.
- Firefox (Latest).

## 6. Narzędzia do testowania

- **Vitest:** Do testów jednostkowych i integracyjnych (logika, hooki, utility).
- **Playwright:** Do testów E2E (pełne ścieżki użytkownika, testy screenshotów dla wykresów).
- **React Testing Library:** Do testowania komponentów (formularze, interakcje w izolacji).
- **ESLint / Prettier / Husky:** Statyczna analiza kodu uruchamiana przed commitem (`pre-commit`).
- **Chrome DevTools:** Emulacja urządzeń mobilnych (weryfikacja responsywności i komponentów Drawer vs Dialog).

## 7. Harmonogram testów

Testy są integralną częścią procesu CI/CD:

1. **Pre-commit:** Linting, Type checking (Husky).
2. **Pull Request:** Automatyczne uruchomienie testów jednostkowych (Vitest) i budowania projektu.
3. **Merge do main/staging:** Uruchomienie testów E2E na środowisku stagingowym.
4. **Release Candidate:** Manualne testy eksploracyjne, ze szczególnym uwzględnieniem "brzegowych" odpowiedzi AI.

## 8. Kryteria akceptacji testów

- Wszystkie testy automatyczne (Unit, Integration) muszą przechodzić (100% pass rate).
- Testy E2E dla ścieżek krytycznych (Rejestracja, Dodanie Posiłku) muszą przechodzić.
- Brak błędów krytycznych (blokujących działanie aplikacji) i wysokich (utrudniających główne funkcje).
- Aplikacja poprawnie renderuje się na mobile (360px+) i desktopie.
- AI Meal Composer obsługuje błędy sieciowe w sposób przyjazny dla użytkownika (Graceful Degradation).

## 9. Role i odpowiedzialności

- **QA Engineer:** Tworzenie planu testów, pisanie testów automatycznych E2E, testy manualne/eksploracyjne, raportowanie błędów.
- **Developer:** Pisanie testów jednostkowych dla tworzonych komponentów/funkcji, utrzymanie zgodności z TypeScript, naprawa zgłoszonych błędów.

## 10. Procedury raportowania błędów

Błędy należy zgłaszać w systemie śledzenia (np. GitHub Issues/Jira) zawierając:

1. **Tytuł:** Zwięzły opis problemu.
2. **Priorytet:** (Krytyczny, Wysoki, Średni, Niski).
3. **Środowisko:** (OS, Przeglądarka, Wersja aplikacji).
4. **Kroki do reprodukcji:** Dokładna lista czynności.
5. **Oczekiwany vs Rzeczywisty rezultat.**
6. **Załączniki:** Logi z konsoli, zrzut ekranu (szczególnie przy błędach wizualnych lub AI), treść toasta z błędem.
