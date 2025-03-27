import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface HabitItemProps {
  habit: Habit;
}

const getCategoryVariant = (categoryName?: string | null) => {
  switch (categoryName?.toLowerCase()) {
    case "health":
      return "health";
    case "productivity":
      return "productivity";
    case "learning":
      return "learning";
    case "wellness":
      return "wellness";
    default:
      return "default";
  }
};

export function HabitItem({ habit }: HabitItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const toggleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/habits/${habit.id}/toggle`, { date: new Date().toISOString().split('T')[0] });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update habit",
        variant: "destructive",
      });
    }
  });
  
  const handleToggle = () => {
    toggleMutation.mutate();
  };
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/habits/${habit.id}`, undefined);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Success",
        description: "Habit deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete habit",
        variant: "destructive",
      });
    }
  });
  
  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative inline-block">
            <Checkbox 
              id={`habit-${habit.id}`}
              checked={habit.completedToday}
              onCheckedChange={handleToggle}
              className={`w-6 h-6 rounded-full ${habit.completedToday ? 'bg-success text-white border-success' : ''}`}
            />
          </div>
          <div className="ml-4">
            <h4 className="text-base font-medium text-gray-800">{habit.name}</h4>
            {habit.description && (
              <p className="text-sm text-gray-500">{habit.description}</p>
            )}
          </div>
          {habit.category && (
            <Badge variant={getCategoryVariant(habit.category.name)} className="ml-3">
              {habit.category.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center">
          <div className="mr-4 text-right">
            <p className="text-sm font-medium text-gray-600">Current streak</p>
            <p className="text-sm text-gray-800">
              <span className="font-medium">{habit.currentStreak}</span> days
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => deleteMutation.mutate()}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
