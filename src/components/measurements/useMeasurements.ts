import { useState, useEffect, useCallback } from "react";
import { getMeasurements, logMeasurement, deleteMeasurement } from "@/lib/api";
import type { MeasurementDto, LogMeasurementCommand } from "@/types";

interface UseMeasurementsReturn {
  measurements: MeasurementDto[];
  isLoading: boolean;
  error: string | null;
  fetchMeasurements: () => Promise<void>;
  addMeasurement: (data: LogMeasurementCommand) => Promise<void>;
  removeMeasurement: (measurementId: string) => Promise<void>;
}

export function useMeasurements(limit = 30): UseMeasurementsReturn {
  const [measurements, setMeasurements] = useState<MeasurementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeasurements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMeasurements(limit);
      setMeasurements(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać pomiarów";
      setError(errorMessage);
      console.error("Error fetching measurements:", err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const addMeasurement = useCallback(
    async (data: LogMeasurementCommand) => {
      try {
        await logMeasurement(data);
        // Refresh data after successful addition
        await fetchMeasurements();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zapisać pomiaru";
        throw new Error(errorMessage);
      }
    },
    [fetchMeasurements]
  );

  const removeMeasurement = useCallback(
    async (measurementId: string) => {
      try {
        await deleteMeasurement(measurementId);
        // Refresh data after successful deletion
        await fetchMeasurements();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się usunąć pomiaru";
        throw new Error(errorMessage);
      }
    },
    [fetchMeasurements]
  );

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  return {
    measurements,
    isLoading,
    error,
    fetchMeasurements,
    addMeasurement,
    removeMeasurement,
  };
}
