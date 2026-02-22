# Dokument wymagań produktu (PRD) - MacroSpy

## 1. Przegląd produktu

MacroSpy to aplikacja internetowa typu RWD (z możliwością instalacji jako PWA), służąca do inteligentnego monitorowania spożywanych posiłków i kontroli wartości odżywczych. Głównym celem produktu jest maksymalne uproszczenie procesu rejestrowania jedzenia poprzez wykorzystanie sztucznej inteligencji (model grok-4.1-fast). Użytkownik komunikuje się z aplikacją za pomocą tekstu, głosu lub zdjęć, a system automatycznie wylicza makroskładniki. Aplikacja kładzie nacisk na interaktywność (dialog z AI w celu doprecyzowania posiłku) oraz natychmiastową informację zwrotną w postaci pasków postępu dziennego zapotrzebowania.

## 2. Problem użytkownika

Tradycyjne aplikacje do liczenia kalorii wymagają żmudnego, ręcznego wyszukiwania produktów w bazach danych i ważenia składników, co prowadzi do szybkiego zniechęcenia użytkowników (wysoki churn). Użytkownicy często nie potrafią oszacować kaloryczności posiłku "na oko", szczególnie jedząc poza domem. Brakuje im narzędzia, które działałoby jak osobisty asystent, pozwalając na naturalny opis posiłku (np. "zjadłem dużą pizzę margherita") lub przesłanie zdjęcia, zdejmując z użytkownika ciężar matematycznych wyliczeń. Dodatkowo, powtarzalność diety sprawia, że użytkownicy tracą czas na wprowadzanie tych samych złożonych posiłków każdego dnia.

## 3. Wymagania funkcjonalne

### 3.1 Struktura Aplikacji i Nawigacja

Aplikacja opiera się na dolnym pasku nawigacyjnym, który zapewnia szybki dostęp do głównych sekcji w ustalonej kolejności:
1. Dashboard (Główny widok)
2. Historia (Dziennik posiłków)
3. Ulubione (Biblioteka szablonów)
4. Pomiary (Śledzenie postępów ciała)

### 3.2 Uwierzytelnianie i Profil Użytkownika

- Rejestracja i logowanie za pomocą adresu email i hasła.
- Proces onboardingu zawierający kalkulator TDEE/BMR do wyliczenia sugerowanego dziennego zapotrzebowania kalorycznego i makroskładników.
- Możliwość ręcznej edycji celów żywieniowych (kalorie, białko, tłuszcze, węglowodany, błonnik).

### 3.3 Rejestracja Posiłków (Core Feature)

- Dwa tryby wprowadzania:
  - Tryb AI: Multimodalne wprowadzanie danych (tekst/głos + zdjęcia) z automatyczną analizą przez AI (grok-4.1-fast).
  - Tryb ręczny: Bezpośrednie wprowadzanie nazwy posiłku i wartości makroskładników bez użycia AI.
- Przetwarzanie danych przez AI w celu identyfikacji składników i gramatury.
- Interfejs czatu z AI umożliwiający korektę rozpoznanego posiłku przed ostatecznym zapisaniem.
- Możliwość ręcznej edycji wszystkich wartości odżywczych w obu trybach.
- Możliwość jednoczesnego zapisania posiłku do dziennika i do listy ulubionych (checkbox w podsumowaniu).

### 3.4 Dashboard i Prezentacja Danych

- Wizualizacja postępów w czasie rzeczywistym (paski postępu dla kalorii i makroskładników).
- Lista posiłków z bieżącego dnia z możliwością podejrzenia szczegółów.
- Pasywne sugestie dietetyczne wyświetlane przy wpisach.

### 3.5 Moduł Ulubione Posiłki

Funkcjonalność ta pozwala na tworzenie biblioteki szablonów posiłków w celu ich szybkiego ponownego użycia.

- Model danych: Ulubione posiłki są niezależnymi szablonami (snapshotami). Ich edycja nie wpływa na historyczne wpisy w dzienniku, a edycja wpisów w dzienniku nie zmienia szablonu.
- Przechowywanie danych: Dedykowana tabela favorite_meals (id, user_id, name, calories, protein, fat, carbs, fiber, created_at).
- Tworzenie ulubionych:
  - Z poziomu dodawania nowego posiłku (checkbox "Dodaj do ulubionych").
  - Z poziomu historii (opcja w menu kontekstowym istniejącego wpisu).
- Użycie ulubionego (Instancjonowanie):
  - Kliknięcie w element na liście "Ulubione" otwiera modal z wypełnionymi danymi.
  - Możliwość zmiany daty (bieżąca lub przeszła) przed zapisem.
  - Możliwość modyfikacji makroskładników i nazwy przed dodaniem do dziennika (bez zmiany szablonu źródłowego).
- Zarządzanie:
  - Lista ulubionych posiłków z wyszukiwarką i sortowaniem (najnowsze, alfabetycznie).
  - Edycja parametrów szablonu (nazwa, makro) poprzez menu kontekstowe.
  - Usuwanie szablonów.
- Ograniczenia:
  - Limit 100 ulubionych posiłków na użytkownika.
  - Brak przechowywania zdjęć w szablonach (tylko nazwa + makro).
  - Dozwolone duplikaty nazw.

### 3.6 Historia i Zarządzanie Danymi

- Przeglądanie historii posiłków (widok dzienny).
- Dodawanie, edycja, powielanie i usuwanie wpisów historycznych.
- Rejestrowanie wagi ciała oraz składu ciała (% tkanki tłuszczowej, % tkanki mięśniowej).
- Dane przechowywane w chmurze (Cloud-first).

### 3.7 Aspekty Techniczne

- Interfejs w języku polskim.
- Obsługa błędów API (fallbacki w przypadku niedostępności modelu AI).

## 4. Granice produktu

Poniższe funkcjonalności są wyłączone z zakresu MVP:

- Planer posiłków na przyszłe dni.
- Generowanie list zakupów na podstawie przepisów.
- Plany treningowe i śledzenie aktywności fizycznej.
- Pamięć długoterminowa asystenta AI.
- Trwałe przechowywanie zdjęć posiłków w galerii użytkownika.
- Integracje z zewnętrznymi aplikacjami (np. Apple Health).
- Zaawansowane logowanie społecznościowe (Google/Facebook Auth).

## 5. Historyjki użytkowników

### Uwierzytelnianie i Onboarding

#### US-001 Rejestracja nowego konta

- Tytuł: Rejestracja za pomocą emaila
- Opis: Jako nowy użytkownik chcę założyć konto podając email i hasło, aby moje dane były bezpiecznie przechowywane w chmurze.
- Kryteria akceptacji:
  1. System weryfikuje poprawność formatu adresu email.
  2. Hasło musi spełniać minimalne wymogi bezpieczeństwa (min. 8 znaków).
  3. Po udanej rejestracji użytkownik jest przekierowywany do procesu onboardingu.
  4. W przypadku istniejącego emaila system wyświetla odpowiedni komunikat.

#### US-002 Logowanie do aplikacji

- Tytuł: Logowanie istniejącego użytkownika
- Opis: Jako powracający użytkownik chcę zalogować się na swoje konto, aby uzyskać dostęp do swojej historii żywieniowej.
- Kryteria akceptacji:
  1. Użytkownik może zalogować się podając email i hasło.
  2. Błędne dane logowania skutkują komunikatem błędu.
  3. Sesja użytkownika jest utrzymywana po zamknięciu przeglądarki.

#### US-003 Konfiguracja celów (Onboarding)

- Tytuł: Wyliczenie zapotrzebowania kalorycznego
- Opis: Jako nowy użytkownik chcę, aby aplikacja wyliczyła moje zapotrzebowanie na podstawie moich parametrów, abym nie musiał robić tego ręcznie.
- Kryteria akceptacji:
  1. Użytkownik wprowadza płeć, wiek, wagę, wzrost i poziom aktywności.
  2. System wylicza BMR i TDEE na podstawie standardowych wzorów.
  3. System proponuje podział na makroskładniki.
  4. Użytkownik może zaakceptować lub ręcznie nadpisać wyliczone wartości.

### Główny proces (Rejestracja posiłków)

#### US-004 Dodawanie posiłku (Tekst - Tryb AI)

- Tytuł: Opisanie posiłku tekstem z analizą AI
- Opis: Jako użytkownik chcę wpisać opis zjedzonego posiłku, aby AI oszacowało jego wartości odżywcze.
- Kryteria akceptacji:
  1. Dostępny przełącznik wyboru trybu: "Analiza AI" lub "Ręczne dodanie".
  2. W trybie AI dostępne pole tekstowe do wpisania opisu.
  3. Po zatwierdzeniu zapytanie jest wysyłane do modelu AI.
  4. System prezentuje zidentyfikowane składniki i wartości odżywcze do weryfikacji.

#### US-005 Multimodalna analiza posiłku (Zdjęcia + Tekst)

- Tytuł: Analiza posiłku ze zdjęć i opisu
- Opis: Jako użytkownik chcę przesłać jedno lub więcej zdjęć wraz z opcjonalnym opisem tekstowym, aby AI precyzyjnie rozpoznało potrawę.
- Kryteria akceptacji:
  1. Użytkownik może dodać wiele zdjęć jednocześnie.
  2. Użytkownik może opcjonalnie dodać opis tekstowy lub głosowy do zdjęć.
  3. Całość jest przesyłana do analizy AI.
  4. System zwraca listę rozpoznanych produktów.

#### US-006 Dialog korekcyjny z AI

- Tytuł: Korekta składników poprzez czat
- Opis: Jako użytkownik chcę móc napisać do AI, że np. ser był chudy, a nie tłusty, aby precyzyjnie skorygować wyliczenia.
- Kryteria akceptacji:
  1. Po wstępnej analizie użytkownik widzi okno czatu/korekty.
  2. Wpisanie komendy powoduje przeliczenie wartości przez AI.
  3. Zaktualizowane wartości są natychmiast prezentowane na ekranie podglądu.

#### US-007 Dodawanie posiłku (Tryb ręczny)

- Tytuł: Ręczne wprowadzanie wartości odżywczych
- Opis: Jako użytkownik chcę móc ręcznie wprowadzić nazwę posiłku i wartości makroskładników, aby szybko dodać dane na podstawie etykiety produktu lub własnej wiedzy.
- Kryteria akceptacji:
  1. Po wybraniu trybu ręcznego dostępny jest formularz z polami makroskładników.
  2. Walidacja wymaga wypełnienia nazwy oraz zapewnia, że wartości liczbowe są nieujemne.
  3. Przycisk prowadzi do ekranu weryfikacji.

#### US-008 Zatwierdzenie posiłku

- Tytuł: Zapisanie posiłku do dziennika
- Opis: Jako użytkownik chcę jednym przyciskiem zatwierdzić zweryfikowane dane, aby zaktualizować mój dzienny bilans.
- Kryteria akceptacji:
  1. Przycisk "Zapisz" dodaje posiłek do listy "Dzisiaj".
  2. Paski postępu na dashboardzie aktualizują się natychmiastowo.

### Zarządzanie i Historia

#### US-009 Dashboard dzienny

- Tytuł: Podgląd postępów dnia
- Opis: Jako użytkownik chcę widzieć ile kalorii i makroskładników zostało mi do spożycia w danym dniu, aby kontrolować dietę.
- Kryteria akceptacji:
  1. Widoczne paski postępu dla: Kalorii, Białka, Tłuszczy, Węglowodanów.
  2. Liczbowe przedstawienie wartości (zjedzone / cel).
  3. Lista posiłków posortowana chronologicznie.

#### US-010 Zarządzanie historią

- Tytuł: Zarządzanie wpisami historycznymi
- Opis: Jako użytkownik chcę móc dodać zaległy posiłek, powielić podobny wpis, usunąć błędny lub edytować istniejący w przeszłości, aby utrzymać porządek w dzienniku.
- Kryteria akceptacji:
  1. Możliwość wyboru daty z kalendarza w przeszłości.
  2. Możliwość dodania nowego posiłku dla wybranej daty historycznej.
  3. Opcja edycji, powielania i usuwania wpisów w menu kontekstowym.
  4. Wszelkie zmiany aktualizują sumy dla danego dnia historycznego.

#### US-011 Śledzenie parametrów ciała

- Tytuł: Rejestracja pomiarów ciała
- Opis: Jako użytkownik chcę zapisywać swoją wagę oraz skład ciała, aby monitorować postępy zdrowotne.
- Kryteria akceptacji:
  1. Formularz umożliwiający wpisanie: wagi, tkanki tłuszczowej, tkanki mięśniowej.
  2. Pomiary są przypisane do konkretnej daty.
  3. Możliwość podglądu historii pomiarów w dedykowanej zakładce.

#### US-012 Edycja celów i danych profilowych

- Tytuł: Aktualizacja celów dietetycznych
- Opis: Jako użytkownik chcę mieć możliwość zmiany moich danych i przeliczenia celów, aby dostosować aplikację do zmieniających się potrzeb.
- Kryteria akceptacji:
  1. Dostęp do edycji danych profilowych i celów makro.
  2. Zapisanie zmian aktualizuje cele widoczne na dashboardzie.

### Ulubione Posiłki

#### US-013 Zapisywanie nowego posiłku jako ulubiony

- Tytuł: Dodawanie do ulubionych podczas tworzenia
- Opis: Jako użytkownik, chcę zapisać moje skomplikowane śniadanie jako "Ulubione" podczas jego dodawania, aby nie musieć wpisywać go ręcznie w przyszłości.
- Kryteria akceptacji:
  1. W widoku podsumowania posiłku (przed zapisem) dostępny jest checkbox "Dodaj do ulubionych".
  2. Zaznaczenie checkboxa powoduje utworzenie wpisu w bazie ulubionych oraz wpisu w dzienniku.
  3. Nazwa ulubionego posiłku jest taka sama jak nazwa posiłku w dzienniku.

#### US-014 Dodawanie istniejącego posiłku do ulubionych

- Tytuł: Tworzenie szablonu z historii
- Opis: Jako użytkownik chcę dodać posiłek z historii do ulubionych, ponieważ uznałem, że będę go jadł częściej.
- Kryteria akceptacji:
  1. Na liście posiłków w Historii, w menu kontekstowym dostępna jest opcja "Dodaj do ulubionych".
  2. Wybranie opcji tworzy nowy szablon w ulubionych z danymi wybranego posiłku.
  3. Akcja nie usuwa ani nie modyfikuje oryginalnego wpisu w historii.

#### US-015 Przeglądanie i wyszukiwanie ulubionych

- Tytuł: Lista ulubionych posiłków
- Opis: Jako użytkownik chcę mieć szybki dostęp do listy moich ulubionych dań, aby móc z nich skorzystać.
- Kryteria akceptacji:
  1. Dostępna nowa zakładka "Ulubione" w dolnym pasku nawigacji.
  2. Widok zawiera listę kart z nazwami posiłków i podsumowaniem kalorii.
  3. Użytkownik może wyszukiwać posiłki po nazwie.
  4. Użytkownik może sortować listę alfabetycznie lub od najnowszych.
  5. Jeśli lista jest pusta, wyświetlany jest ekran informacyjny z instrukcją i przyciskiem przekierowującym do Dashboardu.

#### US-016 Dodawanie posiłku z ulubionych

- Tytuł: Rejestracja posiłku z szablonu
- Opis: Jako użytkownik chcę wybrać "Owsiankę" z ulubionych, ale zmienić ilość kalorii, bo dziś dodałem więcej orzechów, a także przypisać ją do wczorajszego dnia.
- Kryteria akceptacji:
  1. Kliknięcie w kartę ulubionego posiłku otwiera modal z wypełnionymi danymi.
  2. Użytkownik może zmienić datę spożycia (domyślnie "dzisiaj", możliwość wyboru daty przeszłej).
  3. Użytkownik może edytować makroskładniki i nazwę w tym konkretnym wpisie (nie zmienia to szablonu).
  4. Zatwierdzenie dodaje posiłek do dziennika w wybranym dniu.

#### US-017 Zarządzanie ulubionymi (Edycja i Usuwanie)

- Tytuł: Edycja definicji ulubionego posiłku
- Opis: Jako użytkownik chcę poprawić makroskładniki w moim szablonie "Kurczak z ryżem" lub go usunąć, aby utrzymać aktualność mojej biblioteki.
- Kryteria akceptacji:
  1. W widoku listy Ulubionych, każda karta posiada menu kontekstowe.
  2. Opcja "Edytuj" pozwala zmienić nazwę i makroskładniki trwale w szablonie.
  3. Opcja "Usuń" trwale usuwa posiłek z listy ulubionych (nie usuwa wpisów z historii dziennika).
  4. System blokuje dodanie więcej niż 100 ulubionych posiłków (wyświetla komunikat).
