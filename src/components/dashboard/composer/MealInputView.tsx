import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon, Camera, Loader2, Sparkles, Edit3, Mic } from "lucide-react";
import { ManualEntryForm } from "./ManualEntryForm";
import { useVoiceInput } from "../../hooks";
import { toast } from "sonner";

type InputMode = "ai" | "manual";

interface ManualEntryData {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

interface MealInputViewProps {
  initialText?: string;
  initialImages?: string[];
  onSubmit: (text: string, images: string[]) => void;
  onManualSubmit: (data: ManualEntryData) => void;
  isSubmitting: boolean;
}

const MAX_IMAGES = 5;
const MIN_TEXT_LENGTH = 2;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function MealInputView({
  initialText = "",
  initialImages = [],
  onSubmit,
  onManualSubmit,
  isSubmitting,
}: MealInputViewProps) {
  const [mode, setMode] = useState<InputMode>("ai");
  const [text, setText] = useState(initialText);
  const [images, setImages] = useState<string[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Voice input hook
  const {
    isListening,
    isSupported: voiceSupported,
    error: voiceError,
    startListening,
    stopListening,
  } = useVoiceInput();

  // Show voice errors as toast
  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Usuń prefix "data:image/...;base64," aby zostać tylko z base64
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    // Sprawdź limit
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć`);
      return;
    }

    // Walidacja typów plików
    const invalidFiles = Array.from(files).filter((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type));

    if (invalidFiles.length > 0) {
      setError("Obsługiwane formaty: JPG, PNG, WEBP");
      return;
    }

    try {
      const base64Promises = Array.from(files).map((file) => convertToBase64(file));
      const base64Images = await Promise.all(base64Promises);
      setImages((prev) => [...prev, ...base64Images]);
    } catch {
      setError("Błąd podczas wczytywania zdjęć");
    }

    // Reset input
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);

    // Walidacja
    const hasValidText = text.trim().length >= MIN_TEXT_LENGTH;
    const hasImages = images.length > 0;

    if (!hasValidText && !hasImages) {
      setError(`Wprowadź opis (min. ${MIN_TEXT_LENGTH} znaki) lub dodaj zdjęcie`);
      return;
    }

    onSubmit(text.trim(), images);
  };

  const canSubmit = (text.trim().length >= MIN_TEXT_LENGTH || images.length > 0) && !isSubmitting;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          type="button"
          variant={mode === "ai" ? "default" : "ghost"}
          onClick={() => setMode("ai")}
          className="flex-1"
          disabled={isSubmitting}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Analiza AI
        </Button>
        <Button
          type="button"
          variant={mode === "manual" ? "default" : "ghost"}
          onClick={() => setMode("manual")}
          className="flex-1"
          disabled={isSubmitting}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Ręczne dodanie
        </Button>
      </div>

      {/* AI Mode */}
      {mode === "ai" ? (
        <>
          {/* Textarea with voice button */}
          <div className="space-y-2">
            <Label htmlFor="meal-description">Opisz swój posiłek</Label>
            <div className="flex gap-2">
              <Textarea
                id="meal-description"
                placeholder="np. Jajecznica z dwóch jajek, pomidor, chleb..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="resize-none flex-1"
                data-test-id="meal-description-input"
              />
              {voiceSupported && (
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={isListening ? stopListening : () => startListening(setText)}
                  disabled={isSubmitting}
                  className={`h-10 w-10 ${isListening ? "animate-pulse" : ""}`}
                  title={isListening ? "Zatrzymaj nagrywanie" : "Nagraj głosem"}
                  aria-label={isListening ? "Zatrzymaj nagrywanie głosu" : "Rozpocznij nagrywanie głosu"}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Możesz też dodać zdjęcia, aby AI mogło lepiej oszacować wartości odżywcze
              {voiceSupported && ", lub nagrać opis głosem"}
            </p>
          </div>

          {/* Galeria miniatur */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                  <img
                    src={`data:image/jpeg;base64,${img}`}
                    alt={`Zdjęcie ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isSubmitting}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors disabled:opacity-50"
                    aria-label="Usuń zdjęcie"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Przyciski dodawania zdjęć */}
          <div className="flex gap-2">
            {isMobile ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={images.length >= MAX_IMAGES || isSubmitting}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Aparat
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={images.length >= MAX_IMAGES || isSubmitting}
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Galeria
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => galleryInputRef.current?.click()}
                disabled={images.length >= MAX_IMAGES || isSubmitting}
                className="flex-1"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Dodaj zdjęcie
              </Button>
            )}

            <input
              ref={galleryInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              onChange={handleImageSelect}
              className="hidden"
              aria-label="Wybierz zdjęcia z galerii"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
              aria-label="Zrób zdjęcie aparatem"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Dodano zdjęcia: {images.length}/{MAX_IMAGES}
          </p>

          {/* Błędy */}
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          {/* Przycisk Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
            size="lg"
            data-test-id="analyze-meal-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analizuję...
              </>
            ) : (
              "Analizuj posiłek"
            )}
          </Button>
        </>
      ) : (
        /* Manual Mode */
        <ManualEntryForm onSubmit={onManualSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
