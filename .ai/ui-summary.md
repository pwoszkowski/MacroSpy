<conversation_summary>
<decisions>
1.  **Stan Oczekiwania AI:** Wykorzystanie szkieletowych ekranów (skeleton screens) z animacją podczas analizy, blokujących interakcję do momentu otrzymania JSON.
2.  **Interfejs Korekty (Refine):** Czat w formie nakładki (Bottom Sheet) pod kartą posiłku. Dynamiczna aktualizacja formularza powyżej czatu na podstawie odpowiedzi API.
3.  **Zarządzanie Stanem:** Wybór Nano Stores do synchronizacji danych między wyspami (Astro Islands). Inicjalizacja stanu danymi z serwera (SSR) przekazywanymi przez propsy.
4.  **Nawigacja Główna:** Mobile-first: Sticky Bottom Bar. Desktop: Przeniesienie nawigacji do nagłówka. Przycisk FAB ("Dodaj") centralny i zawsze dostępny.
5.  **Multimodalność:** Przycisk dodawania zdjęć zintegrowany z polem tekstowym (styl komunikatora). Kompresja obrazów po stronie klienta (WebP, max 1024px) przed wysłaniem.
6.  **Onboarding:** Obowiązkowy kreator "krok po kroku". Przerwanie procesu wymusza powrót do początku przy kolejnym logowaniu.
7.  **Widok Historii:** Poziomy pasek przewijania dni (tydzień) na Dashboardzie + Date Picker dla odległych dat.
8.  **Obsługa Błędów:** Komponenty Toast dla błędów sieciowych. Fallback "Wprowadź ręcznie" (identyczny wizualnie jak formularz AI) w przypadku awarii usług AI.
9.  **Wizualizacja Postępów:** Paski postępu zmieniające kolor i wykraczające poza skalę po przekroczeniu celu. Wykresy liniowe (Recharts/SVG) dla pomiarów wagi/składu ciała.
10. **UX Systemowy:** Obsługa przycisku "Wstecz" (History API) do zamykania modali. Przełącznik motywu w Profilu (localStorage + skrypt blokujący).
</decisions>

<matched_recommendations>
1.  Zastosowanie kompresji obrazów po stronie klienta (WebP, resize) w celu optymalizacji payloadu JSON.
2.  Adaptacja nawigacji na desktopie (ukrycie Bottom Bar, przeniesienie do Header) przy zachowaniu dostępności FAB.
3.  Wzorzec inicjalizacji Nano Stores: Astro Frontmatter -> React Props -> `useEffect` (Store update).
4.  Ostrzeganie użytkownika przed zamknięciem modala analizy (utrata kontekstu/danych).
5.  Ujednolicenie UI formularza manualnego i weryfikacji AI dla spójności doświadczenia (Consistency).
6.  Zastosowanie skryptu blokującego w `<head>` dla obsługi Dark Mode (eliminacja migotania).
7.  Integracja otwierania modali/sheetów z `history.pushState` dla natywnego odczucia przycisku "Wstecz".
8.  Zastosowanie wzorca "Loading State" i przekierowań 401 dla komponentów klienckich React.
</matched_recommendations>

<ui_architecture_planning_summary>
### Główne wymagania architektury UI
Architektura opiera się na podejściu **Mobile First** i **PWA**, wykorzystując **Astro** jako szkielet aplikacji (SSR, Routing, Auth) oraz **React** dla interaktywnych "wysp" (formularze, wykresy, mapy). Kluczowym celem jest minimalizacja opóźnień percepowanych przez użytkownika (Optimistic UI, Skeletons) oraz płynna integracja z usługami AI.

### Kluczowe widoki i przepływy
1.  **Onboarding:** Sekwencyjny proces zbierania danych biometrycznych -> Kalkulacja TDEE -> Edycja celów -> Zapis. Jest to proces blokujący dostęp do reszty aplikacji.
2.  **Dashboard (Główny):**
    *   Nagłówek: Wybór dnia (tygodniowy scroll).
    *   Sekcja Progress: Paski makroskładników (reagujące na przekroczenia).
    *   Lista posiłków: Chronologiczna, z pasywnymi sugestiami (toasty/dymki).
    *   FAB: Uruchamia proces dodawania.
3.  **Dodawanie Posiłku (Core Flow):**
    *   Input: Tekst + Zdjęcia (kompresja w locie).
    *   Proces: Request do API -> Skeleton Screen -> Modal Weryfikacji.
    *   Weryfikacja: Karta posiłku + Bottom Sheet (Czat korekcyjny) -> Zapis.
    *   Fallback: Przełączenie na formularz ręczny w razie błędu.
4.  **Historia i Pomiary:** Dedykowane widoki z wykresami liniowymi trendów (waga, tkanka tłuszczowa/mięśniowa) i pełnym kalendarzem.
5.  **Profil:** Zarządzanie kontem, motywem i ponowna edycja celów.

### Strategia Integracji i Danych
*   **Stan Globalny:** Nano Stores jako centralny magazyn danych sesji (sumy makro, cele), inicjowany danymi z SSR przy każdym ładowaniu widoku, aktualizowany optymistycznie po akcjach użytkownika.
*   **API AI:** Traktowane jako bezstanowe (stateless). Kontekst rozmowy jest przechowywany tylko w obrębie otwartego modala weryfikacji. Zamknięcie modala czyści kontekst.
*   **Auth:** Weryfikacja sesji po stronie serwera (Astro Middleware) przed wyrenderowaniem layoutu.

### UX/UI i Dostępność
*   **Responsywność:** Dynamiczna zmiana układu nawigacji (Bottom Bar -> Header) w zależności od breakpointu `md`.
*   **System Feedback:** Rozbudowany system powiadomień (Toasty) dla błędów i sukcesów.
*   **Natywne zachowanie:** Obsługa fizycznego przycisku wstecz dla elementów nakładkowych (modale).
</ui_architecture_planning_summary>

<unresolved_issues>
Brak krytycznych nierozwiązanych kwestii na tym etapie. Wszystkie kluczowe decyzje architektoniczne niezbędne do rozpoczęcia projektowania szczegółowego (mapy ekranów) zostały podjęte. Szczegóły implementacyjne (np. konkretna konfiguracja biblioteki wykresów) zostaną ustalone w fazie dewelopmentu.
</unresolved_issues>
</conversation_summary>