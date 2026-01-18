import { MessageCircle } from "lucide-react";

interface AIResponseSummaryProps {
  response: string;
  suggestion?: string | null;
}

/**
 * Dymek z komentarzem AI i sugestią dietetyczną.
 * Wyświetlany w widoku Review jako podsumowanie analizy.
 */
export function AIResponseSummary({ response, suggestion }: AIResponseSummaryProps) {
  return (
    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
      <div className="flex items-start gap-2">
        <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="text-sm leading-relaxed">{response}</p>
          {suggestion && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-3">{suggestion}</p>
          )}
        </div>
      </div>
    </div>
  );
}
