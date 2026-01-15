import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

/**
 * Simple header showing today's date.
 * Non-interactive, provides context that user is viewing today's data.
 */
export function TodayHeader() {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, d MMMM yyyy', { locale: pl });

  return (
    <div className="sticky top-14 md:top-16 z-30 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="capitalize font-medium">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
