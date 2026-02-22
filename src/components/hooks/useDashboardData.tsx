import { useState, useEffect, useCallback } from "react";
import type { MealListResponse } from "@/types";
import { format } from "date-fns";

interface UseDashboardDataResult {
  data: MealListResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching dashboard data (meals for a specific date).
 * Handles SSR initial data and client-side refetching on date change.
 */
export function useDashboardData(selectedDate: Date, initialData?: MealListResponse): UseDashboardDataResult {
  const [data, setData] = useState<MealListResponse | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const timezoneOffsetMin = new Date().getTimezoneOffset();
      const response = await fetch(`/api/meals?date=${dateStr}&tz_offset_min=${timezoneOffsetMin}`);

      if (!response.ok) {
        throw new Error(`Błąd pobierania danych: ${response.statusText}`);
      }

      const mealsData: MealListResponse = await response.json();
      setData(mealsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMeals();
  }, [selectedDate, fetchMeals]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMeals,
  };
}
