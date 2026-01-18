import { useState, useEffect, useRef } from "react";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: (onResult?: (transcript: string) => void) => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

/**
 * Custom hook for voice input using Web Speech API
 * Supports speech recognition with Polish language
 */
export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultCallbackRef = useRef<((transcript: string) => void) | undefined>(undefined);

  // Check if Web Speech API is supported
  const isSupported =
    typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    // Only initialize if we're in browser environment and API is supported
    if (typeof window === "undefined" || !isSupported) {
      if (typeof window !== "undefined") {
        setError("Twoja przeglądarka nie obsługuje rozpoznawania głosu");
      }
      return;
    }

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configuration
    recognition.lang = "pl-PL"; // Polish language
    recognition.continuous = false; // Single utterance
    recognition.interimResults = true; // Enable interim results for real-time feedback
    recognition.maxAlternatives = 1;

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      try {
        // Build complete transcript from all available results
        let completeTranscript = "";
        for (const result of Array.from(event.results)) {
          if (result[0]) {
            completeTranscript += result[0].transcript + " ";
          }
        }
        completeTranscript = completeTranscript.trim();

        // Call the callback with current transcript (real-time feedback)
        if (onResultCallbackRef.current) {
          onResultCallbackRef.current(completeTranscript);
        }
      } catch {
        setError("Błąd przetwarzania wyniku rozpoznawania mowy");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      setError(`Błąd rozpoznawania głosu: ${event.error}`);

      // Handle specific error types
      switch (event.error) {
        case "not-allowed":
          setError("Brak dostępu do mikrofonu. Sprawdź uprawnienia przeglądarki.");
          break;
        case "no-speech":
          setError("Nie wykryto mowy. Spróbuj ponownie.");
          break;
        case "network":
          setError("Problem z połączeniem. Sprawdź połączenie internetowe.");
          break;
        case "service-not-allowed":
          setError("Usługa rozpoznawania głosu nie jest dostępna.");
          break;
        default:
          setError(`Błąd rozpoznawania głosu: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported]);

  const startListening = (onResult?: (transcript: string) => void) => {
    if (!recognitionRef.current) return;

    try {
      setError(null);
      onResultCallbackRef.current = onResult;
      recognitionRef.current.start();
    } catch {
      setError("Nie można uruchomić rozpoznawania głosu");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setError(null);
  };

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    clearTranscript,
  };
}
