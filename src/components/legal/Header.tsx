import { Scale } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Header = ({ activeView, onViewChange }: HeaderProps) => {
  return (
    <header className="gradient-header shadow-legal">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-white/10 rounded-xl">
              <Scale className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-serif font-semibold text-white">
                Legal Case Diary
              </h1>
              <p className="text-white/80 text-xs md:text-sm font-medium">
                Professional Case Management System
              </p>
            </div>
          </div>

          <Tabs value={activeView} onValueChange={onViewChange} className="bg-white/10 rounded-lg p-1">
            <TabsList className="bg-transparent grid grid-cols-2 md:grid-cols-4 gap-1">
              <TabsTrigger 
                value="dashboard" 
                className="text-white data-[state=active]:bg-white data-[state=active]:text-legal-navy text-xs md:text-sm px-2 md:px-3"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="text-white data-[state=active]:bg-white data-[state=active]:text-legal-navy text-xs md:text-sm px-2 md:px-3"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="diary" 
                className="text-white data-[state=active]:bg-white data-[state=active]:text-legal-navy text-xs md:text-sm px-2 md:px-3"
              >
                Daily
              </TabsTrigger>
              <TabsTrigger 
                value="manage" 
                className="text-white data-[state=active]:bg-white data-[state=active]:text-legal-navy text-xs md:text-sm px-2 md:px-3"
              >
                Manage
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
};

export default Header;