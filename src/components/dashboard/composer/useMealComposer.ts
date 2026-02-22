import { useState, useCallback } from "react";
import type { ComposerStatus, ManualEntryData, MealCandidateViewModel, InteractionLog } from "./types";
import type { AnalyzeMealResponse, CreateMealCommand } from "@/types";

export interface SaveMealResult {
  savedToFavorites: boolean;
  favoriteError: string | null;
}

interface UseMealComposerOptions {
  defaultConsumedAt?: string;
}

interface UseMealComposerReturn {
  status: ComposerStatus;
  inputText: string;
  selectedImages: string[];
  candidate: MealCandidateViewModel | null;
  interactions: InteractionLog[];
  isFavorite: boolean;
  error: string | null;
  setInputText: (text: string) => void;
  setSelectedImages: (images: string[]) => void;
  analyze: (text: string, images: string[]) => Promise<void>;
  createManualEntry: (data: ManualEntryData) => void;
  refine: (prompt: string) => Promise<void>;
  updateCandidate: (field: keyof MealCandidateViewModel, value: number | string) => void;
  setFavorite: (checked: boolean) => void;
  save: () => Promise<void>;
  reset: () => void;
}

const resolveConsumedAt = (defaultConsumedAt?: string): string => {
  if (!defaultConsumedAt) {
    return new Date().toISOString();
  }

  const parsedDate = new Date(defaultConsumedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
};

export function useMealComposer(
  onSuccess?: (result: SaveMealResult) => void,
  options?: UseMealComposerOptions
): UseMealComposerReturn {
  const initialConsumedAt = resolveConsumedAt(options?.defaultConsumedAt);
  const [status, setStatus] = useState<ComposerStatus>("idle");
  const [inputText, setInputText] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [candidate, setCandidate] = useState<MealCandidateViewModel | null>(null);
  const [interactions, setInteractions] = useState<InteractionLog[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseApiError = async (response: Response, fallback: string): Promise<string> => {
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      return payload.error || payload.message || fallback;
    } catch {
      return fallback;
    }
  };

  const createManualEntry = useCallback(
    (data: ManualEntryData) => {
      const newCandidate: MealCandidateViewModel = {
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        fiber: data.fiber,
        ai_suggestion: null,
        assistant_response: null,
        ai_context: null,
        original_prompt: "",
        is_image_analyzed: false,
        consumed_at: initialConsumedAt,
      };

      setCandidate(newCandidate);
      setStatus("review");
    },
    [initialConsumedAt]
  );

  const analyze = useCallback(
    async (text: string, images: string[]) => {
      if (!text.trim() && images.length === 0) {
        setError("Wprowadź opis lub dodaj zdjęcie");
        return;
      }

      setStatus("analyzing");
      setError(null);

      try {
        const response = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text_prompt: text,
            images: images.length > 0 ? images : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error("Nie udało się przeanalizować posiłku");
        }

        const data: AnalyzeMealResponse = await response.json();

        const newCandidate: MealCandidateViewModel = {
          name: data.name,
          calories: data.calories,
          protein: data.protein,
          fat: data.fat,
          carbs: data.carbs,
          fiber: data.fiber,
          ai_suggestion: data.dietary_suggestion,
          assistant_response: data.assistant_response,
          ai_context: data.ai_context,
          original_prompt: text,
          is_image_analyzed: images.length > 0,
          consumed_at: initialConsumedAt,
        };

        setCandidate(newCandidate);

        // Dodaj interakcję do historii
        setInteractions([
          {
            id: `user-${Date.now()}`,
            role: "user",
            content: text,
            timestamp: Date.now(),
          },
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.assistant_response,
            timestamp: Date.now(),
          },
        ]);

        setStatus("review");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nieznany błąd");
        setStatus("idle");
      }
    },
    [initialConsumedAt]
  );

  const refine = useCallback(
    async (prompt: string) => {
      if (!candidate) return;

      setStatus("refining");
      setError(null);

      // Dodaj wiadomość użytkownika do historii
      const userInteraction: InteractionLog = {
        id: `user-${Date.now()}`,
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };

      setInteractions((prev) => [...prev, userInteraction]);

      try {
        const response = await fetch("/api/ai/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            previous_context: candidate.ai_context,
            correction_prompt: prompt,
          }),
        });

        if (!response.ok) {
          throw new Error("Nie udało się zaktualizować posiłku");
        }

        const data: AnalyzeMealResponse = await response.json();

        const updatedCandidate: MealCandidateViewModel = {
          ...candidate,
          name: data.name,
          calories: data.calories,
          protein: data.protein,
          fat: data.fat,
          carbs: data.carbs,
          fiber: data.fiber,
          ai_suggestion: data.dietary_suggestion,
          assistant_response: data.assistant_response,
          ai_context: data.ai_context,
        };

        setCandidate(updatedCandidate);

        // Dodaj odpowiedź asystenta
        const assistantInteraction: InteractionLog = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.assistant_response,
          timestamp: Date.now(),
        };

        setInteractions((prev) => [...prev, assistantInteraction]);
        setStatus("review");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nieznany błąd");
        setStatus("review");
      }
    },
    [candidate]
  );

  const updateCandidate = useCallback(
    (field: keyof MealCandidateViewModel, value: number | string) => {
      if (!candidate) return;

      setCandidate({
        ...candidate,
        [field]: value,
      });
    },
    [candidate]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setInputText("");
    setSelectedImages([]);
    setCandidate(null);
    setInteractions([]);
    setIsFavorite(false);
    setError(null);
  }, []);

  const save = useCallback(async () => {
    if (!candidate) return;

    // Walidacja
    if (!candidate.name.trim()) {
      setError("Nazwa posiłku jest wymagana");
      return;
    }

    if (
      candidate.calories < 0 ||
      candidate.protein < 0 ||
      candidate.fat < 0 ||
      candidate.carbs < 0 ||
      candidate.fiber < 0
    ) {
      setError("Wartości makroskładników muszą być nieujemne");
      return;
    }

    setStatus("saving");
    setError(null);

    try {
      const command: CreateMealCommand = {
        name: candidate.name,
        calories: candidate.calories,
        protein: candidate.protein,
        fat: candidate.fat,
        carbs: candidate.carbs,
        fiber: candidate.fiber,
        ai_suggestion: candidate.ai_suggestion,
        original_prompt: candidate.original_prompt,
        is_image_analyzed: candidate.is_image_analyzed,
        last_ai_context: candidate.ai_context as CreateMealCommand["last_ai_context"],
        consumed_at: candidate.consumed_at,
      };

      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response, "Nie udało się zapisać posiłku"));
      }

      let favoriteError: string | null = null;
      let savedToFavorites = false;

      if (isFavorite) {
        const favoriteResponse = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: candidate.name,
            calories: candidate.calories,
            protein: candidate.protein,
            fat: candidate.fat,
            carbs: candidate.carbs,
            fiber: candidate.fiber,
          }),
        });

        if (favoriteResponse.ok) {
          savedToFavorites = true;
        } else {
          favoriteError = await parseApiError(favoriteResponse, "Nie udało się dodać posiłku do ulubionych.");
        }
      }

      setStatus("success");

      // Wywołaj callback sukcesu (np. odświeżenie dashboardu)
      if (onSuccess) {
        onSuccess({ savedToFavorites, favoriteError });
      }

      // Reset po krótkim czasie, aby użytkownik widział komunikat sukcesu
      setTimeout(() => {
        reset();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd połączenia");
      setStatus("review");
    }
  }, [candidate, isFavorite, onSuccess, reset]);

  return {
    status,
    inputText,
    selectedImages,
    candidate,
    interactions,
    isFavorite,
    error,
    setInputText,
    setSelectedImages,
    analyze,
    createManualEntry,
    refine,
    updateCandidate,
    setFavorite: setIsFavorite,
    save,
    reset,
  };
}
