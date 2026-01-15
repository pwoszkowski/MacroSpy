import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pl } from "date-fns/locale";

interface HistoryCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

/**
 * Calendar component for selecting date to view meal history.
 * Uses shadcn/ui Calendar with Polish locale.
 */
export function HistoryCalendar({ selectedDate, onSelectDate }: HistoryCalendarProps) {
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onSelectDate(date);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wybierz dzień</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          locale={pl}
          disabled={(date) => date > new Date()}
          className="rounded-md"
        />
      </CardContent>
    </Card>
  );
}
