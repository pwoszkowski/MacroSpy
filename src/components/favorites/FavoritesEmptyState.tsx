interface FavoritesEmptyStateProps {
  hasSearchQuery: boolean;
}

export function FavoritesEmptyState({ hasSearchQuery }: FavoritesEmptyStateProps) {
  if (hasSearchQuery) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h2 className="text-lg font-semibold">Brak wyników</h2>
        <p className="text-muted-foreground mt-2 text-sm">Spróbuj zmienić frazę wyszukiwania lub sortowanie.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <h2 className="text-lg font-semibold">Brak ulubionych posiłków</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Zapisz pierwszy posiłek jako ulubiony z poziomu historii lub dashboardu.
      </p>
    </div>
  );
}
