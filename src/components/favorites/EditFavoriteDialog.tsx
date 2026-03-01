import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FavoriteMealDto, UpdateFavoriteCommand } from "@/types";
import { editFavoriteFormSchema, type EditFavoriteFormValues } from "./schemas";
import { useNetworkStatus } from "@/components/hooks/useNetworkStatus";
import { toast } from "sonner";

interface EditFavoriteDialogProps {
  isOpen: boolean;
  favorite: FavoriteMealDto | null;
  onClose: () => void;
  onSubmit: (command: UpdateFavoriteCommand) => Promise<void>;
}

export function EditFavoriteDialog({ isOpen, favorite, onClose, onSubmit }: EditFavoriteDialogProps) {
  const { isOnline } = useNetworkStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFavoriteFormValues>({
    resolver: zodResolver(editFavoriteFormSchema),
    defaultValues: {
      name: "",
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
    },
  });

  useEffect(() => {
    if (!isOpen || !favorite) {
      return;
    }

    reset({
      name: favorite.name,
      calories: favorite.calories,
      protein: favorite.protein,
      fat: favorite.fat,
      carbs: favorite.carbs,
      fiber: favorite.fiber ?? 0,
    });
  }, [favorite, isOpen, reset]);

  const handleFormSubmit = async (data: EditFavoriteFormValues) => {
    if (!isOnline) {
      toast.error("Połącz się z internetem, aby zapisać dane.");
      return;
    }

    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edytuj szablon</DialogTitle>
          <DialogDescription>Zmiany zostaną zapisane w ulubionych i będą widoczne przy kolejnych użyciach.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nazwa posiłku *</Label>
            <Input id="edit-name" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-calories">Kalorie (kcal) *</Label>
              <Input
                id="edit-calories"
                type="number"
                step="0.1"
                {...register("calories")}
                aria-invalid={!!errors.calories}
              />
              {errors.calories && <p className="text-destructive text-sm">{errors.calories.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-protein">Białko (g) *</Label>
              <Input id="edit-protein" type="number" step="0.1" {...register("protein")} aria-invalid={!!errors.protein} />
              {errors.protein && <p className="text-destructive text-sm">{errors.protein.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fat">Tłuszcz (g) *</Label>
              <Input id="edit-fat" type="number" step="0.1" {...register("fat")} aria-invalid={!!errors.fat} />
              {errors.fat && <p className="text-destructive text-sm">{errors.fat.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-carbs">Węglowodany (g) *</Label>
              <Input id="edit-carbs" type="number" step="0.1" {...register("carbs")} aria-invalid={!!errors.carbs} />
              {errors.carbs && <p className="text-destructive text-sm">{errors.carbs.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fiber">Błonnik (g) *</Label>
              <Input id="edit-fiber" type="number" step="0.1" {...register("fiber")} aria-invalid={!!errors.fiber} />
              {errors.fiber && <p className="text-destructive text-sm">{errors.fiber.message}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting || !isOnline}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
          {!isOnline && <p className="text-sm text-destructive">Połącz się z internetem, aby zapisać dane.</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
