# Dokument wymagań produktu (PRD) - MacroSpy

## 1. Przegląd produktu

MacroSpy to aplikacja internetowa typu RWD (z możliwością instalacji jako PWA), służąca do inteligentnego monitorowania spożywanych posiłków i kontroli wartości odżywczych. Głównym celem produktu jest maksymalne uproszczenie procesu rejestrowania jedzenia poprzez wykorzystanie sztucznej inteligencji (model grok-4.1-fast). Użytkownik komunikuje się z aplikacją za pomocą tekstu, głosu lub zdjęć, a system automatycznie wylicza makroskładniki. Aplikacja kładzie nacisk na interaktywność (dialog z AI w celu doprecyzowania posiłku) oraz natychmiastową informację zwrotną w postaci pasków postępu dziennego zapotrzebowania.

## 2. Problem użytkownika

Tradycyjne aplikacje do liczenia kalorii wymagają żmudnego, ręcznego wyszukiwania produktów w bazach danych i ważenia składników, co prowadzi do szybkiego zniechęcenia użytkowników (wysoki churn). Użytkownicy często nie potrafią oszacować kaloryczności posiłku "na oko", szczególnie jedząc poza domem. Brakuje im narzędzia, które działałoby jak osobisty asystent, pozwalając na naturalny opis posiłku (np. "zjadłem dużą pizzę margherita") lub przesłanie zdjęcia, zdejmując z użytkownika ciężar matematycznych wyliczeń.

## 3. Wymagania funkcjonalne

### 3.1 Uwierzytelnianie i Profil Użytkownika

- Rejestracja i logowanie za pomocą adresu email i hasła.
- Proces onboardingu zawierający kalkulator TDEE/BMR do wyliczenia sugerowanego dziennego zapotrzebowania kalorycznego i makroskładników.
- Możliwość ręcznej edycji celów żywieniowych (kalorie, białko, tłuszcze, węglowodany, błonnik).

### 3.2 Rejestracja Posiłków (Core Feature)

- **Dwa tryby wprowadzania**:
  - **Tryb AI**: Multimodalne wprowadzanie danych (tekst/głos + zdjęcia) z automatyczną analizą przez AI (grok-4.1-fast).
  - **Tryb ręczny**: Bezpośrednie wprowadzanie nazwy posiłku i wartości makroskładników bez użycia AI.
- Przetwarzanie danych przez AI (grok-4.1-fast) w celu identyfikacji składników i gramatury (tryb AI).
- Interfejs czatu z AI umożliwiający korektę rozpoznanego posiłku (np. "zmień kurczaka na tofu") przed ostatecznym zapisaniem (tryb AI).
- Możliwość ręcznej edycji wszystkich wartości odżywczych w obu trybach.
- Wymagany krok weryfikacji danych przez użytkownika przed dodaniem do historii.
- Zdjęcia są przetwarzane ulotnie (nie są trwale archiwizowane).

### 3.3 Dashboard i Prezentacja Danych

- Wizualizacja postępów w czasie rzeczywistym (paski postępu dla kalorii i makroskładników).
- Lista posiłków z bieżącego dnia z możliwością podejrzenia szczegółów.
- Pasywne sugestie dietetyczne (dymki informacyjne) wyświetlane przy wpisach.

### 3.4 Historia i Zarządzanie Danymi

- Przeglądanie historii posiłków (widok dzienny).
- Dodawanie, edycja i usuwanie wpisów historycznych (zarządzanie przeszłością).
- Rejestrowanie wagi ciała oraz składu ciała (% tkanki tłuszczowej, % tkanki mięśniowej) (funkcja Should Have).
- Dane przechowywane w chmurze (Cloud-first).

### 3.5 Aspekty Techniczne

- Interfejs w języku polskim.
- Obsługa błędów API (fallbacki w przypadku niedostępności modelu AI).

## 4. Granice produktu

Poniższe funkcjonalności są wyłączone z zakresu MVP:

- Planer posiłków na przyszłe dni.
- Generowanie list zakupów na podstawie przepisów.
- Plany treningowe i śledzenie aktywności fizycznej.
- Pamięć długoterminowa asystenta AI (kontekst resetuje się codziennie).
- Trwałe przechowywanie zdjęć posiłków w galerii użytkownika.
- Integracje z zewnętrznymi aplikacjami (np. Apple Health, Google Fit).
- Zaawansowane logowanie społecznościowe (Google/Facebook Auth) - tylko email/hasło w MVP.

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
  3. Sesja użytkownika jest utrzymywana po zamknięciu przeglądarki (Remember me).

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
  2. W trybie AI dostępne pole tekstowe do wpisania opisu (np. "jajecznica z 3 jaj na maśle").
  3. Po zatwierdzeniu zapytanie jest wysyłane do modelu grok-4.1-fast.
  4. System prezentuje zidentyfikowane składniki i wartości odżywcze do weryfikacji.

#### US-005 Multimodalna analiza posiłku (Zdjęcia + Tekst)

- Tytuł: Analiza posiłku ze zdjęć i opisu
- Opis: Jako użytkownik chcę przesłać jedno lub więcej zdjęć wraz z opcjonalnym opisem tekstowym, aby AI precyzyjnie rozpoznało potrawę.
- Kryteria akceptacji:
  1. Użytkownik może dodać wiele zdjęć jednocześnie (z galerii lub aparatu).
  2. Użytkownik może opcjonalnie dodać opis tekstowy lub głosowy do zdjęć (multimodalność).
  3. Całość (zdjęcia + kontekst tekstowy) jest przesyłana do analizy AI.
  4. System zwraca listę rozpoznanych produktów.

#### US-006 Dialog korekcyjny z AI

- Tytuł: Korekta składników poprzez czat
- Opis: Jako użytkownik chcę móc napisać do AI, że np. ser był chudy, a nie tłusty, aby precyzyjnie skorygować wyliczenia.
- Kryteria akceptacji:
  1. Po wstępnej analizie użytkownik widzi okno czatu/korekty.
  2. Wpisanie komendy (np. "to było bez masła") powoduje przeliczenie wartości przez AI.
  3. Zaktualizowane wartości są natychmiast prezentowane na ekranie podglądu.

#### US-007 Dodawanie posiłku (Tryb ręczny)

- Tytuł: Ręczne wprowadzanie wartości odżywczych
- Opis: Jako użytkownik chcę móc ręcznie wprowadzić nazwę posiłku i wartości makroskładników, aby szybko dodać dane na podstawie etykiety produktu lub własnej wiedzy.
- Kryteria akceptacji:
  1. Po wybraniu trybu "Ręczne dodanie" dostępny jest formularz z polami: nazwa, kalorie, białko, tłuszcze, węglowodany, błonnik.
  2. Walidacja wymaga wypełnienia nazwy (min. 2 znaki) oraz zapewnia, że wartości liczbowe są >= 0.
  3. Przycisk "Przejdź do podsumowania" prowadzi do ekranu weryfikacji.
  4. W trybie ręcznym niedostępne są funkcje AI (refine, sugestie dietetyczne).

#### US-008 Zatwierdzenie posiłku

- Tytuł: Zapisanie posiłku do dziennika
- Opis: Jako użytkownik chcę jednym przyciskiem zatwierdzić zweryfikowane dane, aby zaktualizować mój dzienny bilans.
- Kryteria akceptacji:
  1. Przycisk "Zapisz" jest dostępny po otrzymaniu danych z AI lub wprowadzeniu ręcznym.
  2. Kliknięcie dodaje posiłek do listy "Dzisiaj".
  3. Paski postępu na dashboardzie aktualizują się natychmiastowo.
  4. Wyświetla się pasywna sugestia (dymek), jeśli AI ją wygenerowało (tylko tryb AI).

### Zarządzanie i Historia

#### US-009 Dashboard dzienny

- Tytuł: Podgląd postępów dnia
- Opis: Jako użytkownik chcę widzieć ile kalorii i makroskładników zostało mi do spożycia w danym dniu, aby kontrolować dietę.
- Kryteria akceptacji:
  1. Widoczne paski postępu dla: Kalorii, Białka, Tłuszczy, Węglowodanów.
  2. Liczbowe przedstawienie wartości (zjedzone / cel).
  3. Lista posiłków posortowana chronologicznie.

#### US-010 Zarządzanie historią (Dodawanie/Edycja/Usuwanie)

- Tytuł: Zarządzanie wpisami historycznymi
- Opis: Jako użytkownik chcę móc dodać zaległy posiłek, usunąć błędny lub edytować istniejący w przeszłości, aby utrzymać porządek w dzienniku.
- Kryteria akceptacji:
  1. Możliwość wyboru daty z kalendarza w przeszłości.
  2. Możliwość dodania nowego posiłku dla wybranej daty historycznej.
  3. Opcja edycji i usuwania istniejących posiłków historycznych.
  4. Wszelkie zmiany aktualizują sumy dla danego dnia historycznego.

#### US-011 Śledzenie parametrów ciała (Should Have)

- Tytuł: Rejestracja pomiarów ciała
- Opis: Jako użytkownik chcę zapisywać swoją wagę oraz skład ciała, aby monitorować postępy zdrowotne.
- Kryteria akceptacji:
  1. Formularz umożliwiający wpisanie: wagi (kg), tkanki tłuszczowej (%), tkanki mięśniowej (%).
  2. Pomiary są przypisane do konkretnej daty.
  3. Możliwość podglądu historii pomiarów.

#### US-012 Edycja celów i danych profilowych

- Tytuł: Aktualizacja celów dietetycznych i parametrów
- Opis: Jako użytkownik chcę mieć możliwość zmiany moich danych (np. waga, aktywność) i przeliczenia celów na nowo lub ręcznej edycji limitów kalorii i makroskładników, aby dostosować aplikację do zmieniających się potrzeb.
- Kryteria akceptacji:
  1. Dostęp do edycji danych profilowych (waga, wzrost, wiek, płeć, poziom aktywności).
  2. Przycisk umożliwiający ponowne przeliczenie zapotrzebowania (TDEE/BMR) na podstawie zaktualizowanych danych.
  3. Możliwość ręcznej edycji docelowych wartości kalorii i makroskładników (białko, tłuszcze, węglowodany) niezależnie od kalkulatora.
  4. Zapisanie zmian aktualizuje cele widoczne na dashboardzie (od bieżącego momentu).

## 6. Metryki sukcesu

- Retencja (Aktywność): 80% użytkowników loguje minimum 3 posiłki dziennie przez 5 dni w tygodniu.
- Efektywność (Cel zdrowotny): 50% aktywnych użytkowników poprawia swoje wskaźniki (np. obniżenie tkanki tłuszczowej, poprawa tkanki mięśniowej, pozytywna zmiana wagi) w ciągu 30 dni.
- Stabilność: Czas dostępności usługi (uptime) na poziomie 99.5%, wskaźnik błędów API AI poniżej 1%.
