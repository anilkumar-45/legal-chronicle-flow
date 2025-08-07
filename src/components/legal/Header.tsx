import { Scale } from "lucide-react";

const Header = () => {
  return (
    <header className="gradient-header shadow-legal">
      <div className="container mx-auto px-6 py-6">
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
      </div>
    </header>
  );
};

export default Header;