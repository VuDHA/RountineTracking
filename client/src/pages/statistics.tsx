import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsOverview } from "@/components/habit-tracker/stats-overview";
import { Skeleton } from "@/components/ui/skeleton";

interface HabitStatistics {
  completionRate: number;
  longestStreak: number;
  currentStreak: number;
  totalHabits: number;
  completedToday: number;
}

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

// Generate mock data for demonstration purposes
const generateCompletionData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      completion: Math.floor(Math.random() * 40) + 60, // Random between 60-100%
    });
  }
  
  return data;
};

const generateCategoryData = (categories: Category[] | undefined, habits: Habit[] | undefined) => {
  if (!categories || !habits) return [];
  
  const categoryMap = new Map<number, { name: string; color: string; count: number }>();
  
  // Initialize with all categories
  categories.forEach(cat => {
    categoryMap.set(cat.id, { name: cat.name, color: cat.color, count: 0 });
  });
  
  // Count habits per category
  habits.forEach(habit => {
    if (habit.categoryId) {
      const category = categoryMap.get(habit.categoryId);
      if (category) {
        category.count += 1;
      }
    }
  });
  
  return Array.from(categoryMap.values())
    .filter(cat => cat.count > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.count,
      color: cat.color
    }));
};

export default function StatisticsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<HabitStatistics>({
    queryKey: ["/api/statistics"],
  });
  
  const { data: habits, isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const completionData = React.useMemo(() => generateCompletionData(), []);
  
  const categoryData = React.useMemo(
    () => generateCategoryData(categories, habits), 
    [categories, habits]
  );
  
  const isLoading = statsLoading || habitsLoading || categoriesLoading;
  
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <StatsOverview />
        
        <Tabs defaultValue="completion">
          <TabsList className="mb-4">
            <Skeleton className="h-10 w-96" />
          </TabsList>
          
          <TabsContent value="completion">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Statistics</h2>
        <p className="mt-1 text-sm text-gray-600">Visualize your habit tracking performance</p>
      </div>
      
      <StatsOverview />
      
      <Tabs defaultValue="completion" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="completion">Completion Rate</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Habit Completion Rate</CardTitle>
              <CardDescription>
                Daily completion rate over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                    <Line 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="#4F46E5" 
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Habits by Category</CardTitle>
                <CardDescription>
                  Distribution of habits across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Number of habits in each category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value, name, props) => [value, 'Habits']} />
                      <Bar dataKey="value" name="Habits">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="streaks">
          <Card>
            <CardHeader>
              <CardTitle>Habit Streaks</CardTitle>
              <CardDescription>
                Current streak length for each habit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={habits?.map(habit => ({
                      name: habit.name,
                      streak: habit.currentStreak,
                      color: habit.category?.color || "#4F46E5"
                    })).sort((a, b) => b.streak - a.streak)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => [`${value} days`, 'Current Streak']} />
                    <Legend />
                    <Bar dataKey="streak" name="Current Streak" barSize={20}>
                      {habits?.map((habit, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={habit.category?.color || "#4F46E5"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
