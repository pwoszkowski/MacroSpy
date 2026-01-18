import { Progress } from "@/components/ui/progress";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

interface MacroBarsProps {
  protein: { current: number; target: number };
  fat: { current: number; target: number };
  carbs: { current: number; target: number };
  fiber: { current: number; target: number };
}

/**
 * Individual macro progress bar with label and values.
 */
function MacroBar({ label, current, target, unit = "g" }: MacroBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground text-xs sm:text-sm">
          {Math.round(current)} / {target} {unit}
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-2"
        aria-label={`${label}: ${Math.round(current)} z ${target} ${unit}, ${Math.round(percentage)}%`}
      />
    </div>
  );
}

/**
 * Displays horizontal progress bars for macronutrients and fiber.
 */
export function MacroBars({ protein, fat, carbs, fiber }: MacroBarsProps) {
  return (
    <div className="space-y-4">
      <MacroBar label="Białko" current={protein.current} target={protein.target} />
      <MacroBar label="Tłuszcze" current={fat.current} target={fat.target} />
      <MacroBar label="Węglowodany" current={carbs.current} target={carbs.target} />
      <MacroBar label="Błonnik" current={fiber.current} target={fiber.target} />
    </div>
  );
}
