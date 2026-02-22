import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FavoriteMealDto } from "@/types";
import { FavoriteCardActions } from "./FavoriteCardActions";

interface FavoriteCardProps {
  favorite: FavoriteMealDto;
  onSelect: (favorite: FavoriteMealDto) => void;
  onEdit: (favorite: FavoriteMealDto) => void;
  onDelete: (favorite: FavoriteMealDto) => void;
}

export function FavoriteCard({ favorite, onSelect, onEdit, onDelete }: FavoriteCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/40"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(favorite)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(favorite);
        }
      }}
      aria-label={`Dodaj do dziennika: ${favorite.name}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="min-w-0 flex-1">
          <CardTitle className="line-clamp-2 text-base sm:text-lg">{favorite.name}</CardTitle>
        </div>

        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          role="presentation"
        >
          <FavoriteCardActions onEdit={() => onEdit(favorite)} onDelete={() => onDelete(favorite)} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{favorite.calories} kcal</Badge>
          <Badge variant="outline">B: {favorite.protein} g</Badge>
          <Badge variant="outline">T: {favorite.fat} g</Badge>
          <Badge variant="outline">W: {favorite.carbs} g</Badge>
          <Badge variant="outline">Bl: {favorite.fiber ?? 0} g</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
