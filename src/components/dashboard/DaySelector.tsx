import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

interface DaySelectorProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

/**
 * Horizontal day selector with last 7 days + calendar popover.
 * Allows quick navigation between recent days and arbitrary date selection.
 */
export function DaySelector({ selectedDate, onSelect }: DaySelectorProps) {
  // Generate last 7 days
  const recentDays = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i));

  return (
    <nav 
      className="flex items-center gap-2 py-2" 
      aria-label="Wybór daty"
    >
      {/* Recent days horizontal scroll */}
      <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide">
        {recentDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Button
              key={day.toISOString()}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className="flex-shrink-0 flex flex-col h-auto py-2 px-2 sm:px-3 min-w-[50px] sm:min-w-[60px]"
              onClick={() => onSelect(day)}
              aria-current={isSelected ? 'date' : undefined}
              aria-label={`${format(day, 'd MMMM', { locale: pl })}${isToday ? ', dzisiaj' : ''}`}
            >
              <span className="text-xs font-normal">
                {format(day, 'EEE', { locale: pl })}
              </span>
              <span className="text-base sm:text-lg font-semibold">
                {format(day, 'd')}
              </span>
              {isToday && (
                <span className="text-[10px] font-normal">Dziś</span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Calendar popover for arbitrary date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="flex-shrink-0"
            aria-label="Wybierz datę z kalendarza"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onSelect(date)}
            locale={pl}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </nav>
  );
}
