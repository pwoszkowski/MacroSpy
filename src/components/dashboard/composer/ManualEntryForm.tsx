import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ManualEntryData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

interface ManualEntryFormProps {
  onSubmit: (data: ManualEntryData) => void;
  isSubmitting: boolean;
}

/**
 * Formularz do ręcznego wprowadzania nazwy posiłku i makroskładników.
 * Pomija analizę AI.
 */
export function ManualEntryForm({ onSubmit, isSubmitting }: ManualEntryFormProps) {
  const [formData, setFormData] = useState<ManualEntryData>({
    name: "",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
  });

  const [error, setError] = useState<string | null>(null);

  const handleNumberChange = (field: keyof Omit<ManualEntryData, "name">, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData((prev) => ({ ...prev, [field]: numValue }));
    } else if (value === "" || value === "0") {
      setFormData((prev) => ({ ...prev, [field]: 0 }));
    }
  };

  const handleSubmit = () => {
    setError(null);

    // Walidacja
    if (!formData.name.trim()) {
      setError("Nazwa posiłku jest wymagana");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Nazwa musi mieć co najmniej 2 znaki");
      return;
    }

    onSubmit(formData);
  };

  const canSubmit = formData.name.trim().length >= 2 && !isSubmitting;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Nazwa posiłku */}
      <div className="space-y-2">
        <Label htmlFor="manual-name">Nazwa posiłku</Label>
        <Input
          id="manual-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          disabled={isSubmitting}
          placeholder="np. Jajecznica z warzywami"
          required
        />
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
            value={formData.calories}
            onChange={(e) => handleNumberChange("calories", e.target.value)}
            disabled={isSubmitting}
            placeholder="0"
          />
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
            value={formData.protein}
            onChange={(e) => handleNumberChange("protein", e.target.value)}
            disabled={isSubmitting}
            placeholder="0"
          />
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
            value={formData.fat}
            onChange={(e) => handleNumberChange("fat", e.target.value)}
            disabled={isSubmitting}
            placeholder="0"
          />
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
            value={formData.carbs}
            onChange={(e) => handleNumberChange("carbs", e.target.value)}
            disabled={isSubmitting}
            placeholder="0"
          />
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
            value={formData.fiber}
            onChange={(e) => handleNumberChange("fiber", e.target.value)}
            disabled={isSubmitting}
            placeholder="0"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Wprowadź wartości odżywcze na podstawie etykiety produktu lub własnej wiedzy
      </p>

      {/* Błędy */}
      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

      {/* Przycisk Submit */}
      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full" size="lg">
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
