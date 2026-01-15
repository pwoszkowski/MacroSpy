import { CaloriesRing } from './CaloriesRing';
import { MacroBars } from './MacroBars';
import { Card, CardContent } from '@/components/ui/card';
import type { MealSummary, DietaryGoalDto } from '@/types';

interface NutritionSummaryProps {
  current: MealSummary;
  targets: DietaryGoalDto | null;
}

/**
 * Summary section showing daily nutrition progress.
 * Displays calorie ring and macro bars if goals are set.
 */
export function NutritionSummary({ current, targets }: NutritionSummaryProps) {
  // No goals set - show prompt
  if (!targets) {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-4" role="img" aria-label="Cel">🎯</div>
          <h2 className="text-lg font-semibold mb-2">Ustaw swoje cele</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Przejdź do profilu, aby zdefiniować dzienne zapotrzebowanie kaloryczne
            i makroskładniki
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {/* Calorie ring */}
        <div className="flex justify-center mb-6">
          <CaloriesRing 
            current={current.total_calories} 
            target={targets.calories_target} 
          />
        </div>

        {/* Macro bars */}
        <div role="region" aria-label="Postęp makroskładników">
          <MacroBars
            protein={{
              current: current.total_protein,
              target: targets.protein_target,
            }}
            fat={{
              current: current.total_fat,
              target: targets.fat_target,
            }}
            carbs={{
              current: current.total_carbs,
              target: targets.carbs_target,
            }}
            fiber={{
              current: current.total_fiber,
              target: targets.fiber_target,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
