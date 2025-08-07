import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseEntry, CaseStatus } from "@/types/case";

interface EditCaseDialogProps {
  case: CaseEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<CaseEntry>) => void;
}

const EditCaseDialog = ({ case: caseData, isOpen, onClose, onSave }: EditCaseDialogProps) => {
  const [previousDate, setPreviousDate] = useState<Date>();
  const [nextDate, setNextDate] = useState<Date>();
  const [caseDetails, setCaseDetails] = useState("");
  const [status, setStatus] = useState<CaseStatus>("pending");

  useEffect(() => {
    if (caseData) {
      setPreviousDate(new Date(caseData.previousDate));
      setNextDate(new Date(caseData.nextDate));
      setCaseDetails(caseData.caseDetails);
      setStatus(caseData.status);
    }
  }, [caseData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!previousDate || !nextDate || !caseDetails.trim()) {
      return;
    }

    onSave({
      previousDate: previousDate.toISOString(),
      nextDate: nextDate.toISOString(),
      caseDetails: caseDetails.trim(),
      status
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-legal-navy">
            Edit Case Entry
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="p-3"
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
                    className="p-3"
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
              rows={6}
              className="border-legal-gray-light resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 gradient-accent text-legal-navy font-semibold shadow-accent hover:shadow-lg transition-all duration-300"
            >
              Save Changes
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              className="flex-1 border-legal-gray-light"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCaseDialog;