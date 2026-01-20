<conversation_summary>
<decisions>
Platforma: Aplikacja internetowa RWD z opcją instalacji jako PWA (Progressive Web App).
Model AI: Wykorzystanie modelu grok-4.1-fast za pośrednictwem OpenRouter.
Zakres funkcjonalny (Scope creep):
Funkcja dialogu z AI przeniesiona do sekcji MUST HAVE.
Rejestracja wagi ciała przeniesiona do sekcji SHOULD HAVE.
Logika przetwarzania zdjęć: Zdjęcia są wysyłane tylko w celu ekstrakcji danych (konwersacja z AI), nie są trwale przechowywane (usuwane po przetworzeniu).
Uwierzytelnianie: W MVP dostępna tylko standardowa rejestracja i logowanie (Email + Hasło).
Magazyn danych: Dane przechowywane od razu w chmurze (Cloud-first).
Język: Interfejs wyłącznie w języku polskim.
Onboarding: Zastosowanie kalkulatora opartego na wzorach (TDEE/BMR) do sugerowania celów kalorycznych.
</decisions>
<matched_recommendations>
Wprowadzenie obowiązkowego kroku weryfikacji danych zwróconych przez AI (składniki/gramatura) przed ich zapisaniem.
Zdefiniowanie konkretnej metryki "sumiennego rejestrowania" jako: logowanie min. 3 posiłków dziennie przez 5 dni w tygodniu.
Wdrożenie pasywnego systemu sugestii (dymki informacyjne), które nie blokują procesu zapisywania posiłku.
Umożliwienie edycji i usuwania wpisów historycznych (z dowolnego dnia).
</matched_matched_recommendations>
<prd_planning_summary>
a. Główne wymagania funkcjonalne produktu
Rejestracja i Profil: Zakładanie konta (email/hasło), onboarding z kalkulatorem zapotrzebowania (TDEE) wyliczającym cele dzienne.
Tracking Posiłków:
Input: Tekst, Głos (speech-to-text), Zdjęcie.
Przetwarzanie AI: Model grok-4.1-fast identyfikuje składniki.
Weryfikacja: Użytkownik widzi listę składników i może prowadzić dialog z AI w celu korekty (np. "to był ser light").
Parametry śledzone: Kalorie, Białko, Tłuszcze, Węglowodany, Błonnik.
Dashboard:
Pasek postępu dla kalorii i makroskładników (góra ekranu).
Lista posiłków z bieżącego dnia.
Sugestie dietetyczne w formie pasywnych powiadomień przy wpisie.
Wyraźny przycisk CTA do dodawania posiłku.
Historia: Przeglądanie, edycja i usuwanie wpisów z przeszłości.
Ograniczenia systemowe: Kontekst AI resetowany każdego dnia (brak pamięci długoterminowej asystenta).
b. Kluczowe historie użytkownika i ścieżki korzystania
Scenariusz "Szybki Lunch": Użytkownik robi zdjęcie obiadu -> AI rozpoznaje danie -> Użytkownik potwierdza gramaturę jednym kliknięciem -> Posiłek dodany, paski postępu zaktualizowane.
Scenariusz "Korekta błędu": Użytkownik wpisuje "kanapka" -> AI zakłada chleb pszenny -> Użytkownik pisze "zmień na chleb żytni" -> AI przelicza wartości -> Użytkownik zatwierdza.
c. Ważne kryteria sukcesu i sposoby ich mierzenia
Retencja (Aktywność): % użytkowników logujących min. 3 posiłki dziennie przez 5 dni w tygodniu. Cel: 80% (zgodnie z pierwotnym założeniem, choć bardzo ambitne).
Efektywność (Cel zdrowotny): 50% użytkowników poprawia swoje parametry (waga, tkanka tłuszczowa) w określonym czasie (wymaga modułu śledzenia wagi z sekcji Should).
d. Nierozwiązane kwestie lub obszary wymagające dalszego wyjaśnienia
Szczegółowy stos technologiczny (Frontend framework, Backend provider) - decyzja odroczona.
Sposób obsługi błędów API OpenRouter (np. co się dzieje, gdy model jest niedostępny - fallback czy komunikat błędu?).
</prd_planning_summary>
<unresolved_issues>
Wybór konkretnych technologii dla warstwy technicznej (Frontend/Backend).
Szczegóły wizualne (UI Kit/Design System) nie zostały omówione.
</unresolved_issues>
</conversation_summary>
