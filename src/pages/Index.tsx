import { useState } from "react";
import Header from "@/components/legal/Header";
import DateNavigator from "@/components/legal/DateNavigator";
import CaseForm from "@/components/legal/CaseForm";
import CaseCard from "@/components/legal/CaseCard";
import { useCaseStore } from "@/hooks/useCaseStore";
import { format } from "date-fns";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { addCase, getCasesForDate } = useCaseStore();

  const casesForSelectedDate = getCasesForDate(selectedDate);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        <DateNavigator 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CaseForm onSubmit={addCase} />
          </div>

          <div className="space-y-6">
            <div className="bg-white/50 rounded-xl border border-legal-gray-light/30 p-6">
              <h2 className="text-xl font-serif font-semibold text-legal-navy mb-4">
                Cases for {format(selectedDate, "MMMM d, yyyy")}
              </h2>
              
              {casesForSelectedDate.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-legal-gray">No cases scheduled for this date.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {casesForSelectedDate.map((caseEntry) => (
                    <CaseCard key={caseEntry.id} caseEntry={caseEntry} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
