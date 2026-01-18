import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Weight, Activity } from "lucide-react";
import type { MeasurementDto } from "@/types";

interface MeasurementsSummaryProps {
  latest: MeasurementDto | null;
  previous: MeasurementDto | null;
}

export const MeasurementsSummary = memo(function MeasurementsSummary({ latest, previous }: MeasurementsSummaryProps) {
  if (!latest) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brak pomiarów</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Dodaj swój pierwszy pomiar</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weightChange = previous ? latest.weight - previous.weight : null;
  const bmi = latest.weight / Math.pow(1.75, 2); // Placeholder - ideally get height from profile

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktualna waga</CardTitle>
          <Weight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{latest.weight.toFixed(1)} kg</div>
          <p className="text-xs text-muted-foreground">{new Date(latest.date).toLocaleDateString("pl-PL")}</p>
        </CardContent>
      </Card>

      {weightChange !== null && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zmiana wagi</CardTitle>
            {weightChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${weightChange > 0 ? "text-red-500" : "text-green-500"}`}>
              {weightChange > 0 ? "+" : ""}
              {weightChange.toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">Od poprzedniego pomiaru</p>
          </CardContent>
        </Card>
      )}

      {latest.body_fat_percentage !== null && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tkanka tłuszczowa</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latest.body_fat_percentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Ostatni pomiar</p>
          </CardContent>
        </Card>
      )}

      {latest.muscle_percentage !== null && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masa mięśniowa</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latest.muscle_percentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Ostatni pomiar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
