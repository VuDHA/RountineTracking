import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parse, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface HabitCompletionDay {
  date: string;
  completions: {
    habitId: number;
    completed: boolean;
  }[];
}

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // This would normally fetch completions for the visible month
  const { data: habitCompletions, isLoading } = useQuery<HabitCompletionDay[]>({
    queryKey: ["/api/completions/all"],
    // This is a placeholder, in a real app you'd have an endpoint that returns all completions
    // for a date range, or individually fetch each day's completions as needed
    enabled: false,
  });
  
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const getDay = (date: Date) => {
    const day = date.getDay();
    return day;
  };
  
  // Generate placeholder completions for demonstration
  const generatePlaceholderCompletions = (date: Date) => {
    // Generate between 0-3 completed habits based on date
    const numCompleted = Math.floor(Math.random() * 4);
    const numPending = Math.floor(Math.random() * 2);
    const numMissed = Math.floor(Math.random() * 2);
    
    return {
      completed: numCompleted,
      pending: numPending,
      missed: numMissed
    };
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <Skeleton className="h-6 w-32" />
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }
  
  // Create a grid of blank spaces before the first day of the month
  const blanks = [];
  for (let i = 0; i < getDay(startDate); i++) {
    blanks.push(
      <div key={`blank-${i}`} className="py-2 px-1 text-xs text-gray-400"></div>
    );
  }
  
  // Create calendar days
  const daysGrid = days.map(day => {
    const completions = generatePlaceholderCompletions(day);
    
    return (
      <div 
        key={day.toString()} 
        className={`py-2 px-1 text-xs ${isSameMonth(day, currentMonth) ? 'text-gray-600' : 'text-gray-400'}`}
      >
        <div 
          className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center ${
            isToday(day) ? 'bg-primary text-white' : ''
          }`}
        >
          {format(day, 'd')}
        </div>
        <div className="mt-1 flex justify-center">
          {/* Render indicators for completed habits */}
          {Array.from({ length: completions.completed }).map((_, i) => (
            <div key={`completed-${i}`} className="h-1.5 w-1.5 rounded-full bg-success mx-0.5"></div>
          ))}
          
          {/* Render indicators for missed habits */}
          {Array.from({ length: completions.missed }).map((_, i) => (
            <div key={`missed-${i}`} className="h-1.5 w-1.5 rounded-full bg-destructive mx-0.5"></div>
          ))}
          
          {/* Render indicators for pending habits */}
          {Array.from({ length: completions.pending }).map((_, i) => (
            <div key={`pending-${i}`} className="h-1.5 w-1.5 rounded-full bg-gray-300 mx-0.5"></div>
          ))}
        </div>
      </div>
    );
  });
  
  // Combine blanks and days
  const allDays = [...blanks, ...daysGrid];
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Habit Calendar</h3>
      </div>
      
      <div className="p-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h4 className="text-base font-medium text-gray-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h4>
          <button 
            onClick={goToNextMonth}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          <div className="text-xs font-medium text-gray-500">Sun</div>
          <div className="text-xs font-medium text-gray-500">Mon</div>
          <div className="text-xs font-medium text-gray-500">Tue</div>
          <div className="text-xs font-medium text-gray-500">Wed</div>
          <div className="text-xs font-medium text-gray-500">Thu</div>
          <div className="text-xs font-medium text-gray-500">Fri</div>
          <div className="text-xs font-medium text-gray-500">Sat</div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {allDays}
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-center text-xs text-gray-600">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-success mr-1"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-destructive mr-1"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
