// Stan procesu dodawania posiłku
export type ComposerStatus = "idle" | "analyzing" | "refining" | "review" | "saving" | "success";

// Model widoku dla edytowanego posiłku
export interface MealCandidateViewModel {
  name: string;
  calories: number; // float
  protein: number; // float
  fat: number; // float
  carbs: number; // float
  fiber: number; // float
  ai_suggestion: string | null;
  assistant_response: string | null; // Ostatnia odpowiedź AI
  ai_context: unknown; // Blob JSON potrzebny do endpointu refine
  original_prompt: string;
  is_image_analyzed: boolean;
  consumed_at: string; // ISO Date
}

// Historia interakcji (do wyświetlenia w sekcji Refine)
export interface InteractionLog {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Dane z ręcznego wprowadzenia
export interface ManualEntryData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}
