import { useEffect } from "react";
import { format } from "date-fns";
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
import type { FavoriteMealDto, CreateMealCommand } from "@/types";
import { logFavoriteFormSchema, type LogFavoriteFormValues } from "./schemas";
import { useNetworkStatus } from "@/components/hooks/useNetworkStatus";
import { toast } from "sonner";

interface LogFavoriteDialogProps {
  isOpen: boolean;
  favorite: FavoriteMealDto | null;
  onClose: () => void;
  onSubmit: (command: CreateMealCommand) => Promise<void>;
}

export function LogFavoriteDialog({ isOpen, favorite, onClose, onSubmit }: LogFavoriteDialogProps) {
  const { isOnline } = useNetworkStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogFavoriteFormValues>({
    resolver: zodResolver(logFavoriteFormSchema),
    defaultValues: {
      name: "",
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      consumed_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
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
      consumed_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
  }, [favorite, isOpen, reset]);

  const handleFormSubmit = async (data: LogFavoriteFormValues) => {
    if (!isOnline) {
      toast.error("Połącz się z internetem, aby zapisać dane.");
      return;
    }

    await onSubmit({
      name: data.name,
      calories: data.calories,
      protein: data.protein,
      fat: data.fat,
      carbs: data.carbs,
      fiber: data.fiber,
      consumed_at: new Date(data.consumed_at).toISOString(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dodaj do dziennika</DialogTitle>
          <DialogDescription>Możesz zmienić dane wpisu przed zapisaniem do historii.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="log-name">Nazwa posiłku *</Label>
            <Input id="log-name" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="log-consumed-at">Data i godzina *</Label>
            <Input
              id="log-consumed-at"
              type="datetime-local"
              {...register("consumed_at")}
              aria-invalid={!!errors.consumed_at}
            />
            {errors.consumed_at && <p className="text-destructive text-sm">{errors.consumed_at.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="log-calories">Kalorie (kcal) *</Label>
              <Input id="log-calories" type="number" step="0.1" {...register("calories")} aria-invalid={!!errors.calories} />
              {errors.calories && <p className="text-destructive text-sm">{errors.calories.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-protein">Białko (g) *</Label>
              <Input id="log-protein" type="number" step="0.1" {...register("protein")} aria-invalid={!!errors.protein} />
              {errors.protein && <p className="text-destructive text-sm">{errors.protein.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-fat">Tłuszcz (g) *</Label>
              <Input id="log-fat" type="number" step="0.1" {...register("fat")} aria-invalid={!!errors.fat} />
              {errors.fat && <p className="text-destructive text-sm">{errors.fat.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-carbs">Węglowodany (g) *</Label>
              <Input id="log-carbs" type="number" step="0.1" {...register("carbs")} aria-invalid={!!errors.carbs} />
              {errors.carbs && <p className="text-destructive text-sm">{errors.carbs.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-fiber">Błonnik (g) *</Label>
              <Input id="log-fiber" type="number" step="0.1" {...register("fiber")} aria-invalid={!!errors.fiber} />
              {errors.fiber && <p className="text-destructive text-sm">{errors.fiber.message}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting || !isOnline}>
              {isSubmitting ? "Dodawanie..." : "Dodaj"}
            </Button>
          </DialogFooter>
          {!isOnline && <p className="text-sm text-destructive">Połącz się z internetem, aby zapisać dane.</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
