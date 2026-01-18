import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDashboardData } from "../components/hooks/useDashboardData";
import { format } from "date-fns";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useDashboardData", () => {
  const mockMealData: MealListResponse = {
    data: [
      {
        id: "1",
        name: "Jajecznica",
        calories: 250,
        protein: 15,
        fat: 18,
        carbs: 2,
        fiber: 0,
        ai_suggestion: "Dobra porcja białka",
        consumed_at: "2024-01-18T08:00:00Z",
      },
    ],
    summary: {
      total_calories: 250,
      total_protein: 15,
      total_fat: 18,
      total_carbs: 2,
      total_fiber: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("stan początkowy z initialData", () => {
    it("powinien użyć initialData jeśli zostało przekazane", () => {
      const today = new Date();
      const { result } = renderHook(() => useDashboardData(today, mockMealData));

      expect(result.current.data).toEqual(mockMealData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe("function");
    });
  });

  describe("refetch", () => {
    it("powinien ponownie pobrać dane", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockMealData,
          data: [...mockMealData.data, {
            id: "2",
            name: "Dodany posiłek",
            calories: 200,
            protein: 10,
            fat: 8,
            carbs: 25,
            fiber: 3,
            ai_suggestion: null,
            consumed_at: "2024-01-18T15:00:00Z",
          }],
        }),
      });

      const today = new Date();
      const { result } = renderHook(() => useDashboardData(today, mockMealData));

      expect(result.current.data?.data).toHaveLength(1);

      // Wywołaj refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data?.data).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it("powinien obsłużyć błąd podczas refetch", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      });

      const today = new Date();
      const { result } = renderHook(() => useDashboardData(today, mockMealData));

      // Wywołaj refetch z błędem
      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.error).toBe("Błąd pobierania danych: Not Found");
      expect(result.current.data).toEqual(mockMealData); // Dane powinny pozostać
    });

    it("powinien obsłużyć błąd sieci podczas refetch", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const today = new Date();
      const { result } = renderHook(() => useDashboardData(today, mockMealData));

      // Wywołaj refetch z błędem sieci
      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.data).toEqual(mockMealData); // Dane powinny pozostać
    });
  });

  describe("automatyczne pobieranie danych", () => {
    it("powinien pominąć automatyczne pobieranie gdy initialData istnieje dla dzisiejszej daty", () => {
      const today = new Date();
      const { result } = renderHook(() => useDashboardData(today, mockMealData));

      expect(result.current.data).toEqual(mockMealData);
      expect(result.current.isLoading).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});