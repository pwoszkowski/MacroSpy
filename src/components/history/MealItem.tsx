import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MealDto } from "@/types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface MealItemProps {
  meal: MealDto;
  onEdit: (meal: MealDto) => void;
  onDelete: (id: string) => void;
}

/**
 * Single meal item card with action menu (Edit/Delete).
 * Displays meal name, time, macros, and optional AI suggestion.
 */
export function MealItem({ meal, onEdit, onDelete }: MealItemProps) {
  const consumedTime = format(new Date(meal.consumed_at), "HH:mm", { locale: pl });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">{meal.name}</CardTitle>
          <div className="flex items-center gap-2">
            <time className="text-sm text-muted-foreground" dateTime={meal.consumed_at}>
              {consumedTime}
            </time>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={`Akcje dla posiłku ${meal.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(meal)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edytuj
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(meal.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Usuń
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Macros summary */}
        <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-5">
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
                : "-"}
            </div>
          </div>
        </div>

        {/* AI Suggestion badge */}
        {meal.ai_suggestion && (
          <Badge variant="secondary" className="text-xs whitespace-normal break-words">
            💡 {meal.ai_suggestion}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
