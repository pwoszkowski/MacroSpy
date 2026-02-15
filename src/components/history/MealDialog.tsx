import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { mealFormSchema, type MealFormValues } from "./schemas";
import type { MealDto } from "@/types";
import { format } from "date-fns";

interface MealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MealFormValues) => Promise<void>;
  initialData?: MealDto;
  defaultDate: Date;
  mode?: "create" | "edit" | "duplicate";
}

/**
 * Universal dialog for creating and editing meals.
 * Uses react-hook-form with zod validation.
 */
export function MealDialog({ isOpen, onClose, onSubmit, initialData, defaultDate, mode = "create" }: MealDialogProps) {
  const isEditMode = mode === "edit";
  const isDuplicateMode = mode === "duplicate";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues:
      (isEditMode || isDuplicateMode) && initialData
        ? {
            name: initialData.name,
            calories: initialData.calories,
            protein: initialData.protein,
            fat: initialData.fat,
            carbs: initialData.carbs,
            fiber: initialData.fiber ?? 0,
            consumed_at: isDuplicateMode
              ? format(new Date(), "yyyy-MM-dd'T'HH:mm")
              : format(new Date(initialData.consumed_at), "yyyy-MM-dd'T'HH:mm"),
          }
        : {
            name: "",
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            fiber: 0,
            consumed_at: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
          },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      reset(
        (isEditMode || isDuplicateMode) && initialData
          ? {
              name: initialData.name,
              calories: initialData.calories,
              protein: initialData.protein,
              fat: initialData.fat,
              carbs: initialData.carbs,
              fiber: initialData.fiber ?? 0,
              consumed_at: isDuplicateMode
                ? format(new Date(), "yyyy-MM-dd'T'HH:mm")
                : format(new Date(initialData.consumed_at), "yyyy-MM-dd'T'HH:mm"),
            }
          : {
              name: "",
              calories: 0,
              protein: 0,
              fat: 0,
              carbs: 0,
              fiber: 0,
              consumed_at: format(defaultDate, "yyyy-MM-dd'T'HH:mm"),
            }
      );
    }
  }, [isOpen, initialData, defaultDate, isEditMode, isDuplicateMode, reset]);

  const title = isEditMode ? "Edytuj posiłek" : isDuplicateMode ? "Powiel posiłek" : "Dodaj posiłek";
  const description = isEditMode
    ? "Wprowadź zmiany w danych posiłku"
    : isDuplicateMode
      ? "Możesz zmodyfikować dane przed zapisem"
      : "Wprowadź dane posiłku ręcznie";
  const submitLabel = isEditMode ? "Zapisz zmiany" : "Dodaj posiłek";

  const handleFormSubmit = async (data: MealFormValues) => {
    try {
      // Convert to ISO string for API
      const formattedData = {
        ...data,
        consumed_at: new Date(data.consumed_at).toISOString(),
      };
      await onSubmit(formattedData);
      onClose();
    } catch (error) {
      // Error is handled by parent component
      console.error("Error submitting meal:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Meal Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa posiłku *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="np. Kurczak z ryżem"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Consumed At */}
          <div className="space-y-2">
            <Label htmlFor="consumed_at">Data i godzina *</Label>
            <Input
              id="consumed_at"
              type="datetime-local"
              {...register("consumed_at")}
              aria-invalid={!!errors.consumed_at}
              aria-describedby={errors.consumed_at ? "consumed-at-error" : undefined}
            />
            {errors.consumed_at && (
              <p id="consumed-at-error" className="text-sm text-destructive">
                {errors.consumed_at.message}
              </p>
            )}
          </div>

          {/* Macronutrients Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Calories */}
            <div className="space-y-2">
              <Label htmlFor="calories">Kalorie (kcal) *</Label>
              <Input
                id="calories"
                type="number"
                step="0.1"
                {...register("calories")}
                aria-invalid={!!errors.calories}
                aria-describedby={errors.calories ? "calories-error" : undefined}
              />
              {errors.calories && (
                <p id="calories-error" className="text-sm text-destructive">
                  {errors.calories.message}
                </p>
              )}
            </div>

            {/* Protein */}
            <div className="space-y-2">
              <Label htmlFor="protein">Białko (g) *</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                {...register("protein")}
                aria-invalid={!!errors.protein}
                aria-describedby={errors.protein ? "protein-error" : undefined}
              />
              {errors.protein && (
                <p id="protein-error" className="text-sm text-destructive">
                  {errors.protein.message}
                </p>
              )}
            </div>

            {/* Fat */}
            <div className="space-y-2">
              <Label htmlFor="fat">Tłuszcze (g) *</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                {...register("fat")}
                aria-invalid={!!errors.fat}
                aria-describedby={errors.fat ? "fat-error" : undefined}
              />
              {errors.fat && (
                <p id="fat-error" className="text-sm text-destructive">
                  {errors.fat.message}
                </p>
              )}
            </div>

            {/* Carbs */}
            <div className="space-y-2">
              <Label htmlFor="carbs">Węglowodany (g) *</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                {...register("carbs")}
                aria-invalid={!!errors.carbs}
                aria-describedby={errors.carbs ? "carbs-error" : undefined}
              />
              {errors.carbs && (
                <p id="carbs-error" className="text-sm text-destructive">
                  {errors.carbs.message}
                </p>
              )}
            </div>

            {/* Fiber */}
            <div className="space-y-2">
              <Label htmlFor="fiber">Błonnik (g)</Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                {...register("fiber")}
                aria-invalid={!!errors.fiber}
                aria-describedby={errors.fiber ? "fiber-error" : undefined}
              />
              {errors.fiber && (
                <p id="fiber-error" className="text-sm text-destructive">
                  {errors.fiber.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
