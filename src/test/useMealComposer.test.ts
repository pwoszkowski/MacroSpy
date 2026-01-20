import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMealComposer } from "../components/dashboard/composer/useMealComposer";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useMealComposer", () => {
  const mockAnalyzeResponse = {
    name: "Jajecznica",
    calories: 250,
    protein: 15,
    fat: 18,
    carbs: 2,
    fiber: 0,
    assistant_response: "Przygotowałem jajecznicę z 2 jajek",
    dietary_suggestion: "Dobra porcja białka na śniadanie",
    ai_context: { session_id: "test" },
  };

  const mockRefineResponse = {
    name: "Jajecznica z pomidorami",
    calories: 280,
    protein: 16,
    fat: 20,
    carbs: 4,
    fiber: 1,
    assistant_response: "Dodałem pomidory do jajecznicy",
    dietary_suggestion: "Bogatsza wersja z dodatkiem warzyw",
    ai_context: { session_id: "test", refined: true },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("Stan początkowy", () => {
    it("powinien zwrócić początkowy stan idle", () => {
      const { result } = renderHook(() => useMealComposer());

      expect(result.current.status).toBe("idle");
      expect(result.current.inputText).toBe("");
      expect(result.current.selectedImages).toEqual([]);
      expect(result.current.candidate).toBeNull();
      expect(result.current.interactions).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe("setInputText", () => {
    it("powinien aktualizować tekst wejściowy", () => {
      const { result } = renderHook(() => useMealComposer());

      act(() => {
        result.current.setInputText("Zjadłem jajecznicę");
      });

      expect(result.current.inputText).toBe("Zjadłem jajecznicę");
    });
  });

  describe("setSelectedImages", () => {
    it("powinien aktualizować wybrane zdjęcia", () => {
      const { result } = renderHook(() => useMealComposer());

      const images = ["base64image1", "base64image2"];
      act(() => {
        result.current.setSelectedImages(images);
      });

      expect(result.current.selectedImages).toEqual(images);
    });
  });

  describe("analyze", () => {
    it("powinien zmienić stan na analyzing i wywołać API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalyzeResponse),
      });

      const { result } = renderHook(() => useMealComposer());

      act(() => {
        result.current.setInputText("Zjadłem jajecznicę");
      });

      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      expect(result.current.status).toBe("review");
      expect(result.current.candidate).toEqual({
        name: "Jajecznica",
        calories: 250,
        protein: 15,
        fat: 18,
        carbs: 2,
        fiber: 0,
        ai_suggestion: "Dobra porcja białka na śniadanie",
        assistant_response: "Przygotowałem jajecznicę z 2 jajek",
        ai_context: { session_id: "test" },
        original_prompt: "Zjadłem jajecznicę",
        is_image_analyzed: false,
        consumed_at: expect.any(String),
      });
      expect(result.current.interactions).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it("powinien obsługiwać błąd gdy brak tekstu i zdjęć", async () => {
      const { result } = renderHook(() => useMealComposer());

      await act(async () => {
        await result.current.analyze("", []);
      });

      expect(result.current.status).toBe("idle");
      expect(result.current.error).toBe("Wprowadź opis lub dodaj zdjęcie");
    });

    it("powinien obsługiwać błąd API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

      const { result } = renderHook(() => useMealComposer());

      act(() => {
        result.current.setInputText("Zjadłem jajecznicę");
      });

      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      expect(result.current.status).toBe("idle");
      expect(result.current.error).toBe("Nie udało się przeanalizować posiłku");
    });

    it("powinien obsługiwać błąd sieci", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useMealComposer());

      act(() => {
        result.current.setInputText("Zjadłem jajecznicę");
      });

      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      expect(result.current.status).toBe("idle");
      expect(result.current.error).toBe("Network error");
    });

    it("powinien obsługiwać analizę ze zdjęciami", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalyzeResponse),
      });

      const { result } = renderHook(() => useMealComposer());

      const images = ["base64image1"];
      await act(async () => {
        await result.current.analyze("Zdjęcie posiłku", images);
      });

      expect(result.current.candidate?.is_image_analyzed).toBe(true);
    });
  });

  describe("createManualEntry", () => {
    it("powinien utworzyć posiłek ręcznie i zmienić stan na review", () => {
      const { result } = renderHook(() => useMealComposer());

      const manualData = {
        name: "Jajecznica",
        calories: 250,
        protein: 15,
        fat: 18,
        carbs: 2,
        fiber: 0,
      };

      act(() => {
        result.current.createManualEntry(manualData);
      });

      expect(result.current.status).toBe("review");
      expect(result.current.candidate).toEqual({
        name: "Jajecznica",
        calories: 250,
        protein: 15,
        fat: 18,
        carbs: 2,
        fiber: 0,
        ai_suggestion: null,
        assistant_response: null,
        ai_context: null,
        original_prompt: "",
        is_image_analyzed: false,
        consumed_at: expect.any(String),
      });
    });
  });

  describe("refine", () => {
    it("powinien zmienić stan na refining i zaktualizować posiłek", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAnalyzeResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRefineResponse),
        });

      const { result } = renderHook(() => useMealComposer());

      // Najpierw utwórz posiłek
      act(() => {
        result.current.setInputText("Zjadłem jajecznicę");
      });

      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      expect(result.current.status).toBe("review");

      // Teraz refine
      await act(async () => {
        await result.current.refine("Dodaj pomidory");
      });

      expect(result.current.status).toBe("review");
      expect(result.current.candidate?.name).toBe("Jajecznica z pomidorami");
      expect(result.current.candidate?.carbs).toBe(4);
      expect(result.current.interactions).toHaveLength(4); // 2 początkowe + 2 z refine
    });

    it("powinien obsługiwać błąd podczas refine", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAnalyzeResponse),
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Bad Request",
        });

      const { result } = renderHook(() => useMealComposer());

      // Najpierw utwórz posiłek
      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      // Refine z błędem
      await act(async () => {
        await result.current.refine("Dodaj pomidory");
      });

      expect(result.current.status).toBe("review");
      expect(result.current.error).toBe("Nie udało się zaktualizować posiłku");
    });

    it("nie powinien działać bez candidate", async () => {
      const { result } = renderHook(() => useMealComposer());

      await act(async () => {
        await result.current.refine("Dodaj coś");
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("updateCandidate", () => {
    it("powinien aktualizować pojedyncze pole candidate", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalyzeResponse),
      });

      const { result } = renderHook(() => useMealComposer());

      // Najpierw utwórz posiłek
      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      act(() => {
        result.current.updateCandidate("name", "Jajecznica specjalna");
      });

      expect(result.current.candidate?.name).toBe("Jajecznica specjalna");
    });

    it("nie powinien działać bez candidate", () => {
      const { result } = renderHook(() => useMealComposer());

      act(() => {
        result.current.updateCandidate("name", "Test");
      });

      expect(result.current.candidate).toBeNull();
    });
  });

  describe("save", () => {
    it("powinien zapisać posiłek i zmienić stan na success", async () => {
      const mockOnSuccess = vi.fn();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAnalyzeResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const { result } = renderHook(() => useMealComposer(mockOnSuccess));

      // Najpierw utwórz posiłek
      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.status).toBe("success");
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("powinien obsługiwać walidację - brak nazwy", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockAnalyzeResponse, name: "" }),
      });

      const { result } = renderHook(() => useMealComposer());

      await act(async () => {
        await result.current.analyze("Zjadłem coś", []);
      });

      act(() => {
        result.current.updateCandidate("name", "");
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.error).toBe("Nazwa posiłku jest wymagana");
      expect(result.current.status).toBe("review");
    });

    it("powinien obsługiwać walidację - ujemne wartości makroskładników", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalyzeResponse),
      });

      const { result } = renderHook(() => useMealComposer());

      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      act(() => {
        result.current.updateCandidate("calories", -100);
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.error).toBe("Wartości makroskładników muszą być nieujemne");
    });

    it("powinien obsługiwać błąd API podczas zapisywania", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAnalyzeResponse),
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Internal Server Error",
        });

      const { result } = renderHook(() => useMealComposer());

      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.status).toBe("review");
      expect(result.current.error).toBe("Nie udało się zapisać posiłku");
    });

    it("powinien zmienić stan na success i wywołać onSuccess", async () => {
      const mockOnSuccess = vi.fn();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAnalyzeResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const { result } = renderHook(() => useMealComposer(mockOnSuccess));

      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.status).toBe("success");
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);

      // Sprawdź czy stan nadal jest success (reset dzieje się asynchronicznie)
      expect(result.current.status).toBe("success");
    });

    it("nie powinien działać bez candidate", async () => {
      const { result } = renderHook(() => useMealComposer());

      await act(async () => {
        await result.current.save();
      });

      expect(mockFetch).toHaveBeenCalledTimes(0);
    });
  });

  describe("reset", () => {
    it("powinien zresetować cały stan", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalyzeResponse),
      });

      const { result } = renderHook(() => useMealComposer());

      // Ustaw jakiś stan
      act(() => {
        result.current.setInputText("Test");
        result.current.setSelectedImages(["image"]);
      });

      await act(async () => {
        await result.current.analyze("Test", ["image"]);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe("idle");
      expect(result.current.inputText).toBe("");
      expect(result.current.selectedImages).toEqual([]);
      expect(result.current.candidate).toBeNull();
      expect(result.current.interactions).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe("integracja z onSuccess callback", () => {
    it("powinien wywołać onSuccess po zapisie", async () => {
      const mockOnSuccess = vi.fn();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAnalyzeResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const { result } = renderHook(() => useMealComposer(mockOnSuccess));

      await act(async () => {
        await result.current.analyze("Zjadłem jajecznicę", []);
      });

      await act(async () => {
        await result.current.save();
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
