import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateNavigator = ({ selectedDate, onDateChange }: DateNavigatorProps) => {
  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center gap-4 p-6 bg-white/50 rounded-xl border border-legal-gray-light/30">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousDay}
        className="border-legal-gray-light hover:bg-legal-gold/10"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "min-w-[200px] justify-start text-left font-medium border-legal-gray-light",
                "hover:bg-legal-gold/10"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="border-legal-gold text-legal-gold hover:bg-legal-gold hover:text-white"
        >
          Today
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNextDay}
        className="border-legal-gray-light hover:bg-legal-gold/10"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default DateNavigator;