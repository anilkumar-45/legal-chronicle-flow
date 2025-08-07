import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { CaseEntry } from "@/types/case";
import { format } from "date-fns";

interface CaseCardProps {
  caseEntry: CaseEntry;
}

const statusColors = {
  pending: "bg-status-pending text-white",
  active: "bg-status-active text-white", 
  completed: "bg-status-completed text-white",
  urgent: "bg-status-urgent text-white"
};

const CaseCard = ({ caseEntry }: CaseCardProps) => {
  return (
    <Card className="gradient-card shadow-card hover:shadow-legal transition-all duration-300 border-legal-gray-light/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg font-serif text-legal-navy flex-1">
            Case Details
          </CardTitle>
          <Badge className={`${statusColors[caseEntry.status]} font-medium px-3 py-1`}>
            {caseEntry.status.charAt(0).toUpperCase() + caseEntry.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-foreground leading-relaxed">
            {caseEntry.caseDetails}
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-legal-gray">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Previous:</span>
            <span>{format(new Date(caseEntry.previousDate), "dd MMM yyyy")}</span>
          </div>
          
          <ArrowRight className="w-4 h-4 text-legal-gold" />
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Next:</span>
            <span>{format(new Date(caseEntry.nextDate), "dd MMM yyyy")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseCard;