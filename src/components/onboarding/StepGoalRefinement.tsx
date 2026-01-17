/**
 * Krok 3: Prezentacja wyników TDEE i edycja celów dietetycznych
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MacroSplitSlider } from "./MacroSplitSlider";
import type { TDEECalculationResponse, GoalTargets } from "@/types";

interface StepGoalRefinementProps {
  tdeeResult: TDEECalculationResponse;
  goals: GoalTargets;
  onUpdate: (goals: Partial<GoalTargets>) => void;
  error?: string;
}

export function StepGoalRefinement({
  tdeeResult,
  goals,
  onUpdate,
  error,
}: StepGoalRefinementProps) {
  const [targetCalories, setTargetCalories] = useState(goals.calories);

  const handleCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 500 && value <= 10000) {
      setTargetCalories(value);
      onUpdate({ calories: Math.round(value) });
    }
  };

  const handleFiberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onUpdate({ fiber: Math.round(value) });
    }
  };

  // Oblicz deficyt/nadwyżkę względem TDEE
  const calorieDifference = targetCalories - tdeeResult.tdee;
  const isDeficit = calorieDifference < 0;
  const calorieGoalText = isDeficit
    ? `Deficyt ${Math.abs(calorieDifference).toFixed(0)} kcal`
    : calorieDifference > 0
    ? `Nadwyżka ${calorieDifference.toFixed(0)} kcal`
    : "Utrzymanie wagi";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Twoje spersonalizowane cele</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Na podstawie Twoich danych obliczyliśmy optymalne zapotrzebowanie. Możesz teraz zaakceptować nasze sugestie lub dostosować je do swoich preferencji.
        </p>
      </div>

      {/* Wyniki kalkulacji */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              BMR (Podstawowa przemiana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold">
              {Math.round(tdeeResult.bmr)} kcal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              TDEE (Całkowite zapotrzebowanie)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold">
              {Math.round(tdeeResult.tdee)} kcal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cel kaloryczny */}
      <div className="space-y-2">
        <Label htmlFor="target-calories">Docelowa ilość kalorii dziennie</Label>
        <Input
          id="target-calories"
          type="number"
          min="500"
          max="10000"
          step="50"
          value={targetCalories}
          onChange={handleCaloriesChange}
        />
        <p className="text-sm text-muted-foreground">{calorieGoalText}</p>
      </div>

      {/* Podział makroskładników */}
      <div className="space-y-3">
        <h3 className="font-medium">Podział makroskładników</h3>
        <MacroSplitSlider
          totalCalories={targetCalories}
          goals={goals}
          onUpdate={onUpdate}
        />
      </div>

      {/* Błonnik */}
      <div className="space-y-2">
        <Label htmlFor="fiber">Cel błonnika (g/dzień)</Label>
        <Input
          id="fiber"
          type="number"
          min="0"
          step="1"
          value={goals.fiber}
          onChange={handleFiberChange}
        />
        <p className="text-sm text-muted-foreground">
          Zalecane: 25-35g dziennie
        </p>
      </div>

      {/* Podsumowanie */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Podsumowanie dziennych celów</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Kalorie:</span>
            <span className="font-medium">{Math.round(goals.calories)} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Białko:</span>
            <span className="font-medium">{Math.round(goals.protein)}g ({Math.round(goals.protein * 4 * 100 / goals.calories)}%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tłuszcze:</span>
            <span className="font-medium">{Math.round(goals.fat)}g ({Math.round(goals.fat * 9 * 100 / goals.calories)}%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Węglowodany:</span>
            <span className="font-medium">{Math.round(goals.carbs)}g ({Math.round(goals.carbs * 4 * 100 / goals.calories)}%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Błonnik:</span>
            <span className="font-medium">{Math.round(goals.fiber)}g</span>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
