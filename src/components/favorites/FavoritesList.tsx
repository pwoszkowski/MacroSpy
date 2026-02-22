import type { FavoriteMealDto } from "@/types";
import { FavoriteCard } from "./FavoriteCard";
import { FavoritesEmptyState } from "./FavoritesEmptyState";

interface FavoritesListProps {
  favorites: FavoriteMealDto[];
  hasSearchQuery: boolean;
  onSelect: (favorite: FavoriteMealDto) => void;
  onEdit: (favorite: FavoriteMealDto) => void;
  onDelete: (favorite: FavoriteMealDto) => void;
}

export function FavoritesList({ favorites, hasSearchQuery, onSelect, onEdit, onDelete }: FavoritesListProps) {
  if (favorites.length === 0) {
    return <FavoritesEmptyState hasSearchQuery={hasSearchQuery} />;
  }

  return (
    <div className="grid gap-3">
      {favorites.map((favorite) => (
        <FavoriteCard key={favorite.id} favorite={favorite} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
