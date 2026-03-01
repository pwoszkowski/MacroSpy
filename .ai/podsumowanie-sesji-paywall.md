# Podsumowanie sesji planistycznej dotyczącej monetyzacji MacroSpy

Ten dokument opisuje architekturę systemu subskrypcji, która pozwoli Ci wystartować z wersją Webową, a w przyszłości bezboleśnie dołączyć aplikacje iOS i Android, zachowując jedno źródło prawdy w bazie Supabase.

## 1. Rekomendacja narzędzi i integracja

**Bramka Płatności (Web):** Wybierz Paddle. Lemon Squeezy zostało niedawno przejęte przez Stripe i ich procesy onboardingowe bywają obecnie zamrożone. Paddle to potężny MoR.

**Ważne (Aspekt podatkowy w PL):** Paddle kupuje od Ciebie usługę (B2B) i sprzedaje ją końcowemu klientowi (B2C). Ty wystawiasz co miesiąc jedną fakturę na firmę Paddle (zwykle reverse-charge VAT), a oni odprowadzają polski 23% VAT od użytkowników z Polski oraz zagraniczne podatki. To w 100% zgodne z polskim prawem i drastycznie upraszcza Twoją księgowość.

**Integracja Mobile (Przyszłość):** RevenueCat. Zamiast pisać osobne integracje dla Apple StoreKit i Google Play Billing, wepniesz je w RevenueCat.

**Strategia połączenia:** Gdy wejdziesz w mobile, podepniesz Paddle do RevenueCat. RevenueCat stanie się Twoim jedynym "hubem" wysyłającym webhooki do Astro. Na teraz, webhooki z Paddle kieruj bezpośrednio do Astro.

## 2. Model bazy danych (Agnostyczny)

Kluczem jest odseparowanie faktu "użytkownik ma dostęp" od tego "gdzie i jak zapłacił". Tworzymy w Supabase dedykowane tabele.

| Tabela | Kluczowe kolumny | Opis |
|--------|------------------|------|
| `users` | `id`, `email`, `trial_ends_at`, `promo_code` | `trial_ends_at` zarządza webowym okresem próbnym bez karty. `promo_code` służy do odblokowania ukrytych ofert. |
| `subscriptions` | `user_id`, `status`, `provider`, `valid_until` | `provider` to np. 'paddle', 'apple', 'google', lub 'friends_pass'. `status` to 'active', 'canceled', 'past_due'. |
| `usage_limits` | `user_id`, `date`, `ai_requests_count` | Zlicza użycie modelu Grok w danym dniu. Resetowane codziennie. |

## 3. Architektura przepływu danych i webhooków

Webhooki to powiadomienia wysyłane przez bramkę płatności do Twojego systemu. Użyjemy do tego API Routes w Astro (działających na Cloudflare).

**Zdarzenie:** Użytkownik kupuje subskrypcję na Webie przez checkout Paddle.

**Webhook:** Paddle wysyła sygnał POST (np. `subscription_created`) na Twój endpoint `https://macrospy.com/api/webhooks/paddle`.

**Weryfikacja:** Kod Astro na Cloudflare weryfikuje podpis (Signature) kryptograficzny webhooka, aby upewnić się, że to na pewno Paddle, a nie atakujący.

**Aktualizacja Bazy:** Jeśli podpis jest poprawny, Astro używa klucza Supabase `service_role_key` (omijającego RLS), aby zaktualizować lub utworzyć wpis w tabeli `subscriptions` dla danego `user_id`.

## 4. Zarządzanie uprawnieniami (Access Control)

Musisz weryfikować status konta na dwóch poziomach: UI (aby pokazać/ukryć elementy) oraz Backend (aby zablokować nieautoryzowane zapytania do OpenRouter).

**Na poziomie Astro (Frontend/Middleware):** Użyj Astro Middleware. Sprawdzaj token sesji Supabase i odpytuj bazę, czy `trial_ends_at > now()` LUB czy istnieje aktywny wpis w `subscriptions`. Jeśli nie, przekieruj użytkownika na stronę `/pricing`.

**Na poziomie API (Backend przed OpenRouter):** W endpoincie Astro, który komunikuje się z AI, wykonaj zapytanie sprawdzające:
- Czy użytkownik ma aktywny dostęp (Trial lub Premium).
- Czy wartość `ai_requests_count` z tabeli `usage_limits` dla dzisiejszej daty nie przekracza np. 50 zapytań.

Jeśli warunki są spełnione, inkrementuj licznik w bazie i wyślij zapytanie do modelu Grok.

## 5. Potencjalne pułapki (Edge cases) na przyszłość

Jako Architekt i PM uczulam Cię na wytyczne sklepów mobilnych, na których poległo wiele projektów SaaS:

**Wytyczna Apple "Anti-Steering" (Złota zasada):** Gdy wydasz aplikację na iOS, nie możesz w niej linkować do swojej strony internetowej w celu zakupu subskrypcji Paddle, ani nawet pisać "Kup taniej na naszej stronie". Aplikacja mobilna musi oferować płatność przez Apple IAP. W przeciwnym razie odrzucą Twoją aplikację podczas Review.

**Logowanie Cross-Platform:** Użytkownik, który opłacił subskrypcję na Webie, może zalogować się w aplikacji iOS i normalnie z niej korzystać. Twój backend (Supabase) zwróci informację, że konto jest Premium. Apple tego nie zabrania, o ile w samej aplikacji nie zniechęcasz do zakupu przez IAP.

**Trial na Mobile:** Jeśli masz 7-dniowy trial bez karty kontrolowany w Twojej bazie (Web), na Mobile użytkownik po rejestracji też dostanie te 7 dni. Po tym czasie w aplikacji iOS powinieneś wyświetlić natywny Paywall Apple (RevenueCat/StoreKit), a na Webie paywall Paddle.

## 6. Ogólny zarys wdrożenia

**Baza Danych:** Zaktualizuj schemat Supabase o tabele `subscriptions` i `usage_limits`. Dodaj kolumnę `trial_ends_at` do istniejącej logiki rejestracji (np. ustawiając datę na `now() + 7 days`).

**Backend AI:** Zmodyfikuj endpoint do OpenRouter. Dodaj twardą weryfikację uprawnień i limitów zużycia przed wysłaniem zapytania do Groka.

**Bramka Płatności:** Załóż konto testowe (Sandbox) na Paddle. Stwórz tam jeden produkt z planem miesięcznym. Wygeneruj klucze API.

**Endpoint Webhooka:** Utwórz plik w Astro (np. `src/pages/api/webhooks/paddle.ts`), który będzie odbierał zdarzenia i logował je w konsoli (na początek).

**Furtka dla znajomych:** Stwórz prosty endpoint w Astro, który po wpisaniu poprawnego `promo_code` w ustawieniach konta, ręcznie stworzy darmowy wpis w `subscriptions` z `provider` `friends_pass`.