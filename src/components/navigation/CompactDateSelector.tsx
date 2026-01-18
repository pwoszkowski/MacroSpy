import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface CompactDateSelectorProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

/**
 * Compact date selector for desktop navigation.
 * Shows only the selected date with a calendar icon.
 */
export function CompactDateSelector({ selectedDate, onSelect }: CompactDateSelectorProps) {
  const formattedDate = format(selectedDate, "d MMM yyyy", { locale: pl });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 min-w-[140px]"
          aria-label={`Wybrana data: ${formattedDate}. Kliknij aby zmienić.`}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm">{formattedDate}</span>
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
  );
}
