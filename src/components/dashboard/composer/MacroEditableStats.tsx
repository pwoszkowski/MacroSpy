import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MealCandidateViewModel } from './types';

interface MacroEditableStatsProps {
  candidate: MealCandidateViewModel;
  onChange: (field: keyof MealCandidateViewModel, value: any) => void;
  disabled?: boolean;
}

/**
 * Edytowalne pola makroskładników w widoku Review.
 * Pozwala na ręczną korektę wartości po analizie AI.
 */
export function MacroEditableStats({ candidate, onChange, disabled = false }: MacroEditableStatsProps) {
  const handleNumberChange = (field: keyof MealCandidateViewModel, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(field, numValue);
    } else if (value === '' || value === '-') {
      onChange(field, 0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Nazwa posiłku */}
      <div className="space-y-2">
        <Label htmlFor="meal-name">Nazwa posiłku</Label>
        <Input
          id="meal-name"
          type="text"
          value={candidate.name}
          onChange={(e) => onChange('name', e.target.value)}
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
            value={candidate.calories}
            onChange={(e) => handleNumberChange('calories', e.target.value)}
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
            value={candidate.protein}
            onChange={(e) => handleNumberChange('protein', e.target.value)}
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
            value={candidate.fat}
            onChange={(e) => handleNumberChange('fat', e.target.value)}
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
            value={candidate.carbs}
            onChange={(e) => handleNumberChange('carbs', e.target.value)}
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
            value={candidate.fiber}
            onChange={(e) => handleNumberChange('fiber', e.target.value)}
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
