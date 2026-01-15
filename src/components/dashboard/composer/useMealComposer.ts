import { useState, useCallback } from "react";
import type { ComposerStatus, MealCandidateViewModel, InteractionLog } from "./types";
import type { AnalyzeMealResponse, CreateMealCommand } from "@/types";

export interface ManualEntryData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

interface UseMealComposerReturn {
  status: ComposerStatus;
  inputText: string;
  selectedImages: string[];
  candidate: MealCandidateViewModel | null;
  interactions: InteractionLog[];
  error: string | null;
  setInputText: (text: string) => void;
  setSelectedImages: (images: string[]) => void;
  analyze: (text: string, images: string[]) => Promise<void>;
  createManualEntry: (data: ManualEntryData) => void;
  refine: (prompt: string) => Promise<void>;
  updateCandidate: (field: keyof MealCandidateViewModel, value: any) => void;
  save: () => Promise<void>;
  reset: () => void;
}

export function useMealComposer(onSuccess?: () => void): UseMealComposerReturn {
  const [status, setStatus] = useState<ComposerStatus>("idle");
  const [inputText, setInputText] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [candidate, setCandidate] = useState<MealCandidateViewModel | null>(null);
  const [interactions, setInteractions] = useState<InteractionLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createManualEntry = useCallback((data: ManualEntryData) => {
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
      consumed_at: new Date().toISOString(),
    };

    setCandidate(newCandidate);
    setStatus("review");
  }, []);

  const analyze = useCallback(async (text: string, images: string[]) => {
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
        consumed_at: new Date().toISOString(),
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
  }, []);

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
    (field: keyof MealCandidateViewModel, value: any) => {
      if (!candidate) return;

      setCandidate({
        ...candidate,
        [field]: value,
      });
    },
    [candidate]
  );

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
        last_ai_context: candidate.ai_context,
        consumed_at: candidate.consumed_at,
      };

      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zapisać posiłku");
      }

      setStatus("success");

      // Wywołaj callback sukcesu (np. odświeżenie dashboardu)
      if (onSuccess) {
        onSuccess();
      }

      // Reset po krótkim czasie, aby użytkownik widział komunikat sukcesu
      setTimeout(() => {
        reset();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd połączenia");
      setStatus("review");
    }
  }, [candidate, onSuccess]);

  const reset = useCallback(() => {
    setStatus("idle");
    setInputText("");
    setSelectedImages([]);
    setCandidate(null);
    setInteractions([]);
    setError(null);
  }, []);

  return {
    status,
    inputText,
    selectedImages,
    candidate,
    interactions,
    error,
    setInputText,
    setSelectedImages,
    analyze,
    createManualEntry,
    refine,
    updateCandidate,
    save,
    reset,
  };
}
