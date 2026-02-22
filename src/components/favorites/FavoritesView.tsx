import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CreateMealCommand,
  FavoriteMealDto,
  FavoritesModalState,
  SortOption,
  UpdateFavoriteCommand,
} from "@/types";
import { DeleteFavoriteAlert } from "./DeleteFavoriteAlert";
import { EditFavoriteDialog } from "./EditFavoriteDialog";
import { FavoritesList } from "./FavoritesList";
import { FavoritesToolbar } from "./FavoritesToolbar";
import { LogFavoriteDialog } from "./LogFavoriteDialog";

interface FavoritesViewProps {
  user?: {
    id: string;
    email: string;
  } | null;
}

export function FavoritesView({ user }: FavoritesViewProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [favorites, setFavorites] = useState<FavoriteMealDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [modalState, setModalState] = useState<FavoritesModalState>({
    type: null,
    selectedId: null,
  });

  const selectedFavorite = useMemo(
    () => favorites.find((favorite) => favorite.id === modalState.selectedId) ?? null,
    [favorites, modalState.selectedId]
  );

  const closeModal = useCallback(() => {
    setModalState({ type: null, selectedId: null });
  }, []);

  const parseApiError = useCallback(async (response: Response, fallback: string): Promise<string> => {
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      return payload.error || payload.message || fallback;
    } catch {
      return fallback;
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const normalizedSearchQuery = debouncedSearchQuery.trim();
      if (normalizedSearchQuery.length >= 3) {
        params.set("search", normalizedSearchQuery);
      }
      params.set("sort", sortBy);

      const response = await fetch(`/api/favorites?${params.toString()}`);
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Nie udało się pobrać ulubionych."));
      }

      const data = (await response.json()) as FavoriteMealDto[];
      setFavorites(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Nie udało się pobrać ulubionych.");
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, parseApiError, sortBy]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  const handleSelectFavorite = (favorite: FavoriteMealDto) => {
    setModalState({ type: "log", selectedId: favorite.id });
  };

  const handleEditFavorite = (favorite: FavoriteMealDto) => {
    setModalState({ type: "edit", selectedId: favorite.id });
  };

  const handleDeleteFavorite = (favorite: FavoriteMealDto) => {
    setModalState({ type: "delete", selectedId: favorite.id });
  };

  const handleRetry = () => {
    void fetchFavorites();
  };

  const handleLogFavorite = async (command: CreateMealCommand) => {
    const response = await fetch("/api/meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response, "Nie udało się dodać posiłku do dziennika."));
    }

    toast.success("Posiłek dodany do dziennika.");
  };

  const handleUpdateFavorite = async (command: UpdateFavoriteCommand) => {
    if (!selectedFavorite) {
      return;
    }

    const response = await fetch(`/api/favorites/${selectedFavorite.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response, "Nie udało się zaktualizować szablonu."));
    }

    const updatedFavorite = (await response.json()) as FavoriteMealDto;
    setFavorites((current) =>
      current.map((favorite) => (favorite.id === updatedFavorite.id ? updatedFavorite : favorite))
    );
    toast.success("Szablon został zaktualizowany.");
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFavorite) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/favorites/${selectedFavorite.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response, "Nie udało się usunąć szablonu."));
      }

      setFavorites((current) => current.filter((favorite) => favorite.id !== selectedFavorite.id));
      toast.success("Szablon usunięty z ulubionych.");
      closeModal();
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Nie udało się usunąć szablonu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogSubmit = async (command: CreateMealCommand) => {
    try {
      await handleLogFavorite(command);
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Nie udało się dodać posiłku.");
      throw submitError;
    }
  };

  const handleEditSubmit = async (command: UpdateFavoriteCommand) => {
    try {
      await handleUpdateFavorite(command);
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Nie udało się zapisać zmian.");
      throw submitError;
    }
  };

  const isInitialLoading = isLoading && favorites.length === 0;

  return (
    <PageLayout currentPath="/favorites" showAddMealButton={false} user={user}>
      <div className="container mx-auto max-w-5xl space-y-6 px-4 py-6 md:py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold md:text-3xl">Ulubione</h1>
          <p className="text-muted-foreground text-sm">
            Zapisane szablony posiłków do szybkiego dodawania do dziennika.
          </p>
        </header>

        <FavoritesToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {isLoading && favorites.length > 0 && (
          <p className="text-muted-foreground text-xs" aria-live="polite">
            Odświeżanie listy...
          </p>
        )}

        {error && favorites.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <h2 className="text-lg font-semibold">Błąd wczytywania ulubionych</h2>
            <p className="text-muted-foreground mt-2 text-sm">{error}</p>
            <Button type="button" onClick={handleRetry} className="mt-4">
              Spróbuj ponownie
            </Button>
          </div>
        ) : isInitialLoading ? (
          <div className="grid gap-3" aria-label="Ładowanie listy ulubionych">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ) : (
          <FavoritesList
            favorites={favorites}
            hasSearchQuery={debouncedSearchQuery.trim().length >= 3}
            onSelect={handleSelectFavorite}
            onEdit={handleEditFavorite}
            onDelete={handleDeleteFavorite}
          />
        )}
      </div>

      <LogFavoriteDialog
        isOpen={modalState.type === "log"}
        favorite={selectedFavorite}
        onClose={closeModal}
        onSubmit={handleLogSubmit}
      />

      <EditFavoriteDialog
        isOpen={modalState.type === "edit"}
        favorite={selectedFavorite}
        onClose={closeModal}
        onSubmit={handleEditSubmit}
      />

      <DeleteFavoriteAlert
        isOpen={modalState.type === "delete"}
        favorite={selectedFavorite}
        isDeleting={isDeleting}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  );
}
