import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Clock, FileText } from "lucide-react";
import { CaseEntry, CaseStats } from "@/types/case";
import { format, isToday, addDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import CaseCard from "./CaseCard";

interface DashboardProps {
  cases: CaseEntry[];
  onDateSelect: (date: Date) => void;
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

const Dashboard = ({ cases, onDateSelect }: DashboardProps) => {
const todayStart = startOfDay(new Date());
const next7End = endOfDay(addDays(todayStart, 7));

  // Calculate statistics
  const stats: CaseStats = {
    total: cases.length,
    byStatus: cases.reduce((acc, case_) => {
      acc[case_.status] = (acc[case_.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
upcoming: cases.filter(case_ => {
  const nextDate = new Date(case_.nextDate);
  return isWithinInterval(nextDate, { start: todayStart, end: next7End });
}).length,
    today: cases.filter(case_ => {
      const nextDate = new Date(case_.nextDate);
      const previousDate = new Date(case_.previousDate);
      return isToday(nextDate) || isToday(previousDate);
    }).length
  };

  // Get today's cases
  const todaysCases = cases.filter(case_ => {
    const nextDate = new Date(case_.nextDate);
    const previousDate = new Date(case_.previousDate);
    return isToday(nextDate) || isToday(previousDate);
  });

  // Get upcoming cases (next 7 days)
const upcomingCases = cases.filter(case_ => {
  const nextDate = new Date(case_.nextDate);
  return isWithinInterval(nextDate, { start: todayStart, end: next7End }) && !isToday(nextDate);
}).sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());

  return (
    <div className="space-y-6 md:space-y-8 px-2 md:px-0">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="gradient-card shadow-card border-legal-gray-light/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-legal-navy">Total Cases</CardTitle>
            <FileText className="h-3 w-3 md:h-4 md:w-4 text-legal-gold" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold text-legal-navy">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card border-legal-gray-light/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-legal-navy">Today's Cases</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-legal-gold" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold text-legal-navy">{stats.today}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card border-legal-gray-light/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-legal-navy">Upcoming</CardTitle>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-legal-gold" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold text-legal-navy">{stats.upcoming}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card border-legal-gray-light/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-legal-navy">Active</CardTitle>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-legal-gold" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold text-legal-navy">{stats.byStatus.active || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card className="gradient-card shadow-card border-legal-gray-light/30">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-legal-navy">Case Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <Badge 
                key={status} 
                className={`${statusColors[status as keyof typeof statusColors]} px-3 py-1`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Cases */}
        <Card className="gradient-card shadow-card border-legal-gray-light/30">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-legal-navy">Today's Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysCases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-legal-gray">No cases scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {todaysCases.map((caseEntry) => (
                  <CaseCard key={caseEntry.id} caseEntry={caseEntry} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Cases */}
        <Card className="gradient-card shadow-card border-legal-gray-light/30">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-legal-navy">Upcoming Cases (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingCases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-legal-gray">No upcoming cases in the next 7 days.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {upcomingCases.map((caseEntry) => (
                  <div key={caseEntry.id} className="p-4 bg-muted/30 rounded-lg border border-legal-gray-light/30">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${statusColors[caseEntry.status]} text-xs`}>
                        {caseEntry.status.charAt(0).toUpperCase() + caseEntry.status.slice(1)}
                      </Badge>
                      <button
                        onClick={() => onDateSelect(new Date(caseEntry.nextDate))}
                        className="text-legal-gold hover:text-legal-gold-light text-sm font-medium transition-colors"
                      >
                        {format(new Date(caseEntry.nextDate), "MMM d, yyyy")}
                      </button>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{caseEntry.caseDetails}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;