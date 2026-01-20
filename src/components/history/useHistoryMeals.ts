import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import type { MealDto, MealSummary, CreateMealCommand, UpdateMealCommand } from "@/types";

interface UseHistoryMealsResult {
  meals: MealDto[];
  summary: MealSummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createMeal: (command: CreateMealCommand) => Promise<void>;
  updateMeal: (id: string, command: UpdateMealCommand) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
}

/**
 * Custom hook for managing meals history for a specific date.
 * Provides CRUD operations and automatic data refreshing.
 */
export function useHistoryMeals(selectedDate: Date): UseHistoryMealsResult {
  const [meals, setMeals] = useState<MealDto[]>([]);
  const [summary, setSummary] = useState<MealSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`/api/meals?date=${dateStr}`);

      if (!response.ok) {
        throw new Error(`Błąd pobierania danych: ${response.statusText}`);
      }

      const data = await response.json();
      setMeals(data.data || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      setMeals([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  const createMeal = useCallback(
    async (command: CreateMealCommand) => {
      try {
        const response = await fetch("/api/meals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Nie udało się dodać posiłku");
        }

        await fetchMeals();
    },
    [fetchMeals]
  );

  const updateMeal = useCallback(
    async (id: string, command: UpdateMealCommand) => {
      try {
        const response = await fetch(`/api/meals/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Nie udało się zaktualizować posiłku");
        }

        await fetchMeals();
    },
    [fetchMeals]
  );

  const deleteMeal = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/meals/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Nie udało się usunąć posiłku");
        }

        await fetchMeals();
    },
    [fetchMeals]
  );

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return {
    meals,
    summary,
    isLoading,
    error,
    refresh: fetchMeals,
    createMeal,
    updateMeal,
    deleteMeal,
  };
}
