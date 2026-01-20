/**
 * Główny komponent wieloetapowego kreatora Onboarding
 * Orkiestruje przepływ między krokami, zarządza stanem i komunikacją z API
 */

import { useReducer, useEffect } from "react";
import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { OnboardingTopBar } from "./OnboardingTopBar";
import { StepBioData } from "./StepBioData";
import { StepActivity } from "./StepActivity";
import { StepGoalRefinement } from "./StepGoalRefinement";
import {
  type OnboardingState,
  type OnboardingAction,
  type BioData,
  type ActivityLevel,
  calculateAge,
} from "@/types/onboarding";
import type { GoalTargets, TDEECalculationRequest } from "@/types";

const TOTAL_STEPS = 3;

/**
 * Stan początkowy kreatora
 */
const initialState: OnboardingState = {
  step: 1,
  bioData: {
    gender: "male",
    birthDate: "",
    height: 0,
    weight: 0,
  },
  activityLevel: null,
  calculationResult: null,
  finalGoals: {
    calories: 2000,
    protein: 150,
    fat: 65,
    carbs: 200,
    fiber: 30,
  },
  isSubmitting: false,
  error: null,
};

/**
 * Reducer zarządzający stanem Onboarding
 */
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload, error: null };

    case "UPDATE_BIO_DATA":
      return {
        ...state,
        bioData: { ...state.bioData, ...action.payload },
      };

    case "SET_ACTIVITY_LEVEL":
      return { ...state, activityLevel: action.payload };

    case "SET_CALCULATION_RESULT":
      return {
        ...state,
        calculationResult: action.payload,
        finalGoals: action.payload.suggested_targets,
      };

    case "UPDATE_GOALS":
      return {
        ...state,
        finalGoals: { ...state.finalGoals, ...action.payload },
      };

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

interface OnboardingWizardProps {
  redirectUrl?: string;
  user?: {
    id: string;
    email: string;
  } | null;
}

export function OnboardingWizard({ redirectUrl = "/", user }: OnboardingWizardProps) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  /**
   * Waliduje dane biometryczne przed przejściem do kroku 2
   */
  const validateBioData = (): boolean => {
    const { gender, birthDate, height, weight } = state.bioData;

    if (!gender || !birthDate || !height || !weight) {
      dispatch({ type: "SET_ERROR", payload: "Wypełnij wszystkie pola" });
      return false;
    }

    const age = calculateAge(birthDate);
    if (age < 13 || age > 120) {
      dispatch({
        type: "SET_ERROR",
        payload: "Wiek musi być między 13 a 120 lat",
      });
      return false;
    }

    if (height < 100 || height > 300) {
      dispatch({
        type: "SET_ERROR",
        payload: "Wzrost musi być między 100 a 300 cm",
      });
      return false;
    }

    if (weight < 20 || weight > 500) {
      dispatch({
        type: "SET_ERROR",
        payload: "Waga musi być między 20 a 500 kg",
      });
      return false;
    }

    return true;
  };

  /**
   * Waliduje wybór poziomu aktywności przed przejściem do kroku 3
   */
  const validateActivityLevel = (): boolean => {
    if (!state.activityLevel) {
      dispatch({
        type: "SET_ERROR",
        payload: "Wybierz poziom aktywności",
      });
      return false;
    }

    return true;
  };

  /**
   * Wywołuje API kalkulacji TDEE
   */
  const calculateTDEE = async (): Promise<boolean> => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const age = calculateAge(state.bioData.birthDate);
      if (!state.activityLevel) {
        throw new Error("Activity level is required");
      }
      const request: TDEECalculationRequest = {
        gender: state.bioData.gender,
        weight_kg: state.bioData.weight,
        height_cm: state.bioData.height,
        age,
        activity_level: state.activityLevel,
      };

      const response = await fetch("/api/ai/calculate-tdee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Błąd kalkulacji TDEE");
      }

      const result = await response.json();
      dispatch({ type: "SET_CALCULATION_RESULT", payload: result });
      return true;
    } catch (error) {
      console.error("TDEE calculation error:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Nie udało się obliczyć zapotrzebowania. Spróbuj ponownie.",
      });
      return false;
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  /**
   * Obsługa przycisku "Dalej"
   */
  const handleNext = async () => {
    // Walidacja bieżącego kroku
    if (state.step === 1 && !validateBioData()) {
      return;
    }

    if (state.step === 2) {
      if (!validateActivityLevel()) {
        return;
      }
      // Wywołaj kalkulację TDEE przed przejściem do kroku 3
      const success = await calculateTDEE();
      if (!success) {
        return;
      }
    }

    // Przejdź do następnego kroku
    dispatch({ type: "SET_STEP", payload: state.step + 1 });
  };

  /**
   * Obsługa przycisku "Wstecz"
   */
  const handleBack = () => {
    if (state.step > 1) {
      dispatch({ type: "SET_STEP", payload: state.step - 1 });
    }
  };

  /**
   * Zapisuje profil, cele i pomiar wagi
   */
  const handleSubmit = async () => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      // 1. Aktualizacja profilu
      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: state.bioData.height,
          gender: state.bioData.gender,
          birth_date: state.bioData.birthDate,
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || "Nie udało się zapisać profilu");
      }

      // 2. Utworzenie celu dietetycznego
      const today = new Date().toISOString().split("T")[0];
      const goalsResponse = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: today,
          calories_target: Math.round(state.finalGoals.calories),
          protein_target: Math.round(state.finalGoals.protein),
          fat_target: Math.round(state.finalGoals.fat),
          carbs_target: Math.round(state.finalGoals.carbs),
          fiber_target: Math.round(state.finalGoals.fiber),
        }),
      });

      if (!goalsResponse.ok) {
        const errorData = await goalsResponse.json();
        throw new Error(errorData.message || "Nie udało się zapisać celów");
      }

      // 3. Zapis wagi początkowej
      const measurementResponse = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          weight: state.bioData.weight,
        }),
      });

      if (!measurementResponse.ok) {
        const errorData = await measurementResponse.json();
        throw new Error(errorData.message || "Nie udało się zapisać pomiaru wagi");
      }

      // Sukces - przekieruj na dashboard (bez ostrzeżenia przeglądarki)
      console.log("All API calls successful, redirecting to:", redirectUrl);
      window.location.replace(redirectUrl);
    } catch (error) {
      console.error("Submit error:", error);

      // Szczegółowe logowanie błędów API
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }

      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Nie udało się zapisać danych. Spróbuj ponownie.",
      });
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  /**
   * Ostrzeżenie przed opuszczeniem strony (tylko podczas onboardingu)
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.step > 1 && state.step < 3) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.step]);

  /**
   * Sprawdź czy przycisk "Dalej" powinien być wyłączony
   */
  const isNextDisabled = () => {
    if (state.step === 1) {
      return !state.bioData.gender || !state.bioData.birthDate || !state.bioData.height || !state.bioData.weight;
    }
    if (state.step === 2) {
      return !state.activityLevel;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar z logo i menu profilu */}
      <OnboardingTopBar user={user} />

      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-6 sm:mb-8">
            <WizardProgress currentStep={state.step} totalSteps={TOTAL_STEPS} />
          </div>

          <div className="bg-card rounded-lg shadow-lg border p-4 sm:p-6 md:p-8">
            {/* Renderowanie kroków z animacją */}
            <div className="min-h-[400px] sm:min-h-[500px]">
              {state.step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <StepBioData
                    data={state.bioData}
                    onUpdate={(data: Partial<BioData>) => dispatch({ type: "UPDATE_BIO_DATA", payload: data })}
                  />
                </div>
              )}

              {state.step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <StepActivity
                    value={state.activityLevel}
                    onChange={(level: ActivityLevel) => dispatch({ type: "SET_ACTIVITY_LEVEL", payload: level })}
                    error={state.error || undefined}
                  />
                </div>
              )}

              {state.step === 3 && state.calculationResult && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <StepGoalRefinement
                    tdeeResult={state.calculationResult}
                    goals={state.finalGoals}
                    onUpdate={(goals: Partial<GoalTargets>) => dispatch({ type: "UPDATE_GOALS", payload: goals })}
                    error={state.error || undefined}
                  />
                </div>
              )}

              {/* Loading state podczas kalkulacji TDEE */}
              {state.step === 3 && !state.calculationResult && state.isSubmitting && (
                <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-20">
                  <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-lg font-medium">Obliczam Twoje zapotrzebowanie...</p>
                  <p className="text-sm text-muted-foreground mt-2">To może potrwać chwilę</p>
                </div>
              )}
            </div>

            {/* Komunikat błędu globalny */}
            {state.error && state.step !== 2 && state.step !== 3 && (
              <div className="mt-4 p-4 rounded-md bg-destructive/10 border border-destructive animate-in fade-in duration-200">
                <p className="text-sm text-destructive">{state.error}</p>
              </div>
            )}

            {/* Nawigacja */}
            <WizardNavigation
              currentStep={state.step}
              totalSteps={TOTAL_STEPS}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isNextDisabled={isNextDisabled()}
              isSubmitting={state.isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
