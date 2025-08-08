import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Download, Plus } from "lucide-react";
import { CaseEntry } from "@/types/case";
import { format } from "date-fns";
import CaseForm from "./CaseForm";
import EditCaseDialog from "./EditCaseDialog";
import SearchAndFilter from "./SearchAndFilter";
import { useToast } from "@/hooks/use-toast";

interface CaseManagerProps {
  cases: CaseEntry[];
  onAddCase: (caseData: Omit<CaseEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCase: (id: string, updates: Partial<CaseEntry>) => void;
  onDeleteCase: (id: string) => void;
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

const CaseManager = ({ cases, onAddCase, onUpdateCase, onDeleteCase }: CaseManagerProps) => {
  const [filteredCases, setFilteredCases] = useState<CaseEntry[]>(cases);
  const [editingCase, setEditingCase] = useState<CaseEntry | null>(null);
  const { toast } = useToast();

  const handleDeleteCase = (id: string) => {
    if (confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      onDeleteCase(id);
      toast({
        title: "Case Deleted",
        description: "The case has been successfully deleted.",
      });
    }
  };

  const handleExportCases = () => {
    const csvContent = [
      ["ID", "Previous Date", "Next Date", "Status", "Case Details", "Created", "Updated"],
      ...filteredCases.map(case_ => [
        case_.id,
        format(new Date(case_.previousDate), "yyyy-MM-dd"),
        format(new Date(case_.nextDate), "yyyy-MM-dd"),
        case_.status,
        `"${case_.caseDetails.replace(/"/g, '""')}"`,
        format(new Date(case_.createdAt), "yyyy-MM-dd HH:mm:ss"),
        format(new Date(case_.updatedAt), "yyyy-MM-dd HH:mm:ss")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `legal-cases-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `${filteredCases.length} cases exported successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-3 md:mb-6">
          <TabsList className="grid w-auto grid-cols-2">
            <TabsTrigger value="list">Case List</TabsTrigger>
            <TabsTrigger value="add">Add New Case</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 self-end md:self-auto">
            <Button
              onClick={handleExportCases}
              variant="outline"
              size="sm"
              className="border-legal-gold text-legal-gold hover:bg-legal-gold hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export ({filteredCases.length})
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="space-y-6">
          <SearchAndFilter 
            cases={cases} 
            onFilteredCasesChange={setFilteredCases}
          />
          
          <Card className="gradient-card shadow-card border-legal-gray-light/30">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-legal-navy">
                All Cases ({filteredCases.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCases.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <p className="text-legal-gray mb-4">No cases found matching your criteria.</p>
                  <Button variant="outline" onClick={() => setFilteredCases(cases)}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCases.map((caseEntry) => (
                    <div
                      key={caseEntry.id}
                      className="p-4 bg-white/50 rounded-lg border border-legal-gray-light/30 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${statusColors[caseEntry.status]} text-xs`}>
                              {caseEntry.status.charAt(0).toUpperCase() + caseEntry.status.slice(1)}
                            </Badge>
                            <span className="text-xs text-legal-gray">
                              Created {format(new Date(caseEntry.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          
                          <p className="text-foreground mb-3 line-clamp-2">
                            {caseEntry.caseDetails}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-legal-gray">
                            <span>
                              <strong>Previous:</strong> {format(new Date(caseEntry.previousDate), "MMM d, yyyy")}
                            </span>
                            <span>
                              <strong>Next:</strong> {format(new Date(caseEntry.nextDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-3 md:pt-0 md:self-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCase(caseEntry)}
                            className="border-legal-gold text-legal-gold hover:bg-legal-gold hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCase(caseEntry.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <CaseForm onSubmit={onAddCase} />
        </TabsContent>
      </Tabs>

      {editingCase && (
        <EditCaseDialog
          case={editingCase}
          isOpen={!!editingCase}
          onClose={() => setEditingCase(null)}
          onSave={(updates) => {
            onUpdateCase(editingCase.id, updates);
            setEditingCase(null);
            toast({
              title: "Case Updated",
              description: "Case details have been successfully updated.",
            });
          }}
        />
      )}
    </div>
  );
};

export default CaseManager;