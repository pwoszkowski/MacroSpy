import { MealItem } from "./MealItem";
import { Skeleton } from "@/components/ui/skeleton";
import type { MealDto } from "@/types";

interface MealListProps {
  meals: MealDto[];
  isLoading: boolean;
  onEdit: (meal: MealDto) => void;
  onDuplicate: (meal: MealDto) => void;
  onDelete: (id: string) => void;
}

function MealItemSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

/**
 * List of meal items for history view.
 * Shows loading skeletons, empty state, or meal cards with actions.
 */
export function MealList({ meals, isLoading, onEdit, onDuplicate, onDelete }: MealListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <MealItemSkeleton />
        <MealItemSkeleton />
        <MealItemSkeleton />
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center border rounded-lg">
        <div className="text-6xl mb-4" role="img" aria-label="Brak posiłków">
          🍽️
        </div>
        <h2 className="text-lg font-semibold mb-2">Brak wpisów dla tego dnia</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Dodaj posiłek, aby rozpocząć śledzenie dla wybranej daty
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Lista posiłków">
      {meals.map((meal) => (
        <li key={meal.id}>
          <MealItem meal={meal} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
