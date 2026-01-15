import { useState, useCallback, useMemo } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { MeasurementsSummary } from "./MeasurementsSummary";
import { MeasurementsChart } from "./MeasurementsChart";
import { MeasurementLogDialog } from "./MeasurementLogDialog";
import { MeasurementsHistory } from "./MeasurementsHistory";
import { useMeasurements } from "./useMeasurements";
import type { MeasurementFormValues } from "./schemas";

export function MeasurementsDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { measurements, isLoading, error, addMeasurement, removeMeasurement, fetchMeasurements } =
    useMeasurements(30);

  const handleAddMeasurement = useCallback(
    async (data: MeasurementFormValues) => {
      try {
        await addMeasurement({
          date: data.date,
          weight: data.weight,
          body_fat_percentage: data.body_fat_percentage ?? null,
          muscle_percentage: data.muscle_percentage ?? null,
        });
        toast.success("Pomiar został zapisany");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zapisać pomiaru";
        toast.error(errorMessage);
        throw err;
      }
    },
    [addMeasurement]
  );

  const handleDeleteMeasurement = useCallback(
    async (measurementId: string) => {
      try {
        await removeMeasurement(measurementId);
        toast.success("Pomiar został usunięty");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się usunąć pomiaru";
        toast.error(errorMessage);
        throw err;
      }
    },
    [removeMeasurement]
  );

  const latest = useMemo(() => measurements[0] ?? null, [measurements]);
  const previous = useMemo(() => measurements[1] ?? null, [measurements]);

  if (error) {
    return (
      <PageLayout currentPath="/measurements" showAddMealButton={false}>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold">Nie udało się pobrać historii pomiarów</h2>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={fetchMeasurements}>Spróbuj ponownie</Button>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPath="/measurements" showAddMealButton={false}>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pomiary ciała</h1>
              <p className="text-sm text-muted-foreground">
                Monitoruj swoją wagę i skład ciała w czasie
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="flex-shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj pomiar
            </Button>
          </div>

          {/* Summary Cards */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-8 w-16" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </Card>
              ))}
            </div>
          ) : (
            <MeasurementsSummary latest={latest} previous={previous} />
          )}

          {/* Chart */}
          {isLoading ? (
            <Card className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </Card>
          ) : (
            <MeasurementsChart data={measurements} />
          )}

          {/* History Table */}
          {isLoading ? (
            <Card className="p-6">
              <Skeleton className="h-[400px] w-full" />
            </Card>
          ) : (
            <MeasurementsHistory data={measurements} onDelete={handleDeleteMeasurement} />
          )}

          {/* Add Measurement Dialog */}
          <MeasurementLogDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSuccess={handleAddMeasurement}
          />
        </div>
      </div>
    </PageLayout>
  );
}
