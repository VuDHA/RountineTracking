import * as React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav, MobileHeader } from "@/components/ui/mobile-nav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AddHabitDialog } from "@/components/habit-tracker/add-habit-dialog";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [addHabitOpen, setAddHabitOpen] = React.useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar - Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 md:ml-72 pb-16 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />
        
        {/* Page Content */}
        {children}
        
        {/* Mobile Navigation - Bottom */}
        <MobileNav onAddHabit={() => setAddHabitOpen(true)} />
        
        {/* Add Habit Dialog */}
        <AddHabitDialog open={addHabitOpen} onOpenChange={setAddHabitOpen} />
      </main>
    </div>
  );
}
