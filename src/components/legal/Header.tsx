import { Scale } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Header = ({ activeView, onViewChange }: HeaderProps) => {
  return (
    <header className="gradient-header shadow-legal">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-semibold text-white">
                Legal Case Diary
              </h1>
              <p className="text-white/80 text-sm font-medium">
                Professional Case Management System
              </p>
            </div>
          </div>

          <Tabs value={activeView} onValueChange={onViewChange} className="bg-white/10 rounded-lg p-1">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="dashboard" 
                className="text-white data-[state=active]:bg-white data-[state=active]:text-legal-navy"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="text-white data-[state=active]:bg-white data-[state=active]:text-legal-navy"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="diary" 
                className="text-white data-[state=active]:bg-white data-[state=active]:text-legal-navy"
              >
                Daily View
              </TabsTrigger>
              <TabsTrigger 
                value="manage" 
                className="text-white data-[state=active]:bg-white data-[state=active]:text-legal-navy"
              >
                Manage Cases
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
};

export default Header;