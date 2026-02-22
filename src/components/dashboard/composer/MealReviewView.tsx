import { Button } from "@/components/ui/button";
import { AIResponseSummary } from "./AIResponseSummary";
import { MacroEditableStats } from "./MacroEditableStats";
import { RefineInputBar } from "./RefineInputBar";
import { InteractionHistory } from "./InteractionHistory";
import type { MealCandidateViewModel, InteractionLog } from "./types";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MealReviewViewProps {
  candidate: MealCandidateViewModel;
  interactions: InteractionLog[];
  onRefine: (prompt: string) => Promise<void>;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onManualChange: (field: keyof MealCandidateViewModel, value: number | string) => void;
  onFavoriteChange: (checked: boolean) => void;
  isFavorite: boolean;
  isRefining: boolean;
  isSaving: boolean;
  showConsumedAtInput?: boolean;
}

const toDateTimeLocalValue = (isoDate: string): string => {
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

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
  onFavoriteChange,
  isFavorite,
  isRefining,
  isSaving,
  showConsumedAtInput = false,
}: MealReviewViewProps) {
  const isProcessing = isRefining || isSaving;
  const isManualEntry = !candidate.assistant_response && !candidate.ai_context;

  return (
    <div className="flex flex-col gap-4 p-4" data-test-id="meal-review-view">
      {/* Dymek AI - tylko dla wpisów z AI */}
      {candidate.assistant_response && (
        <AIResponseSummary response={candidate.assistant_response} suggestion={candidate.ai_suggestion} />
      )}

      {/* Informacja o ręcznym wpisie */}
      {isManualEntry && (
        <div className="rounded-lg bg-muted/50 border border-border p-3">
          <p className="text-sm text-muted-foreground">Posiłek dodany ręcznie. Sprawdź wartości przed zapisem.</p>
        </div>
      )}

      {/* Edytowalne pola makro */}
      <MacroEditableStats candidate={candidate} onChange={onManualChange} disabled={isProcessing} />

      {showConsumedAtInput && (
        <div className="space-y-2">
          <Label htmlFor="review-consumed-at">Data i godzina spożycia</Label>
          <Input
            id="review-consumed-at"
            type="datetime-local"
            value={toDateTimeLocalValue(candidate.consumed_at)}
            onChange={(event) => {
              const nextDate = new Date(event.target.value);
              if (Number.isNaN(nextDate.getTime())) {
                return;
              }
              onManualChange("consumed_at", nextDate.toISOString());
            }}
            disabled={isProcessing}
          />
        </div>
      )}

      <label className="flex items-center gap-2 rounded-md border p-3">
        <input
          type="checkbox"
          checked={isFavorite}
          onChange={(event) => onFavoriteChange(event.target.checked)}
          disabled={isProcessing}
          className="h-4 w-4 accent-primary"
        />
        <span className="text-sm">Zapisz jako ulubiony</span>
      </label>

      {/* Historia interakcji (tylko dla AI i jeśli są korekty) */}
      {!isManualEntry && interactions.length > 2 && <InteractionHistory interactions={interactions} />}

      {/* Pasek korekty AI - tylko dla wpisów z AI */}
      {!isManualEntry && <RefineInputBar onRefine={onRefine} isRefining={isRefining} />}

      {/* Przyciski akcji */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing} className="flex-1">
          Anuluj
        </Button>
        <Button
          onClick={onSave}
          disabled={isProcessing || !candidate.name.trim()}
          className="flex-1"
          data-test-id="save-meal-button"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Zapisuję...
            </>
          ) : (
            "Zapisz posiłek"
          )}
        </Button>
      </div>
    </div>
  );
}
