import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";
import { CaseEntry, CaseStatus } from "@/types/case";

interface SearchAndFilterProps {
  cases: CaseEntry[];
  onFilteredCasesChange: (cases: CaseEntry[]) => void;
}

const SearchAndFilter = ({ cases, onFilteredCasesChange }: SearchAndFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">("all");

  const applyFilters = () => {
    let filtered = cases;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(case_ =>
        case_.caseDetails.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(case_ => case_.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      filtered = filtered.filter(case_ => {
        const nextDate = new Date(case_.nextDate);
        if (dateFilter === "upcoming") {
          return nextDate >= today;
        } else if (dateFilter === "past") {
          return nextDate < today;
        }
        return true;
      });
    }

    onFilteredCasesChange(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
    onFilteredCasesChange(cases);
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, dateFilter, cases]);

  const hasActiveFilters = searchTerm.trim() || statusFilter !== "all" || dateFilter !== "all";

  return (
    <Card className="gradient-card shadow-card border-legal-gray-light/30">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-legal-gray w-4 h-4" />
              <Input
                placeholder="Search case details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-legal-gray-light"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: CaseStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px] border-legal-gray-light">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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

            <Select value={dateFilter} onValueChange={(value: "all" | "upcoming" | "past") => setDateFilter(value)}>
              <SelectTrigger className="w-full md:w-[140px] border-legal-gray-light">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-legal-gray-light hover:bg-red-50 hover:border-red-300"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchAndFilter;