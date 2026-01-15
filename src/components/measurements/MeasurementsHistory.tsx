import { memo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { MeasurementDto } from "@/types";

interface MeasurementsHistoryProps {
  data: MeasurementDto[];
  onDelete: (measurementId: string) => Promise<void>;
}

export const MeasurementsHistory = memo(function MeasurementsHistory({
  data,
  onDelete,
}: MeasurementsHistoryProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState<MeasurementDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (measurement: MeasurementDto) => {
    setMeasurementToDelete(measurement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!measurementToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(measurementToDelete.id);
      setDeleteDialogOpen(false);
      setMeasurementToDelete(null);
    } catch (error) {
      console.error("Error deleting measurement:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia pomiarów</CardTitle>
          <CardDescription>Brak pomiarów do wyświetlenia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            <p>Dodaj swój pierwszy pomiar, aby zobaczyć historię</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia pomiarów</CardTitle>
        <CardDescription>Ostatnie {data.length} pomiarów</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Waga (kg)</TableHead>
                <TableHead className="text-right">Tłuszcz (%)</TableHead>
                <TableHead className="text-right">Mięśnie (%)</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((measurement) => (
                <TableRow key={measurement.id}>
                  <TableCell className="font-medium">
                    {new Date(measurement.date).toLocaleDateString("pl-PL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">{measurement.weight.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    {measurement.body_fat_percentage !== null
                      ? measurement.body_fat_percentage.toFixed(1)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {measurement.muscle_percentage !== null
                      ? measurement.muscle_percentage.toFixed(1)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(measurement)}
                      aria-label="Usuń pomiar"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten pomiar?</AlertDialogTitle>
            <AlertDialogDescription>
              {measurementToDelete && (
                <>
                  Pomiar z dnia{" "}
                  <strong>
                    {new Date(measurementToDelete.date).toLocaleDateString("pl-PL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </strong>{" "}
                  (waga: {measurementToDelete.weight.toFixed(1)} kg) zostanie trwale usunięty. Tej
                  operacji nie można cofnąć.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
});
