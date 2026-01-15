import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MealSummary } from "@/types";

interface DaySummaryProps {
  summary: MealSummary | null;
  isLoading: boolean;
}

interface StatItemProps {
  label: string;
  value: number;
  unit: string;
}

function StatItem({ label, value, unit }: StatItemProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
      <span className="text-2xl font-bold text-foreground">{Math.round(value)}</span>
      <span className="text-xs text-muted-foreground mt-1">{unit}</span>
      <span className="text-sm font-medium text-foreground mt-1">{label}</span>
    </div>
  );
}

function StatItemSkeleton() {
  return (
    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-8 mb-1" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

/**
 * Displays daily summary of macronutrients for selected date.
 * Shows total calories and macro breakdown in a grid layout.
 */
export function DaySummary({ summary, isLoading }: DaySummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Podsumowanie dnia</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatItemSkeleton />
            <StatItemSkeleton />
            <StatItemSkeleton />
            <StatItemSkeleton />
            <StatItemSkeleton />
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatItem label="Kalorie" value={summary.total_calories} unit="kcal" />
            <StatItem label="Białko" value={summary.total_protein} unit="g" />
            <StatItem label="Tłuszcze" value={summary.total_fat} unit="g" />
            <StatItem label="Węglowodany" value={summary.total_carbs} unit="g" />
            <StatItem label="Błonnik" value={summary.total_fiber} unit="g" />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Brak danych dla tego dnia</div>
        )}
      </CardContent>
    </Card>
  );
}
