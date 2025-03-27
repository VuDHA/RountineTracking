import { Link, useLocation } from "wouter";
import {
  Calendar,
  BarChart3,
  Settings,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onAddHabit: () => void;
}

export function MobileNav({ onAddHabit }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={cn("flex flex-col items-center", 
            location === "/" ? "text-primary" : "text-gray-500")}>
            <LayoutDashboard className="text-xl" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/calendar">
          <a className={cn("flex flex-col items-center", 
            location === "/calendar" ? "text-primary" : "text-gray-500")}>
            <Calendar className="text-xl" />
            <span className="text-xs mt-1">Calendar</span>
          </a>
        </Link>
        
        <button 
          onClick={onAddHabit}
          className="flex flex-col items-center text-primary"
        >
          <PlusCircle className="text-2xl" />
        </button>
        
        <Link href="/statistics">
          <a className={cn("flex flex-col items-center", 
            location === "/statistics" ? "text-primary" : "text-gray-500")}>
            <BarChart3 className="text-xl" />
            <span className="text-xs mt-1">Stats</span>
          </a>
        </Link>
        
        <Link href="/settings">
          <a className={cn("flex flex-col items-center", 
            location === "/settings" ? "text-primary" : "text-gray-500")}>
            <Settings className="text-xl" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3">
          <BarChart3 className="text-white" size={20} />
        </div>
        <h1 className="text-xl font-bold text-gray-800">HabitTrack</h1>
      </div>
      <button 
        onClick={onMenuClick}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
