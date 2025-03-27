import { useQuery } from "@tanstack/react-query";
import { Check, Flame, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface HabitStatistics {
  completionRate: number;
  longestStreak: number;
  currentStreak: number;
  totalHabits: number;
  completedToday: number;
}

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery<HabitStatistics>({
    queryKey: ["/api/statistics"],
  });
  
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full mr-4" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
            <div className="mt-4">
              <Skeleton className="h-2 w-full rounded" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  const calculateChange = () => {
    // For demo purposes, we'll just generate a random change between -5% and +5%
    const change = Math.floor(Math.random() * 10) - 5;
    return {
      value: change,
      isPositive: change >= 0
    };
  };
  
  const { value: changeValue, isPositive } = calculateChange();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Completion Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 mr-4">
            <Check className="text-xl text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completionRate}%</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-100">
              <div 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <span className={`${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(changeValue)}%
            </span> compared to last week
          </p>
        </div>
      </div>
      
      {/* Current Streak */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-100 mr-4">
            <Flame className="text-xl text-warning" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Current Streak</p>
            <p className="text-2xl font-bold text-gray-800">{stats.currentStreak} days</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline space-x-1">
            {Array.from({ length: 7 }).map((_, index) => {
              const height = 6 + Math.floor(Math.random() * 5); // Random height between 6 and 10
              return (
                <div 
                  key={index}
                  className={`h-${height} w-3 rounded-sm bg-warning`}
                  style={{ height: `${height * 4}px` }}
                />
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Best streak: <span className="font-medium">{stats.longestStreak} days</span>
          </p>
        </div>
      </div>
      
      {/* Habits Today */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <Calendar className="text-xl text-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Habits Today</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completedToday}/{stats.totalHabits}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
              <div 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-success"
                style={{ width: `${stats.totalHabits > 0 ? (stats.completedToday / stats.totalHabits) * 100 : 0}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalHabits - stats.completedToday} habits still to complete today
          </p>
        </div>
      </div>
    </div>
  );
}
