import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Mic } from "lucide-react";
import { useVoiceInput } from "../../hooks";
import { toast } from "sonner";

interface RefineInputBarProps {
  onRefine: (prompt: string) => Promise<void>;
  isRefining: boolean;
}

/**
 * Pasek do wprowadzania komend korekcyjnych dla AI.
 * Znajduje się na dole widoku Review.
 */
export function RefineInputBar({ onRefine, isRefining }: RefineInputBarProps) {
  const [prompt, setPrompt] = useState("");

  // Voice input hook
  const {
    isListening,
    isSupported: voiceSupported,
    error: voiceError,
    startListening,
    stopListening,
  } = useVoiceInput();

  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isRefining) return;

    await onRefine(prompt.trim());
    setPrompt(""); // Wyczyść po wysłaniu
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Możesz poprosić AI o korektę, np. "zmień masło na olej" lub "dodaj więcej białka"
      </p>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Wpisz korektę..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRefining}
          className="flex-1"
        />
        {voiceSupported && (
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={isListening ? stopListening : () => startListening(setPrompt)}
            disabled={isRefining}
            className={isListening ? "animate-pulse" : ""}
            title={isListening ? "Zatrzymaj nagrywanie" : "Nagraj głosem"}
            aria-label={isListening ? "Zatrzymaj nagrywanie głosu" : "Rozpocznij nagrywanie głosu"}
          >
            <Mic className="w-4 h-4" />
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!prompt.trim() || isRefining} size="icon">
          {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
