import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { FavoriteMealDto } from "@/types";

interface DeleteFavoriteAlertProps {
  isOpen: boolean;
  favorite: FavoriteMealDto | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteFavoriteAlert({ isOpen, favorite, isDeleting, onClose, onConfirm }: DeleteFavoriteAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Usunąć z ulubionych?</AlertDialogTitle>
          <AlertDialogDescription>
            {favorite ? (
              <>
                Szablon <strong>{favorite.name}</strong> zostanie trwale usunięty z listy ulubionych.
              </>
            ) : (
              "Ten szablon zostanie trwale usunięty z listy ulubionych."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Usuwanie..." : "Usuń"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
