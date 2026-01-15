import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculatorInputsSchema, type CalculatorInputs } from "./schemas";
import type { ProfileDto, GoalTargets } from "@/types";
import { toast } from "sonner";

interface TdeeCalculatorDialogProps {
  profile: ProfileDto;
  onApply: (targets: GoalTargets) => void;
  trigger?: React.ReactNode;
}

export function TdeeCalculatorDialog({ profile, onApply, trigger }: TdeeCalculatorDialogProps) {
  const [open, setOpen] = useState(false);
  const [calculationResult, setCalculationResult] = useState<{
    bmr: number;
    tdee: number;
    suggested_targets: GoalTargets;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CalculatorInputs>({
    resolver: zodResolver(calculatorInputsSchema),
    defaultValues: {
      weight: undefined,
      activity_level: "moderately_active",
    },
  });

  const activity_level = watch("activity_level");

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const onSubmitHandler = async (data: CalculatorInputs) => {
    if (!profile.birth_date || !profile.height || !profile.gender) {
      toast.error("Brak wymaganych danych profilowych", {
        description: "Najpierw uzupełnij wzrost, płeć i datę urodzenia w zakładce Dane profilowe.",
      });
      return;
    }

    try {
      const age = calculateAge(profile.birth_date);

      const response = await fetch("/api/ai/calculate-tdee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gender: profile.gender,
          weight_kg: data.weight,
          height_cm: profile.height,
          age,
          activity_level: data.activity_level,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Błąd podczas obliczania TDEE");
      }

      const result = await response.json();
      setCalculationResult(result);
      toast.success("Obliczono zapotrzebowanie kaloryczne");
    } catch (error) {
      console.error("TDEE calculation error:", error);
      toast.error("Nie udało się obliczyć zapotrzebowania", {
        description: error instanceof Error ? error.message : "Spróbuj ponownie później",
      });
    }
  };

  const handleApply = () => {
    if (calculationResult) {
      onApply(calculationResult.suggested_targets);
      setOpen(false);
      setCalculationResult(null);
      toast.success("Zastosowano sugerowane cele");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setCalculationResult(null);
  };

  const activityLevels = [
    { value: "sedentary", label: "Siedzący (brak lub mała aktywność)" },
    { value: "lightly_active", label: "Lekko aktywny (lekkie ćwiczenia 1-3 dni/tydz.)" },
    { value: "moderately_active", label: "Umiarkowanie aktywny (ćwiczenia 3-5 dni/tydz.)" },
    { value: "very_active", label: "Bardzo aktywny (intensywne ćwiczenia 6-7 dni/tydz.)" },
    { value: "extremely_active", label: "Ekstremalnie aktywny (ciężka praca fizyczna + trening)" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full sm:w-auto">
            <span className="sm:hidden">Kalkulator TDEE</span>
            <span className="hidden sm:inline">Kalkulator zapotrzebowania</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kalkulator zapotrzebowania kalorycznego (TDEE)</DialogTitle>
          <DialogDescription>
            Oblicz swoje dzienne zapotrzebowanie kaloryczne na podstawie danych biometrycznych i poziomu
            aktywności.
          </DialogDescription>
        </DialogHeader>

        {!calculationResult ? (
          <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Aktualna waga (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="np. 75.5"
                {...register("weight", { valueAsNumber: true })}
                aria-invalid={!!errors.weight}
              />
              {errors.weight && <p className="text-sm text-red-500">{errors.weight.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_level">Poziom aktywności *</Label>
              <Select
                value={activity_level}
                onValueChange={(value) =>
                  setValue("activity_level", value as CalculatorInputs["activity_level"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="activity_level" aria-invalid={!!errors.activity_level}>
                  <SelectValue placeholder="Wybierz poziom aktywności" />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.activity_level && (
                <p className="text-sm text-red-500">{errors.activity_level.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Obliczanie..." : "Oblicz"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">BMR (podstawowa przemiana):</span>
                <span className="font-semibold">{Math.round(calculationResult.bmr)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">TDEE (całkowite zapotrzebowanie):</span>
                <span className="font-semibold">{Math.round(calculationResult.tdee)} kcal</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Sugerowane dzienne cele:</h4>
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="text-sm">Kalorie:</span>
                  <span className="font-medium">{calculationResult.suggested_targets.calories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Białko:</span>
                  <span className="font-medium">{calculationResult.suggested_targets.protein} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tłuszcz:</span>
                  <span className="font-medium">{calculationResult.suggested_targets.fat} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Węglowodany:</span>
                  <span className="font-medium">{calculationResult.suggested_targets.carbs} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Błonnik:</span>
                  <span className="font-medium">{calculationResult.suggested_targets.fiber} g</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Anuluj
              </Button>
              <Button type="button" onClick={handleApply}>
                Zastosuj te cele
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
