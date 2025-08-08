import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseEntry, CaseStatus } from "@/types/case";
import { useToast } from "@/hooks/use-toast";

interface CaseFormProps {
  onSubmit: (caseEntry: Omit<CaseEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const CaseForm = ({ onSubmit }: CaseFormProps) => {
  const [previousDate, setPreviousDate] = useState<Date>();
  const [nextDate, setNextDate] = useState<Date>();
  const [caseDetails, setCaseDetails] = useState("");
  const [status, setStatus] = useState<CaseStatus>("pending");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!previousDate || !nextDate || !caseDetails.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      previousDate: previousDate.toISOString(),
      nextDate: nextDate.toISOString(),
      caseDetails: caseDetails.trim(),
      status
    });

    // Reset form
    setPreviousDate(undefined);
    setNextDate(undefined);
    setCaseDetails("");
    setStatus("pending");

    toast({
      title: "Case Added",
      description: "Case entry has been successfully added to the diary.",
    });
  };

  return (
    <Card className="gradient-card shadow-card border-legal-gray-light/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg md:text-xl font-serif text-legal-navy flex items-center gap-2">
          <Plus className="w-4 h-4 md:w-5 md:h-5 text-legal-gold" />
          Add New Case Entry
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 md:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="previousDate" className="text-sm font-medium text-legal-navy">
                Previous Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-legal-gray-light",
                      !previousDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {previousDate ? format(previousDate, "PPP") : "Select previous date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={previousDate}
                    onSelect={setPreviousDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextDate" className="text-sm font-medium text-legal-navy">
                Next Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-legal-gray-light",
                      !nextDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextDate ? format(nextDate, "PPP") : "Select next date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={nextDate}
                    onSelect={setNextDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-legal-navy">
              Case Status
            </Label>
            <Select value={status} onValueChange={(value: CaseStatus) => setStatus(value)}>
              <SelectTrigger className="border-legal-gray-light">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summons">Summons</SelectItem>
                <SelectItem value="hearing">Hearing</SelectItem>
                <SelectItem value="judgment">Judgment</SelectItem>
                <SelectItem value="appeal">Appeal</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseDetails" className="text-sm font-medium text-legal-navy">
              Case Details *
            </Label>
            <Textarea
              id="caseDetails"
              value={caseDetails}
              onChange={(e) => setCaseDetails(e.target.value)}
              placeholder="Enter detailed case information..."
              rows={4}
              className="border-legal-gray-light resize-none"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-accent text-legal-navy font-semibold shadow-accent hover:shadow-lg transition-all duration-300 py-2 md:py-3 text-sm md:text-base"
          >
            Add Case Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CaseForm;