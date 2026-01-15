/**
 * Przyciski nawigacji wieloetapowego kreatora
 */

import { Button } from "@/components/ui/button";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isNextDisabled = false,
  isSubmitting = false,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between pt-4 sm:pt-6 border-t mt-6">
      {/* Przycisk Wstecz */}
      {!isFirstStep && (
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          aria-label="Wróć do poprzedniego kroku"
          className="min-w-[80px]"
        >
          Wstecz
        </Button>
      )}

      {/* Spacer dla pierwszego kroku */}
      {isFirstStep && <div />}

      {/* Przycisk Dalej / Rozpocznij */}
      {isLastStep ? (
        <Button
          onClick={onSubmit}
          disabled={isNextDisabled || isSubmitting}
          aria-label="Zapisz cele i rozpocznij korzystanie z aplikacji"
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Zapisywanie...
            </span>
          ) : (
            "Rozpocznij"
          )}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          aria-label={`Przejdź do kroku ${currentStep + 1}`}
          className="min-w-[80px]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Obliczanie...
            </span>
          ) : (
            "Dalej"
          )}
        </Button>
      )}
    </div>
  );
}
