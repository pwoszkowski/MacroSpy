import { useState, useMemo, memo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MeasurementDto } from "@/types";

interface MeasurementsChartProps {
  data: MeasurementDto[];
}

type ChartType = "weight" | "composition";

export const MeasurementsChart = memo(function MeasurementsChart({ data }: MeasurementsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("weight");

  // Sort data chronologically (ascending) for chart display
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString("pl-PL", {
          day: "2-digit",
          month: "short",
        }),
      }));
  }, [data]);

  // Check if composition data exists
  const hasCompositionData = useMemo(() => {
    return data.some((item) => item.body_fat_percentage !== null || item.muscle_percentage !== null);
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wykres postępów</CardTitle>
          <CardDescription>Brak danych do wyświetlenia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>Dodaj swój pierwszy pomiar, aby zobaczyć wykres postępów</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Wykres postępów</CardTitle>
            <CardDescription>{chartType === "weight" ? "Historia wagi" : "Skład ciała w czasie"}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === "weight" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("weight")}
            >
              Waga
            </Button>
            <Button
              variant={chartType === "composition" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("composition")}
              disabled={!hasCompositionData}
            >
              Skład ciała
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "weight" ? (
            <LineChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="formattedDate" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                domain={["dataMin - 2", "dataMax + 2"]}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                label={{ value: "Waga (kg)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{
                  fill: "hsl(var(--background))",
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 3,
                  r: 6,
                }}
                activeDot={{ r: 8, strokeWidth: 3 }}
                name="Waga (kg)"
                isAnimationActive={true}
              />
            </LineChart>
          ) : (
            <LineChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="formattedDate" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                domain={[0, 100]}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                label={{ value: "Procent (%)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="body_fat_percentage"
                stroke="hsl(var(--destructive))"
                strokeWidth={3}
                dot={{
                  fill: "hsl(var(--background))",
                  stroke: "hsl(var(--destructive))",
                  strokeWidth: 3,
                  r: 6,
                }}
                activeDot={{ r: 8, strokeWidth: 3 }}
                name="Tłuszcz (%)"
                connectNulls
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="muscle_percentage"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{
                  fill: "hsl(var(--background))",
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 3,
                  r: 6,
                }}
                activeDot={{ r: 8, strokeWidth: 3 }}
                name="Mięśnie (%)"
                connectNulls
                isAnimationActive={true}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
