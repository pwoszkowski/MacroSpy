import { Button } from '@/components/ui/button';
import { AIResponseSummary } from './AIResponseSummary';
import { MacroEditableStats } from './MacroEditableStats';
import { RefineInputBar } from './RefineInputBar';
import { InteractionHistory } from './InteractionHistory';
import type { MealCandidateViewModel, InteractionLog } from './types';
import { Loader2 } from 'lucide-react';

interface MealReviewViewProps {
  candidate: MealCandidateViewModel;
  interactions: InteractionLog[];
  onRefine: (prompt: string) => Promise<void>;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onManualChange: (field: keyof MealCandidateViewModel, value: any) => void;
  isRefining: boolean;
  isSaving: boolean;
}

/**
 * Ekran weryfikacji i edycji posiłku po analizie AI.
 * Pozwala na ręczną edycję, korektę przez AI oraz zapis.
 */
export function MealReviewView({
  candidate,
  interactions,
  onRefine,
  onSave,
  onCancel,
  onManualChange,
  isRefining,
  isSaving,
}: MealReviewViewProps) {
  const isProcessing = isRefining || isSaving;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Dymek AI */}
      {candidate.assistant_response && (
        <AIResponseSummary
          response={candidate.assistant_response}
          suggestion={candidate.ai_suggestion}
        />
      )}

      {/* Edytowalne pola makro */}
      <MacroEditableStats
        candidate={candidate}
        onChange={onManualChange}
        disabled={isProcessing}
      />

      {/* Historia interakcji (tylko jeśli są korekty) */}
      {interactions.length > 2 && (
        <InteractionHistory interactions={interactions} />
      )}

      {/* Pasek korekty AI */}
      <RefineInputBar onRefine={onRefine} isRefining={isRefining} />

      {/* Przyciski akcji */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Anuluj
        </Button>
        <Button
          onClick={onSave}
          disabled={isProcessing || !candidate.name.trim()}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Zapisuję...
            </>
          ) : (
            'Zapisz posiłek'
          )}
        </Button>
      </div>
    </div>
  );
}
