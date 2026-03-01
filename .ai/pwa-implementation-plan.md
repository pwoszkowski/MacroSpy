# Plan Wdrożenia PWA dla MacroSpy

## 1. Cel Wdrożenia
Przekształcenie aplikacji webowej MacroSpy w instalowalną aplikację PWA (Progressive Web App), która zapewnia:
- Obecność na ekranie głównym urządzenia (ikona).
- Szybkie ładowanie dzięki cache'owaniu zasobów (App Shell).
- Możliwość przeglądania ostatnio załadowanych danych w trybie offline.
- Jasną komunikację o braku połączenia przy próbie edycji danych.

## 2. Wymagania Wstępne i Zasoby (Assets)

### 2.1 Generowanie Ikon
Aplikacja wymaga zestawu ikon w formacie PNG, wygenerowanych na podstawie obecnego `public/favicon.svg`.

- [ ] **Zadanie:** Utworzenie plików ikon w `public/icons/`:
    - `pwa-192x192.png` (dla ekranu głównego Android/iOS)
    - `pwa-512x512.png` (dla splash screen i sklepu)
    - `maskable-icon-512x512.png` (dla Androida - ikona adaptacyjna)
    - `apple-touch-icon.png` (180x180 - specyficzna dla iOS)

### 2.2 Konfiguracja Meta Tagów
- [ ] **Zadanie:** Aktualizacja `src/layouts/Layout.astro` oraz `src/layouts/AuthLayout.astro`:
    - Dodanie `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`
    - Dodanie `<meta name="theme-color" ...>` obsługującego tryb jasny (`#ffffff`) i ciemny (`#09090b`).
    - Dodanie `<meta name="apple-mobile-web-app-capable" content="yes">` (ukrywa UI Safari w trybie standalone).

## 3. Konfiguracja Techniczna (Vite PWA)

Wykorzystamy plugin `@vite-pwa/astro` do automatyzacji generowania Service Workera i Manifestu.

### 3.1 Instalacja i Konfiguracja Pluginu
- [ ] **Zadanie:** Instalacja zależności:
  ```bash
  npm install @vite-pwa/astro workbox-window
  ```
- [ ] **Zadanie:** Konfiguracja `astro.config.mjs`:
  - Integracja pluginu PWA.
  - Ustawienie strategii `injectManifest` (dla większej kontroli) lub `generateSW` ze skomplikowaną konfiguracją runtimeCaching. Rekomenduję `generateSW` na start z customowymi regułami.

### 3.2 Plik Manifestu (Web App Manifest)
- [ ] **Zadanie:** Definicja manifestu w konfiguracji PWA:
  - `name`: "MacroSpy - Monitoruj dietę z AI"
  - `short_name`: "MacroSpy"
  - `description`: "Inteligentny licznik makroskładników z pomocą AI."
  - `theme_color`: "#ffffff"
  - `background_color`: "#ffffff"
  - `display`: "standalone"
  - `orientation`: "portrait"
  - `start_url`: "/"
  - `icons`: [lista wygenerowanych ikon]

## 4. Strategia Caching i Offline (Service Worker)

Zastosujemy hybrydową strategię cache'owania, aby umożliwić przeglądanie historii offline.

### 4.1 Strategie Workbox
- [ ] **Zadanie:** Konfiguracja `workbox.runtimeCaching`:
    1.  **Zasoby statyczne (JS, CSS, Fonty, Ikony):**
        - Strategia: `CacheFirst` (Cache, potem sieć).
        - Cel: Natychmiastowe ładowanie interfejsu ("App Shell").
    2.  **Nawigacja i HTML (Strony /dashboard, /history):**
        - Strategia: `NetworkFirst` (Sieć, potem Cache).
        - Cel: Próba pobrania najnowszej wersji strony. Jeśli brak sieci -> pokaż wersję z cache (ostatnio widzianą).
    3.  **API Supabase (Odczyt danych):**
        - Strategia: `NetworkFirst`.
        - Cel: Cache'owanie odpowiedzi JSON z bazy danych, aby widoki dynamiczne (ładowane po stronie klienta) miały dane.
    4.  **Obrazy zewnętrzne (np. zdjęcia posiłków z storage):**
        - Strategia: `StaleWhileRevalidate` (Pokaż stare, pobierz nowe w tle) z limitem wpisów (np. 50 ostatnich zdjęć).

### 4.2 Obsługa Błędów (Fallback)
- [ ] **Zadanie:** Stworzenie strony `src/pages/offline.astro`.
- [ ] **Zadanie:** Konfiguracja SW, aby serwował `offline.html` w przypadku braku sieci I braku strony w cache (np. użytkownik wchodzi na podstronę, której nigdy wcześniej nie odwiedził).

## 5. User Experience (UX)

### 5.1 Wskaźnik Offline i Blokada Akcji
- [ ] **Zadanie:** Stworzenie komponentu `NetworkStatus.tsx` (React):
    - Nasłuchuje zdarzeń `online` / `offline`.
    - Wyświetla subtelny toast/banner: "Jesteś offline. Wyświetlam zapisane dane."
- [ ] **Zadanie:** Modyfikacja formularzy dodawania posiłku/pomiaru:
    - Jeśli `!isOnline`, przycisk "Zapisz" jest nieaktywny (disabled).
    - Wyświetlenie komunikatu: "Połącz się z internetem, aby zapisać dane."

### 5.2 Aktualizacja Aplikacji (Reload Prompt)
- [ ] **Zadanie:** Stworzenie komponentu `ReloadPrompt.tsx`:
    - Wykorzystuje hook `useRegisterSW` z `virtual:pwa-register/react`.
    - Wyświetla Toast z przyciskiem "Odśwież", gdy Service Worker wykryje nową wersję aplikacji.

## 6. Wdrożenie i Weryfikacja

- [ ] **Zadanie:** Budowa produkcyjna (`npm run build`) i weryfikacja generowanych plików (`sw.js`, `manifest.webmanifest`).
- [ ] **Zadanie:** Audyt Lighthouse:
    - Kategoria PWA: Musi być "Installable".
    - Weryfikacja działania offline (tryb samolotowy).
