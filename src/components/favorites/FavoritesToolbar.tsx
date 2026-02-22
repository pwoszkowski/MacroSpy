import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SortOption } from "@/types";

interface FavoritesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

export function FavoritesToolbar({ searchQuery, onSearchChange, sortBy, onSortChange }: FavoritesToolbarProps) {
  return (
    <section className="rounded-lg border bg-card p-3 sm:p-4" aria-label="Filtry listy ulubionych">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Szukaj po nazwie posiłku..."
            className="pl-9"
            aria-label="Szukaj ulubionego posiłku"
          />
        </div>

        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[220px]" aria-label="Sortowanie ulubionych">
            <SelectValue placeholder="Wybierz sortowanie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Najnowsze</SelectItem>
            <SelectItem value="name_asc">Alfabetycznie</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
