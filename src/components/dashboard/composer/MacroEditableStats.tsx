import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MealCandidateViewModel } from "./types";
import { composerMealSchema, type ComposerMealValues } from "./schemas";

interface MacroEditableStatsProps {
  candidate: MealCandidateViewModel;
  onChange: (field: keyof MealCandidateViewModel, value: number | string) => void;
  disabled?: boolean;
}

type MacroField = "calories" | "protein" | "fat" | "carbs" | "fiber";

/**
 * Edytowalne pola makroskładników w widoku Review.
 * Pozwala na ręczną korektę wartości po analizie AI.
 */
export function MacroEditableStats({ candidate, onChange, disabled = false }: MacroEditableStatsProps) {
  const { register, reset, setValue } = useForm<ComposerMealValues>({
    resolver: zodResolver(composerMealSchema),
    defaultValues: {
      name: candidate.name,
      calories: candidate.calories,
      protein: candidate.protein,
      fat: candidate.fat,
      carbs: candidate.carbs,
      fiber: candidate.fiber,
    },
  });

  useEffect(() => {
    reset({
      name: candidate.name,
      calories: candidate.calories,
      protein: candidate.protein,
      fat: candidate.fat,
      carbs: candidate.carbs,
      fiber: candidate.fiber,
    });
  }, [candidate, reset]);

  const handleNumberBlur = (field: MacroField, value: string) => {
    if (value.trim() === "") {
      setValue(field, 0, { shouldDirty: true });
      onChange(field, 0);
      return;
    }

    const numValue = parseFloat(value);
    if (Number.isNaN(numValue) || numValue < 0) {
      setValue(field, 0, { shouldDirty: true });
      onChange(field, 0);
      return;
    }

    setValue(field, numValue, { shouldDirty: true });
    onChange(field, numValue);
  };

  return (
    <div className="space-y-4">
      {/* Nazwa posiłku */}
      <div className="space-y-2">
        <Label htmlFor="meal-name">Nazwa posiłku</Label>
        <Input
          id="meal-name"
          type="text"
          {...register("name", {
            onChange: (e) => onChange("name", e.target.value as string),
          })}
          disabled={disabled}
          placeholder="np. Jajecznica z warzywami"
          required
        />
      </div>

      {/* Makroskładniki - siatka */}
      <div className="grid grid-cols-2 gap-3">
        {/* Kalorie */}
        <div className="space-y-2">
          <Label htmlFor="calories">
            Kalorie <span className="text-xs text-muted-foreground">(kcal)</span>
          </Label>
          <Input
            id="calories"
            type="number"
            step="0.1"
            min="0"
            {...register("calories", {
              onBlur: (e) => handleNumberBlur("calories", e.target.value as string),
            })}
            disabled={disabled}
          />
        </div>

        {/* Białko */}
        <div className="space-y-2">
          <Label htmlFor="protein">
            Białko <span className="text-xs text-muted-foreground">(g)</span>
          </Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            min="0"
            {...register("protein", {
              onBlur: (e) => handleNumberBlur("protein", e.target.value as string),
            })}
            disabled={disabled}
          />
        </div>

        {/* Tłuszcze */}
        <div className="space-y-2">
          <Label htmlFor="fat">
            Tłuszcze <span className="text-xs text-muted-foreground">(g)</span>
          </Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            min="0"
            {...register("fat", {
              onBlur: (e) => handleNumberBlur("fat", e.target.value as string),
            })}
            disabled={disabled}
          />
        </div>

        {/* Węglowodany */}
        <div className="space-y-2">
          <Label htmlFor="carbs">
            Węglowodany <span className="text-xs text-muted-foreground">(g)</span>
          </Label>
          <Input
            id="carbs"
            type="number"
            step="0.1"
            min="0"
            {...register("carbs", {
              onBlur: (e) => handleNumberBlur("carbs", e.target.value as string),
            })}
            disabled={disabled}
          />
        </div>

        {/* Błonnik */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="fiber">
            Błonnik <span className="text-xs text-muted-foreground">(g)</span>
          </Label>
          <Input
            id="fiber"
            type="number"
            step="0.1"
            min="0"
            {...register("fiber", {
              onBlur: (e) => handleNumberBlur("fiber", e.target.value as string),
            })}
            disabled={disabled}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Możesz ręcznie edytować wartości lub poprosić AI o korektę poniżej
      </p>
    </div>
  );
}
