/**
 * Krok 2: Wybór poziomu aktywności fizycznej
 */

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ACTIVITY_LEVEL_LABELS, type ActivityLevel } from "@/types/onboarding";

interface StepActivityProps {
  value: ActivityLevel | null;
  onChange: (value: ActivityLevel) => void;
  error?: string;
}

export function StepActivity({ value, onChange, error }: StepActivityProps) {
  const activityLevels: ActivityLevel[] = [
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extremely_active",
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Jak aktywny jest Twój dzień?</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Twój poziom aktywności ma ogromny wpływ na zapotrzebowanie energetyczne. Wybierz opcję, która najlepiej oddaje Twój styl życia.
        </p>
      </div>

      <div className="grid gap-2.5 sm:gap-3">
        {activityLevels.map((level) => {
          const { label, description } = ACTIVITY_LEVEL_LABELS[level];
          const isSelected = value === level;

          return (
            <Card
              key={level}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
                isSelected && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => onChange(level)}
              tabIndex={0}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${label}: ${description}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(level);
                }
              }}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div
                    className={cn(
                      "mt-0.5 size-4 sm:size-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <div className="size-1.5 sm:size-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-0.5 sm:mb-1 text-sm sm:text-base">{label}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-destructive animate-in fade-in duration-200">{error}</p>
      )}
    </div>
  );
}
