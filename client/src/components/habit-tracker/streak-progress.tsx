import { useQuery } from "@tanstack/react-query";
import { 
  BookOpen, 
  CalendarClock, 
  Brain, 
  PlayCircle 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyHeatmap } from "./weekly-heatmap";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Habit {
  id: number;
  name: string;
  description: string | null;
  categoryId: number | null;
  frequency: string;
  reminderTime: string | null;
  category: Category | null;
  currentStreak: number;
  completedToday: boolean;
}

const getHabitIcon = (habitName: string) => {
  const name = habitName.toLowerCase();
  
  if (name.includes("read") || name.includes("book")) {
    return <BookOpen className="h-5 w-5" />;
  } else if (name.includes("plan") || name.includes("schedule")) {
    return <CalendarClock className="h-5 w-5" />;
  } else if (name.includes("meditat") || name.includes("mindful")) {
    return <Brain className="h-5 w-5" />;
  } else {
    return <PlayCircle className="h-5 w-5" />;
  }
};

export function StreakProgress() {
  const { data: habits, isLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });
  
  // Sort habits by streak (highest first)
  const sortedHabits = habits
    ? [...habits].sort((a, b) => b.currentStreak - a.currentStreak)
    : [];
  
  // Top 4 habits by streak
  const topHabits = sortedHabits.slice(0, 4);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-20 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Top Habits by Streak</h3>
          <button className="text-sm text-primary hover:text-indigo-700">View All</button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {topHabits.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-gray-500">No habits tracked yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Add habits to see your streaks
              </p>
            </div>
          ) : (
            topHabits.map((habit) => {
              // Calculate percentage for progress bar (max 100%)
              const progressPercentage = Math.min(habit.currentStreak * 6.5, 100);
              
              // Determine color based on category or a default
              const color = habit.category?.color || "#4F46E5";
              
              return (
                <div key={habit.id} className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ 
                      backgroundColor: `${color}20`, // 20% opacity
                      color: color
                    }}
                  >
                    {getHabitIcon(habit.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-sm font-medium text-gray-800">{habit.name}</h4>
                      <span className="text-xs font-medium" style={{ color }}>
                        {habit.currentStreak} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${progressPercentage}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Weekly Heatmap */}
        <WeeklyHeatmap />
      </div>
    </div>
  );
}
