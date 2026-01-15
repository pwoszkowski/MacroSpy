import { DaySelector } from './DaySelector';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface DateHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

/**
 * Sticky header displaying current date and day selector.
 * Remains visible when scrolling through the page.
 */
export function DateHeader({ selectedDate, onDateChange }: DateHeaderProps) {
  const formattedDate = format(selectedDate, 'd MMMM yyyy', { locale: pl });

  return (
    <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <h1 
          className="text-lg sm:text-xl font-bold mb-3 capitalize"
          id="current-date"
        >
          {formattedDate}
        </h1>
        <DaySelector selectedDate={selectedDate} onSelect={onDateChange} />
      </div>
    </header>
  );
}
