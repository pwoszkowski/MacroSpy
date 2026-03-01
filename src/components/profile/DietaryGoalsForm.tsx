import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dietaryGoalsSchema, type DietaryGoalsFormValues } from "./schemas";
import type { DietaryGoalDto, ProfileDto, SetDietaryGoalCommand, GoalTargets } from "@/types";
import { TdeeCalculatorDialog } from "./TdeeCalculatorDialog";
import { useNetworkStatus } from "@/components/hooks/useNetworkStatus";
import { toast } from "sonner";

interface DietaryGoalsFormProps {
  initialGoal: DietaryGoalDto | null;
  userProfile: ProfileDto;
  onSave: (data: SetDietaryGoalCommand) => Promise<void>;
}

export function DietaryGoalsForm({ initialGoal, userProfile, onSave }: DietaryGoalsFormProps) {
  const { isOnline } = useNetworkStatus();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DietaryGoalsFormValues>({
    resolver: zodResolver(dietaryGoalsSchema),
    defaultValues: {
      calories_target: initialGoal?.calories_target || undefined,
      protein_target: initialGoal?.protein_target || undefined,
      fat_target: initialGoal?.fat_target || undefined,
      carbs_target: initialGoal?.carbs_target || undefined,
      fiber_target: initialGoal?.fiber_target || undefined,
    },
  });

  const onSubmitHandler = async (data: DietaryGoalsFormValues) => {
    if (!isOnline) {
      toast.error("Połącz się z internetem, aby zapisać dane.");
      return;
    }

    try {
      // Dodaj datę rozpoczęcia (dzisiaj)
      const today = new Date().toISOString().split("T")[0];
      const command: SetDietaryGoalCommand = {
        ...data,
        start_date: today,
      };
      await onSave(command);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleApplyCalculatorResults = (targets: GoalTargets) => {
    setValue("calories_target", targets.calories, { shouldValidate: true });
    setValue("protein_target", targets.protein, { shouldValidate: true });
    setValue("fat_target", targets.fat, { shouldValidate: true });
    setValue("carbs_target", targets.carbs, { shouldValidate: true });
    setValue("fiber_target", targets.fiber, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Cele makroskładnikowe</h3>
        <p className="text-sm text-muted-foreground mb-3">Ustaw dzienne cele lub skorzystaj z kalkulatora</p>
        <TdeeCalculatorDialog profile={userProfile} onApply={handleApplyCalculatorResults} />
      </div>

      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="calories_target">Kalorie (kcal) *</Label>
          <Input
            id="calories_target"
            type="number"
            placeholder="np. 2000"
            {...register("calories_target", { valueAsNumber: true })}
            aria-invalid={!!errors.calories_target}
          />
          {errors.calories_target && <p className="text-sm text-red-500">{errors.calories_target.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="protein_target">Białko (g) *</Label>
            <Input
              id="protein_target"
              type="number"
              placeholder="np. 150"
              {...register("protein_target", { valueAsNumber: true })}
              aria-invalid={!!errors.protein_target}
            />
            {errors.protein_target && <p className="text-sm text-red-500">{errors.protein_target.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fat_target">Tłuszcz (g) *</Label>
            <Input
              id="fat_target"
              type="number"
              placeholder="np. 65"
              {...register("fat_target", { valueAsNumber: true })}
              aria-invalid={!!errors.fat_target}
            />
            {errors.fat_target && <p className="text-sm text-red-500">{errors.fat_target.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="carbs_target">Węglowodany (g) *</Label>
            <Input
              id="carbs_target"
              type="number"
              placeholder="np. 200"
              {...register("carbs_target", { valueAsNumber: true })}
              aria-invalid={!!errors.carbs_target}
            />
            {errors.carbs_target && <p className="text-sm text-red-500">{errors.carbs_target.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiber_target">Błonnik (g)</Label>
            <Input
              id="fiber_target"
              type="number"
              placeholder="np. 30"
              {...register("fiber_target", { valueAsNumber: true })}
              aria-invalid={!!errors.fiber_target}
            />
            {errors.fiber_target && <p className="text-sm text-red-500">{errors.fiber_target.message}</p>}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting || !isOnline}>
            {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </div>
        {!isOnline && <p className="text-sm text-destructive">Połącz się z internetem, aby zapisać dane.</p>}
      </form>
    </div>
  );
}
