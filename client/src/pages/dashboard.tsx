import * as React from "react";
import { format } from "date-fns";
import { Calendar, Plus } from "lucide-react";
import { StatsOverview } from "@/components/habit-tracker/stats-overview";
import { HabitsList } from "@/components/habit-tracker/habits-list";
import { CalendarView } from "@/components/habit-tracker/calendar-view";
import { StreakProgress } from "@/components/habit-tracker/streak-progress";
import { AddHabitDialog } from "@/components/habit-tracker/add-habit-dialog";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

export default function Dashboard() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [addHabitOpen, setAddHabitOpen] = React.useState(false);
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600">Track and visualize your daily habits</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          {/* Date Selection */}
          <div className="relative mr-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{format(date, "MMMM d, yyyy")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarPicker
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Add New Habit Button */}
          <Button onClick={() => setAddHabitOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <StatsOverview />
      
      {/* Habit Tracking Section */}
      <HabitsList />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar View */}
        <CalendarView />
        
        {/* Streaks & Progress */}
        <StreakProgress />
      </div>
      
      {/* Add Habit Dialog */}
      <AddHabitDialog open={addHabitOpen} onOpenChange={setAddHabitOpen} />
    </div>
  );
}
