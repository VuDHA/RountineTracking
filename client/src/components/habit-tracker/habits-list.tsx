import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { HabitItem } from "./habit-item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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

export function HabitsList() {
  const [filter, setFilter] = React.useState("all");
  
  const { data: habits, isLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });
  
  const filteredHabits = React.useMemo(() => {
    if (!habits) return [];
    
    switch (filter) {
      case "completed":
        return habits.filter(habit => habit.completedToday);
      case "uncompleted":
        return habits.filter(habit => !habit.completedToday);
      default:
        return habits;
    }
  }, [habits, filter]);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="px-6 py-5 divide-y divide-gray-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Today's Habits</h3>
          <Tabs defaultValue="all" onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="uncompleted">Uncompleted</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="px-6 py-5 divide-y divide-gray-200">
        {filteredHabits.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No habits to display</p>
            {filter !== "all" && (
              <p className="text-sm text-gray-400 mt-1">
                Try changing your filter or adding new habits
              </p>
            )}
          </div>
        ) : (
          filteredHabits.map((habit) => (
            <HabitItem key={habit.id} habit={habit} />
          ))
        )}
      </div>
    </div>
  );
}
