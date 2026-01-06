<conversation_summary>
<decisions>
Rozdzielenie danych: Oddzielna tabela profiles (dane antropometryczne) powiązana 1:1 z auth.users oraz tabela dietary_goals (historia celów) powiązana 1:N.
Struktura posiłków: Pojedyncza encja meals przechowująca kompletne dane sumaryczne posiłku (nazwa, data, kalorie, makroskładniki). Rezygnacja z rozbijania na składniki (meal_items).
Nazewnictwo posiłków: Rezygnacja ze słownika typów (np. "Śniadanie") na rzecz opisowej nazwy generowanej przez AI (np. "Jajecznica z awokado").
Dane AI: Przechowywanie ostatniego kontekstu rozmowy (last_ai_context jako JSONB), oryginalnego promptu oraz sugestii (ai_suggestion). Zdjęcia nie są archiwizowane (tylko flaga is_image_analyzed).
Typy danych: Makroskładniki jako NUMERIC(10, 1), kalorie jako INTEGER, czas jako TIMESTAMPTZ.
Jednostki: Normalizacja w bazie do systemu metrycznego (kg, g, cm).
Bezpieczeństwo i Integralność: Włączone RLS dla wszystkich tabel, użycie ograniczeń CHECK (wartości nieujemne), Hard Delete dla usuwania rekordów.
Automatyzacja: Użycie triggerów do tworzenia profilu po rejestracji oraz aktualizacji pola updated_at.
Konfiguracja Supabase: Wyłączenie funkcji Realtime dla oszczędności zasobów.
Dodatkowe funkcje: Utworzenie tabeli body_measurements (waga, skład ciała) od razu w MVP.
</decisions>
<matched_recommendations>
Utworzenie tabeli profiles w relacji 1:1 z auth.users.
Utworzenie tabeli dietary_goals do śledzenia historii celów żywieniowych.
Użycie typu JSONB dla kontekstu AI oraz TIMESTAMPTZ dla czasu.
Zastosowanie indeksów złożonych: idx_meals_user_date oraz idx_goals_user_date.
Implementacja triggera after insert on auth.users.
Dodanie kolumn ai_suggestion oraz is_image_analyzed.
Zastosowanie CHECK constraints dla wartości liczbowych (np. calories >= 0).
</matched_recommendations>
<database_planning_summary>
Na podstawie analizy wymagań i dyskusji zaplanowano schemat bazy danych PostgreSQL zintegrowany z Supabase Auth.
Główne założenia schematu:
Baza danych opiera się na centralnej encji użytkownika (auth.users), wokół której zbudowane są moduły: profilu, historii celów, dziennika posiłków oraz pomiarów ciała. Przyjęto strategię Cloud-first z naciskiem na bezpieczeństwo (RLS) i integralność danych. Model posiłków został uproszczony do pojedynczej tabeli zawierającej sumaryczne wartości.
Kluczowe encje i relacje:
Użytkownicy i Profile:
auth.users (zarządzane przez Supabase).
public.profiles (1:1 z users) – aktualne wymiary (wzrost, płeć, data urodzenia).
public.dietary_goals (1:N z users) – historia celów (kalorie, makro, TDEE, BMR) z datą obowiązywania.
Dziennik Posiłków:
public.meals (1:N z users) – encja reprezentująca posiłek.
Przechowuje: nazwę (generowaną przez AI), czas (consumed_at), sumę kalorii, białka, tłuszczy, węglowodanów i błonnika.
Zawiera metadane AI: original_prompt, last_ai_context (JSONB) do kontynuacji rozmowy, ai_suggestion oraz is_image_analyzed.
Monitorowanie postępów:
public.body_measurements (1:N z users) – historia pomiarów wagi i składu ciała.
Bezpieczeństwo i Skalowalność:
RLS: Polityka dostępu ograniczona do właściciela rekordu (auth.uid() = user_id) dla wszystkich tabel publicznych.
Wydajność: Indeksy na polach user_id oraz datach (consumed_at, start_date) w celu optymalizacji widoków dashboardu. Wyłączony Realtime.
Spójność: Triggery obsługujące updated_at i tworzenie profilu. Constraints pilnujące logicznej poprawności liczb.
Aspekty techniczne:
Wszystkie wartości liczbowe znormalizowane do systemu metrycznego. Czas przechowywany w UTC (TIMESTAMPTZ), konwersja do strefy czasowej użytkownika po stronie klienta.
</database_planning_summary>
<unresolved_issues>
Brak istotnych nierozwiązanych kwestii. Wszystkie kluczowe decyzje architektoniczne dla etapu MVP zostały podjęte. Można przystąpić do generowania kodu SQL (DDL).
</unresolved_issues>
</conversation_summary>