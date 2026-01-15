# Dashboard Components

Komponenty widoku Dashboard - centralnego punktu aplikacji MacroSpy.

## Struktura

```
DashboardContainer (główny kontener)
├── DateHeader (sticky header)
│   └── DaySelector (scroll + calendar)
├── NutritionSummary (postęp)
│   ├── CaloriesRing (circular progress)
│   └── MacroBars (4x linear progress: białko, tłuszcze, węgle, błonnik)
├── MealList (lista posiłków)
│   └── MealCard (pojedynczy posiłek + błonnik)
└── AddMealFAB (floating button)
```

## Komponenty

### DashboardContainer
Główny kontener zarządzający stanem i integrujący wszystkie subkomponenty.

**Props:**
- `initialMeals: MealListResponse` - dane SSR dla dzisiejszego dnia
- `userProfile: UserProfileResponse` - profil użytkownika z celami

### DateHeader
Sticky header z wybraną datą i selektorem dni.

**Props:**
- `selectedDate: Date`
- `onDateChange: (date: Date) => void`

### DaySelector
Horizontal scroll z ostatnimi 7 dniami + kalendarz w popover.

### NutritionSummary
Wizualizacja postępu kalorii, makroskładników i błonnika.

**Props:**
- `current: MealSummary` - spożyte wartości
- `targets: DietaryGoalDto | null` - cele żywieniowe

**Wyświetla:**
- CaloriesRing - pierścień kalorii
- MacroBars - 4 paski: białko, tłuszcze, węglowodany, błonnik

### MealList
Lista kart posiłków z empty state.

**Props:**
- `meals: MealDto[]`
- `onMealClick?: (mealId: string) => void`

### MealCard
Karta pojedynczego posiłku z makro, błonnikiem i sugestią AI.

**Props:**
- `meal: MealDto`
- `onClick?: () => void`

**Wyświetla:**
- Nazwę posiłku i godzinę spożycia
- 5 wartości odżywczych w siatce: kalorie, białko, tłuszcze, węglowodany, błonnik
- Badge z sugestią AI (jeśli dostępna)

**Uwaga:** Błonnik wyświetla "-" jeśli wartość jest niedostępna (null/undefined)

### AddMealFAB
Floating Action Button do szybkiego dodawania posiłków.

**Props:**
- `onClick: () => void`

## Skeleton States

Dla lepszego UX podczas ładowania:
- `SkeletonNutritionSummary`
- `SkeletonMealCard`

## Hook

### useDashboardData
Custom hook do zarządzania danymi posiłków.

**Parametry:**
- `selectedDate: Date`
- `initialData?: MealListResponse`

**Zwraca:**
- `data: MealListResponse | null`
- `isLoading: boolean`
- `error: string | null`
- `refetch: () => Promise<void>`

## Accessibility

- ARIA labels i landmarks
- Keyboard navigation (Enter/Space na kartach)
- Focus management
- Role attributes
- Screen reader friendly

## Responsywność

- Mobile-first approach
- Breakpoints: sm (640px+)
- Adaptive font sizes
- Scrollable day selector
- Optimized FAB position
