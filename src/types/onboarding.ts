/**
 * Typy specyficzne dla widoku Onboarding
 * Reprezentują stan wewnętrzny wieloetapowego kreatora konfiguracji konta
 */

import type { TDEECalculationResponse, GoalTargets } from "../types";

/**
 * Typ reprezentujący płeć użytkownika
 */
export type Gender = "male" | "female";

/**
 * Poziomy aktywności fizycznej używane do kalkulacji TDEE
 * Mapowane na wartości akceptowane przez API
 */
export type ActivityLevel = "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active";

/**
 * Etykiety i opisy poziomów aktywności dla UI
 */
export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, { label: string; description: string }> = {
  sedentary: {
    label: "Siedzący tryb życia",
    description: "Brak lub bardzo mało ćwiczeń",
  },
  lightly_active: {
    label: "Lekka aktywność",
    description: "Lekkie ćwiczenia 1-3 dni w tygodniu",
  },
  moderately_active: {
    label: "Umiarkowana aktywność",
    description: "Umiarkowane ćwiczenia 3-5 dni w tygodniu",
  },
  very_active: {
    label: "Bardzo aktywny",
    description: "Intensywne ćwiczenia 6-7 dni w tygodniu",
  },
  extremely_active: {
    label: "Ekstremalnie aktywny",
    description: "Bardzo intensywne ćwiczenia, praca fizyczna lub trening 2x dziennie",
  },
};

/**
 * Dane biometryczne użytkownika zbierane w Kroku 1
 */
export interface BioData {
  gender: Gender;
  /** Data urodzenia w formacie YYYY-MM-DD */
  birthDate: string;
  /** Wzrost w centymetrach */
  height: number;
  /** Waga w kilogramach - używana do kalkulacji TDEE */
  weight: number;
}

/**
 * Stan globalny wieloetapowego kreatora Onboarding
 */
export interface OnboardingState {
  /** Aktualny krok (1-3) */
  step: number;
  /** Dane biometryczne z Kroku 1 */
  bioData: BioData;
  /** Poziom aktywności wybrany w Kroku 2 */
  activityLevel: ActivityLevel | null;
  /** Wynik kalkulacji TDEE z API (dostępny po Kroku 2) */
  calculationResult: TDEECalculationResponse | null;
  /** Ostateczne cele dietetyczne (edytowalne w Kroku 3) */
  finalGoals: GoalTargets;
  /** Flaga wskazująca trwający proces zapisywania */
  isSubmitting: boolean;
  /** Komunikat błędu (jeśli wystąpił) */
  error: string | null;
}

/**
 * Akcje modyfikujące stan Onboarding (dla useReducer)
 */
export type OnboardingAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_BIO_DATA"; payload: Partial<BioData> }
  | { type: "SET_ACTIVITY_LEVEL"; payload: ActivityLevel }
  | { type: "SET_CALCULATION_RESULT"; payload: TDEECalculationResponse }
  | { type: "UPDATE_GOALS"; payload: Partial<GoalTargets> }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

/**
 * Wylicza wiek na podstawie daty urodzenia
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Konwertuje procent makroskładnika na gramy
 * @param percentage - Procent (0-100)
 * @param totalCalories - Całkowita pula kalorii
 * @param caloriesPerGram - Kalorie na gram (4 dla B/W, 9 dla T)
 */
export function percentToGrams(percentage: number, totalCalories: number, caloriesPerGram: number): number {
  return Math.round(((percentage / 100) * totalCalories) / caloriesPerGram);
}

/**
 * Konwertuje gramy makroskładnika na procent
 * @param grams - Ilość gramów
 * @param caloriesPerGram - Kalorie na gram (4 dla B/W, 9 dla T)
 * @param totalCalories - Całkowita pula kalorii
 */
export function gramsToPercent(grams: number, caloriesPerGram: number, totalCalories: number): number {
  return Math.round((grams * caloriesPerGram * 100) / totalCalories);
}
