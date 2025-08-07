import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { CaseEntry } from "@/types/case";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday 
} from "date-fns";
import CaseCard from "./CaseCard";

interface CalendarViewProps {
  cases: CaseEntry[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const statusColors = {
  summons: "bg-blue-500",
  hearing: "bg-purple-500", 
  judgment: "bg-green-600",
  appeal: "bg-orange-500",
  pending: "bg-status-pending",
  active: "bg-status-active",
  completed: "bg-status-completed",
  urgent: "bg-status-urgent",
  dismissed: "bg-gray-500",
  settled: "bg-emerald-500"
};

const CalendarView = ({ cases, selectedDate, onDateSelect }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get cases for a specific date
  const getCasesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    return cases.filter(caseEntry => {
      const previousDate = new Date(caseEntry.previousDate).toISOString().split('T')[0];
      const nextDate = new Date(caseEntry.nextDate).toISOString().split('T')[0];
      
      return previousDate === dateString || nextDate === dateString;
    });
  };

  const selectedDateCases = getCasesForDate(selectedDate);

  const navigateToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const navigateToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Calendar Grid */}
      <div className="xl:col-span-2">
        <Card className="gradient-card shadow-card border-legal-gray-light/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-serif text-legal-navy flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-legal-gold" />
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToToday}
                  className="border-legal-gold text-legal-gold hover:bg-legal-gold hover:text-white"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToPreviousMonth}
                  className="border-legal-gray-light hover:bg-legal-gold/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToNextMonth}
                  className="border-legal-gray-light hover:bg-legal-gold/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-legal-gray">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarDays.map((day) => {
                const daysCases = getCasesForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onDateSelect(day)}
                    className={`
                      min-h-[80px] p-2 text-left border border-legal-gray-light/30 rounded-lg
                      transition-all duration-200 hover:bg-legal-gold/10
                      ${isSelected ? 'bg-legal-gold/20 border-legal-gold' : ''}
                      ${!isCurrentMonth ? 'opacity-50' : ''}
                      ${isTodayDate ? 'bg-legal-navy/10 border-legal-navy' : ''}
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1 
                      ${isTodayDate ? 'text-legal-navy font-bold' : 'text-foreground'}
                      ${isSelected ? 'text-legal-navy font-bold' : ''}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Case indicators */}
                    <div className="space-y-1">
                      {daysCases.slice(0, 3).map((case_, index) => (
                        <div
                          key={`${case_.id}-${index}`}
                          className={`
                            h-1.5 rounded-full ${statusColors[case_.status]} opacity-80
                          `}
                        />
                      ))}
                      {daysCases.length > 3 && (
                        <div className="text-xs text-legal-gray">
                          +{daysCases.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      <div className="xl:col-span-1">
        <Card className="gradient-card shadow-card border-legal-gray-light/30">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-legal-navy">
              {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
            {isToday(selectedDate) && (
              <Badge className="w-fit bg-legal-navy text-white">Today</Badge>
            )}
          </CardHeader>
          <CardContent>
            {selectedDateCases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-legal-gray">No cases scheduled for this date.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedDateCases.map((caseEntry) => (
                  <CaseCard key={caseEntry.id} caseEntry={caseEntry} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;