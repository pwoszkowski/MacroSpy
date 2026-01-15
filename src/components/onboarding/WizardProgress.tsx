/**
 * Pasek postępu wieloetapowego kreatora
 */

import { cn } from "@/lib/utils";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ["Dane biometryczne", "Aktywność", "Cele dietetyczne"];

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <nav className="w-full" aria-label="Postęp onboardingu">
      {/* Wizualny pasek postępu */}
      <div className="flex items-center justify-between mb-2" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const stepLabel = STEP_LABELS[step - 1];
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          
          return (
            <div key={step} className="flex items-center flex-1">
              {/* Kółko z numerem kroku */}
              <div
                className={cn(
                  "size-7 sm:size-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300",
                  isCompleted
                    ? "bg-primary text-primary-foreground scale-100"
                    : isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110"
                    : "bg-muted text-muted-foreground"
                )}
                aria-label={`${stepLabel}${isCompleted ? " - ukończony" : isCurrent ? " - aktualny" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <svg
                    className="size-4 sm:size-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>

              {/* Linia łącząca (nie wyświetlaj po ostatnim kroku) */}
              {step < totalSteps && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1.5 sm:mx-2 transition-all duration-300",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Etykieta aktualnego kroku */}
      <div className="text-center mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Krok {currentStep} z {totalSteps}
        </p>
        <p className="font-medium mt-1 text-sm sm:text-base">{STEP_LABELS[currentStep - 1]}</p>
      </div>
    </nav>
  );
}
