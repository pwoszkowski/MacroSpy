/**
 * Komponent do regulacji proporcji makroskładników
 * Pozwala na manipulację procentowym udziałem białka, tłuszczów i węglowodanów
 */

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import type { GoalTargets } from "@/types";

interface MacroSplitSliderProps {
  totalCalories: number;
  goals: GoalTargets;
  onUpdate: (goals: Partial<GoalTargets>) => void;
}

const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export function MacroSplitSlider({ totalCalories, goals, onUpdate }: MacroSplitSliderProps) {
  // Przelicz gramy na procenty
  const proteinPercent = Math.round((goals.protein * CALORIES_PER_GRAM.protein * 100) / totalCalories);
  const fatPercent = Math.round((goals.fat * CALORIES_PER_GRAM.fat * 100) / totalCalories);
  const carbsPercent = Math.round((goals.carbs * CALORIES_PER_GRAM.carbs * 100) / totalCalories);

  const totalPercent = proteinPercent + fatPercent + carbsPercent;

  const handleProteinChange = (value: number[]) => {
    const newProteinGrams = Math.round(((value[0] / 100) * totalCalories) / CALORIES_PER_GRAM.protein);
    onUpdate({ protein: newProteinGrams });
  };

  const handleFatChange = (value: number[]) => {
    const newFatGrams = Math.round(((value[0] / 100) * totalCalories) / CALORIES_PER_GRAM.fat);
    onUpdate({ fat: newFatGrams });
  };

  const handleCarbsChange = (value: number[]) => {
    const newCarbsGrams = Math.round(((value[0] / 100) * totalCalories) / CALORIES_PER_GRAM.carbs);
    onUpdate({ carbs: newCarbsGrams });
  };

  const handleProteinGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onUpdate({ protein: Math.round(value) });
    }
  };

  const handleFatGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onUpdate({ fat: Math.round(value) });
    }
  };

  const handleCarbsGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onUpdate({ carbs: Math.round(value) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Białko */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="protein-slider" className="shrink-0">
            Białko
          </Label>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Input
              id="protein-grams"
              type="number"
              min="0"
              step="1"
              value={goals.protein}
              onChange={handleProteinGramsChange}
              className="w-16 sm:w-20 h-8 text-xs sm:text-sm"
            />
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">g ({proteinPercent}%)</span>
          </div>
        </div>
        <Slider
          id="protein-slider"
          value={[proteinPercent]}
          onValueChange={handleProteinChange}
          max={100}
          step={1}
          className="w-full"
          aria-label="Procent białka"
        />
      </div>

      {/* Tłuszcze */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="fat-slider" className="shrink-0">
            Tłuszcze
          </Label>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Input
              id="fat-grams"
              type="number"
              min="0"
              step="1"
              value={goals.fat}
              onChange={handleFatGramsChange}
              className="w-16 sm:w-20 h-8 text-xs sm:text-sm"
            />
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">g ({fatPercent}%)</span>
          </div>
        </div>
        <Slider
          id="fat-slider"
          value={[fatPercent]}
          onValueChange={handleFatChange}
          max={100}
          step={1}
          className="w-full"
          aria-label="Procent tłuszczy"
        />
      </div>

      {/* Węglowodany */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="carbs-slider" className="shrink-0">
            Węglowodany
          </Label>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Input
              id="carbs-grams"
              type="number"
              min="0"
              step="1"
              value={goals.carbs}
              onChange={handleCarbsGramsChange}
              className="w-16 sm:w-20 h-8 text-xs sm:text-sm"
            />
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">g ({carbsPercent}%)</span>
          </div>
        </div>
        <Slider
          id="carbs-slider"
          value={[carbsPercent]}
          onValueChange={handleCarbsChange}
          max={100}
          step={1}
          className="w-full"
          aria-label="Procent węglowodanów"
        />
      </div>

      {/* Ostrzeżenie o sumie procentów */}
      {Math.abs(totalPercent - 100) > 5 && (
        <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            Suma procentów: {totalPercent}%. Zalecana wartość to ~100%.
          </p>
        </div>
      )}
    </div>
  );
}
