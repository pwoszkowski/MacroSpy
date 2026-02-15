import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { composerMealSchema, type ComposerMealValues } from "./schemas";

type ManualEntryData = ComposerMealValues;

interface ManualEntryFormProps {
  onSubmit: (data: ManualEntryData) => void;
  isSubmitting: boolean;
}

/**
 * Formularz do ręcznego wprowadzania nazwy posiłku i makroskładników.
 * Pomija analizę AI.
 */
export function ManualEntryForm({ onSubmit, isSubmitting }: ManualEntryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ManualEntryData>({
    resolver: zodResolver(composerMealSchema),
    defaultValues: {
      name: "",
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
    },
    mode: "onChange",
  });

  const handleFormSubmit = (data: ManualEntryData) => {
    onSubmit(data);
  };

  const canSubmit = isValid && !isSubmitting;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Nazwa posiłku */}
      <div className="space-y-2">
        <Label htmlFor="manual-name">Nazwa posiłku</Label>
        <Input
          id="manual-name"
          type="text"
          {...register("name")}
          disabled={isSubmitting}
          placeholder="np. Jajecznica z warzywami"
          required
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {/* Makroskładniki - siatka */}
      <div className="grid grid-cols-2 gap-3">
        {/* Kalorie */}
        <div className="space-y-2">
          <Label htmlFor="manual-calories">
            Kalorie <span className="text-xs text-muted-foreground">(kcal)</span>
          </Label>
          <Input
            id="manual-calories"
            type="number"
            step="1"
            min="0"
            {...register("calories")}
            disabled={isSubmitting}
            placeholder="0"
          />
          {errors.calories && <p className="text-sm text-destructive">{errors.calories.message}</p>}
        </div>

        {/* Białko */}
        <div className="space-y-2">
          <Label htmlFor="manual-protein">
            Białko <span className="text-xs text-muted-foreground">(g)</span>
          </Label>
          <Input
            id="manual-protein"
            type="number"
            step="0.1"
            min="0"
            {...register("protein")}
            disabled={isSubmitting}
            placeholder="0"
          />
          {errors.protein && <p className="text-sm text-destructive">{errors.protein.message}</p>}
        </div>

        {/* Tłuszcze */}
        <div className="space-y-2">
          <Label htmlFor="manual-fat">
            Tłuszcze <span className="text-xs text-muted-foreground">(g)</span>
          </Label>
          <Input
            id="manual-fat"
            type="number"
            step="0.1"
            min="0"
            {...register("fat")}
            disabled={isSubmitting}
            placeholder="0"
          />
          {errors.fat && <p className="text-sm text-destructive">{errors.fat.message}</p>}
        </div>

        {/* Węglowodany */}
        <div className="space-y-2">
          <Label htmlFor="manual-carbs">
            Węglowodany <span className="text-xs text-muted-foreground">(g)</span>
          </Label>
          <Input
            id="manual-carbs"
            type="number"
            step="0.1"
            min="0"
            {...register("carbs")}
            disabled={isSubmitting}
            placeholder="0"
          />
          {errors.carbs && <p className="text-sm text-destructive">{errors.carbs.message}</p>}
        </div>

        {/* Błonnik */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="manual-fiber">
            Błonnik <span className="text-xs text-muted-foreground">(g)</span>
          </Label>
          <Input
            id="manual-fiber"
            type="number"
            step="0.1"
            min="0"
            {...register("fiber")}
            disabled={isSubmitting}
            placeholder="0"
          />
          {errors.fiber && <p className="text-sm text-destructive">{errors.fiber.message}</p>}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Wprowadź wartości odżywcze na podstawie etykiety produktu lub własnej wiedzy
      </p>

      {/* Przycisk Submit */}
      <Button onClick={handleSubmit(handleFormSubmit)} disabled={!canSubmit} className="w-full" size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Zapisuję...
          </>
        ) : (
          "Przejdź do podsumowania"
        )}
      </Button>
    </div>
  );
}
