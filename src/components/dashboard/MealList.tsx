import { MealCard } from './MealCard';
import type { MealDto } from '@/types';

interface MealListProps {
  meals: MealDto[];
  onMealClick?: (mealId: string) => void;
}

/**
 * List of meal cards for the selected day.
 * Shows empty state when no meals are logged.
 */
export function MealList({ meals, onMealClick }: MealListProps) {
  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-6xl mb-4" role="img" aria-label="Posiłek">🍽️</div>
        <h2 className="text-lg font-semibold mb-2">Brak posiłków</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Dodaj swój pierwszy posiłek, aby rozpocząć śledzenie postępów
        </p>
      </div>
    );
  }

  return (
    <ul 
      className="space-y-3" 
      role="list"
      aria-label="Lista posiłków"
    >
      {meals.map((meal) => (
        <li key={meal.id}>
          <MealCard 
            meal={meal} 
            onClick={() => onMealClick?.(meal.id)}
          />
        </li>
      ))}
    </ul>
  );
}
