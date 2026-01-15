import type { InteractionLog } from './types';
import { User, Bot } from 'lucide-react';

interface InteractionHistoryProps {
  interactions: InteractionLog[];
}

/**
 * Historia interakcji użytkownik-asystent w sekcji Refine.
 * Wyświetla dialog w formie czatu.
 */
export function InteractionHistory({ interactions }: InteractionHistoryProps) {
  if (interactions.length <= 2) {
    // Nie pokazuj historii, jeśli to tylko początkowa wymiana (user + assistant)
    return null;
  }

  // Pomiń pierwsze 2 interakcje (początkowa analiza)
  const refinementInteractions = interactions.slice(2);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Historia korekt</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {refinementInteractions.map((interaction) => (
          <div
            key={interaction.id}
            className={`flex gap-2 ${
              interaction.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {interaction.role === 'assistant' && (
              <Bot className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            )}
            <div
              className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                interaction.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {interaction.content}
            </div>
            {interaction.role === 'user' && (
              <User className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
