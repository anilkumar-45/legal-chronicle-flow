import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { CaseEntry } from "@/types/case";
import { format } from "date-fns";
import { useState } from "react";
import CaseHistory from "./CaseHistory";
interface CaseCardProps {
  caseEntry: CaseEntry;
}

const statusColors = {
  summons: "bg-blue-500 text-white",
  hearing: "bg-purple-500 text-white",
  judgment: "bg-green-600 text-white",
  appeal: "bg-orange-500 text-white",
  pending: "bg-status-pending text-white",
  active: "bg-status-active text-white", 
  completed: "bg-status-completed text-white",
  urgent: "bg-status-urgent text-white",
  dismissed: "bg-gray-500 text-white",
  settled: "bg-emerald-500 text-white"
};

const CaseCard = ({ caseEntry }: CaseCardProps) => {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <Card className="gradient-card shadow-card hover:shadow-legal transition-all duration-300 border-legal-gray-light/30">
      <CardHeader className="pb-3 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <CardTitle className="text-base md:text-lg font-serif text-legal-navy flex-1">
            Case Details
          </CardTitle>
          <Badge className={`${statusColors[caseEntry.status]} font-medium px-2 md:px-3 py-1 text-xs w-fit`}>
            {caseEntry.status.charAt(0).toUpperCase() + caseEntry.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
        <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
          <p className="text-foreground leading-relaxed text-sm md:text-base break-words">
            {caseEntry.caseDetails}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 text-xs md:text-sm text-legal-gray">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="font-medium">Previous:</span>
            <span className="break-all">{format(new Date(caseEntry.previousDate), "dd MMM yyyy")}</span>
          </div>
          
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-legal-gold hidden md:block" />
          
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="font-medium">Next:</span>
            <span className="break-all">{format(new Date(caseEntry.nextDate), "dd MMM yyyy")}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory((s) => !s)}
          className="text-legal-gold hover:text-legal-gold-light text-xs md:text-sm font-medium transition-colors"
          aria-expanded={showHistory}
        >
          {showHistory ? 'Hide history' : 'View history'}
        </button>

        {showHistory && <CaseHistory caseId={caseEntry.id} />}
      </CardContent>
    </Card>
  );
};

export default CaseCard;