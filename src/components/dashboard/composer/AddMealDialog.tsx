import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MealInputView } from "./MealInputView";
import { AnalysisLoadingView } from "./AnalysisLoadingView";
import { MealReviewView } from "./MealReviewView";
import { useMealComposer, type SaveMealResult } from "./useMealComposer";
import { toast } from "sonner";

interface AddMealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultConsumedAt?: string;
  showConsumedAtInput?: boolean;
}

// Hook do wykrywania urządzeń mobilnych
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // W środowisku SSR pomijamy
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

/**
 * Główny kontener modala dodawania posiłku.
 * Zarządza przełączaniem między widokami i obsługuje logikę biznesową.
 * Na desktop używa Dialog, na mobile Drawer.
 */
export function AddMealDialog({
  isOpen,
  onClose,
  onSuccess,
  defaultConsumedAt,
  showConsumedAtInput = false,
}: AddMealDialogProps) {
  const isMobile = useIsMobile();

  const handleSuccess = ({ savedToFavorites, favoriteError }: SaveMealResult) => {
    if (savedToFavorites) {
      toast.success("Posiłek zapisany i dodany do ulubionych");
    } else if (favoriteError) {
      toast.warning(`Posiłek zapisany, ale nie udało się dodać do ulubionych: ${favoriteError}`);
    } else {
      toast.success("Posiłek został zapisany");
    }

    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const {
    status,
    inputText,
    selectedImages,
    candidate,
    interactions,
    isFavorite,
    error,
    setInputText,
    setSelectedImages,
    analyze,
    createManualEntry,
    refine,
    updateCandidate,
    setFavorite,
    save,
    reset,
  } = useMealComposer(handleSuccess, { defaultConsumedAt });

  // Wyświetl toast z błędem
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Reset po zamknięciu
  const handleClose = () => {
    // Jeśli są niezapisane dane, poproś o potwierdzenie
    if (status === "review" && candidate) {
      const confirmed = window.confirm("Masz niezapisane zmiany. Czy na pewno chcesz zamknąć?");
      if (!confirmed) return;
    }

    reset();
    onClose();
  };

  // Renderuj odpowiedni widok na podstawie stanu
  const renderContent = () => {
    switch (status) {
      case "idle":
        return (
          <MealInputView
            initialText={inputText}
            initialImages={selectedImages}
            onSubmit={(text, images) => {
              setInputText(text);
              setSelectedImages(images);
              analyze(text, images);
            }}
            onManualSubmit={(data) => {
              createManualEntry(data);
            }}
            isSubmitting={false}
          />
        );

      case "analyzing":
        return <AnalysisLoadingView />;

      case "refining":
        return candidate ? (
          <MealReviewView
            candidate={candidate}
            interactions={interactions}
            onRefine={refine}
            onSave={save}
            onCancel={handleClose}
            onManualChange={updateCandidate}
            onFavoriteChange={setFavorite}
            isFavorite={isFavorite}
            isRefining={true}
            isSaving={false}
            showConsumedAtInput={showConsumedAtInput}
          />
        ) : null;

      case "review":
        return candidate ? (
          <MealReviewView
            candidate={candidate}
            interactions={interactions}
            onRefine={refine}
            onSave={save}
            onCancel={handleClose}
            onManualChange={updateCandidate}
            onFavoriteChange={setFavorite}
            isFavorite={isFavorite}
            isRefining={false}
            isSaving={false}
            showConsumedAtInput={showConsumedAtInput}
          />
        ) : null;

      case "saving":
        return candidate ? (
          <MealReviewView
            candidate={candidate}
            interactions={interactions}
            onRefine={refine}
            onSave={save}
            onCancel={handleClose}
            onManualChange={updateCandidate}
            onFavoriteChange={setFavorite}
            isFavorite={isFavorite}
            isRefining={false}
            isSaving={true}
            showConsumedAtInput={showConsumedAtInput}
          />
        ) : null;

      default:
        return null;
    }
  };

  const title = status === "idle" ? "Dodaj posiłek" : status === "analyzing" ? "Analiza..." : "Sprawdź wyniki";

  const description =
    status === "idle"
      ? "Opisz swój posiłek słowami lub dodaj zdjęcie"
      : status === "analyzing"
        ? "AI analizuje Twój posiłek i oblicza makroskładniki"
        : "Zweryfikuj dane i wprowadź ewentualne poprawki";

  // Mobile: użyj Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent
          className="data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:h-[100dvh] data-[vaul-drawer-direction=bottom]:max-h-[100dvh] data-[vaul-drawer-direction=bottom]:rounded-none"
          data-test-id="add-meal-dialog"
        >
          <DrawerHeader className="relative pr-14">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              onClick={handleClose}
              aria-label="Zamknij okno dodawania posiłku"
            >
              <X className="h-5 w-5" />
            </Button>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 min-h-0 overflow-y-auto pb-4">{renderContent()}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: użyj Dialog
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-test-id="add-meal-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
