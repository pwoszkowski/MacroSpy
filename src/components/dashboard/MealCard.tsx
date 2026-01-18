import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MealDto } from '@/types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface MealCardProps {
  meal: MealDto;
  onClick?: () => void;
}

/**
 * Card component displaying a single meal entry.
 * Shows meal name, time, macros, and optional AI suggestion.
 */
export function MealCard({ meal, onClick }: MealCardProps) {
  const consumedTime = format(new Date(meal.consumed_at), 'HH:mm', { locale: pl });

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Posiłek: ${meal.name} o godzinie ${consumedTime}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">{meal.name}</CardTitle>
          <time className="text-sm text-muted-foreground" dateTime={meal.consumed_at}>
            {consumedTime}
          </time>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Macros summary */}
        <div className="grid grid-cols-5 gap-2 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Kalorie</div>
            <div className="font-semibold">{Math.round(meal.calories)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Białko</div>
            <div className="font-semibold">{Math.round(meal.protein)}g</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Tłuszcze</div>
            <div className="font-semibold">{Math.round(meal.fat)}g</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Węglowodany</div>
            <div className="font-semibold">{Math.round(meal.carbs)}g</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Błonnik</div>
            <div className="font-semibold">
              {meal.fiber !== null && meal.fiber !== undefined 
                ? `${Math.round(meal.fiber)}g` 
                : '-'}
            </div>
          </div>
        </div>

        {/* AI Suggestion badge */}
        {meal.ai_suggestion && (
          <Badge variant="secondary" className="text-xs sm:whitespace-nowrap sm:shrink-0 whitespace-normal shrink">
            💡 {meal.ai_suggestion}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
