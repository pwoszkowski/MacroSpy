interface CaloriesRingProps {
  current: number;
  target: number;
}

/**
 * Circular progress indicator for daily calorie intake.
 * Displays current vs target calories with visual ring.
 */
export function CaloriesRing({ current, target }: CaloriesRingProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on percentage: green (ok), yellow (close), red (exceeded)
  const getColor = () => {
    if (percentage >= 100) return "stroke-red-500";
    if (percentage >= 85) return "stroke-yellow-500";
    return "stroke-green-500";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-40 h-40 sm:w-48 sm:h-48"
        role="img"
        aria-label={`Spożyte kalorie: ${Math.round(current)} z ${target}, ${Math.round(percentage)}%`}
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
          {/* Background circle */}
          <circle cx="80" cy="80" r={radius} className="stroke-muted" strokeWidth="12" fill="none" />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`${getColor()} transition-all duration-500`}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold">{Math.round(current)}</span>
          <span className="text-xs sm:text-sm text-muted-foreground">z {target} kcal</span>
        </div>
      </div>
    </div>
  );
}
