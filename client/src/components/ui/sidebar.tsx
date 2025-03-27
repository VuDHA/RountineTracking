import { Link, useLocation } from "wouter";
import {
  Calendar,
  BarChart3,
  Settings,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  color: string;
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-72 md:fixed md:inset-y-0 bg-white shadow-lg z-10">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-5 flex items-center border-b border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3">
            <BarChart3 className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">HabitTrack</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            <Link href="/">
              <a className={cn(
                "flex items-center px-4 py-3 text-base font-medium rounded-lg",
                location === "/" 
                  ? "bg-indigo-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-100"
              )}>
                <LayoutDashboard className="mr-3" size={20} />
                <span>Dashboard</span>
              </a>
            </Link>
            
            <Link href="/calendar">
              <a className={cn(
                "flex items-center px-4 py-3 text-base font-medium rounded-lg",
                location === "/calendar" 
                  ? "bg-indigo-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-100"
              )}>
                <Calendar className="mr-3" size={20} />
                <span>Calendar</span>
              </a>
            </Link>
            
            <Link href="/statistics">
              <a className={cn(
                "flex items-center px-4 py-3 text-base font-medium rounded-lg",
                location === "/statistics" 
                  ? "bg-indigo-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-100"
              )}>
                <BarChart3 className="mr-3" size={20} />
                <span>Statistics</span>
              </a>
            </Link>
            
            <Link href="/settings">
              <a className={cn(
                "flex items-center px-4 py-3 text-base font-medium rounded-lg",
                location === "/settings" 
                  ? "bg-indigo-50 text-primary" 
                  : "text-gray-600 hover:bg-gray-100"
              )}>
                <Settings className="mr-3" size={20} />
                <span>Settings</span>
              </a>
            </Link>
          </div>
          
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </h3>
            <div className="mt-2 space-y-1">
              {categories?.map((category) => (
                <a 
                  key={category.id}
                  href="#" 
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <span 
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </a>
              ))}
            </div>
          </div>
        </nav>
        
        {/* User Profile */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-500">Logged in</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              title="Logout"
              className="text-gray-500 hover:text-primary"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
