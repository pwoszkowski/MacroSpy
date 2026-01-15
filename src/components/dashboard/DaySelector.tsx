import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, addDays, isSameDay, startOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface DaySelectorProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

/**
 * Horizontal day selector showing days around selected date + calendar popover.
 * First tile is always today, then shows 2 days after, selected, and 2 days before.
 */
export function DaySelector({ selectedDate, onSelect }: DaySelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const today = startOfDay(new Date());
  const selected = startOfDay(selectedDate);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onSelect(date);
      setIsCalendarOpen(false);
    }
  };

  // Generate days: always start with today, then show days in descending order
  const generateDays = () => {
    const days: Date[] = [today];
    const daysSet = new Set([today.getTime()]);

    // If selected date is not today, add days around it
    if (!isSameDay(selected, today)) {
      const daysToAdd: Date[] = [];

      // Add 2 days after selected date (but not beyond today)
      for (let i = 2; i >= 1; i--) {
        const day = addDays(selected, i);
        if (day < today && !daysSet.has(day.getTime())) {
          daysToAdd.push(day);
        }
      }

      // Add selected date
      if (!daysSet.has(selected.getTime())) {
        daysToAdd.push(selected);
      }

      // Add 2 days before selected date
      for (let i = 1; i <= 2; i++) {
        const day = subDays(selected, i);
        if (!daysSet.has(day.getTime())) {
          daysToAdd.push(day);
        }
      }

      // Sort in descending order (newest first) and add to days
      daysToAdd.sort((a, b) => b.getTime() - a.getTime());
      days.push(...daysToAdd);
    } else {
      // If today is selected, show last 5 days in descending order
      for (let i = 1; i <= 5; i++) {
        const day = subDays(today, i);
        days.push(day);
      }
    }

    return days.slice(0, 6); // Max 6 days
  };

  const recentDays = generateDays();

  return (
    <nav className="flex items-center gap-2 py-2" aria-label="Wybór daty">
      {/* Recent days horizontal scroll */}
      <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide">
        {recentDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <Button
              key={day.toISOString()}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0 flex flex-col h-auto py-2 px-2 sm:px-3 min-w-[60px] sm:min-w-[70px]"
              onClick={() => onSelect(day)}
              aria-current={isSelected ? "date" : undefined}
              aria-label={`${format(day, "d MMMM yyyy", { locale: pl })}${isToday ? ", dzisiaj" : ""}`}
            >
              <span className="text-[10px] font-normal opacity-70">{format(day, "MMM yy", { locale: pl })}</span>
              <span className="text-xs font-normal">{format(day, "EEE", { locale: pl })}</span>
              <span className="text-base sm:text-lg font-semibold">{format(day, "d")}</span>
              {isToday && <span className="text-[10px] font-normal">Dziś</span>}
            </Button>
          );
        })}
      </div>

      {/* Calendar popover for arbitrary date */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="flex-shrink-0" aria-label="Wybierz datę z kalendarza">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            locale={pl}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </nav>
  );
}
