import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  habits, type Habit, type InsertHabit,
  habitCompletions, type HabitCompletion, type InsertHabitCompletion,
  type HabitWithCategory, type HabitStatistics
} from "@shared/schema";
import { format, isToday, parseISO, startOfDay, subDays } from "date-fns";

// Interface defining all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Habit operations
  getHabits(userId?: number): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Habit completion operations
  getHabitCompletions(habitId: number): Promise<HabitCompletion[]>;
  getHabitCompletionsByDate(date: string): Promise<HabitCompletion[]>;
  createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  updateHabitCompletion(id: number, completion: Partial<InsertHabitCompletion>): Promise<HabitCompletion | undefined>;
  deleteHabitCompletion(id: number): Promise<boolean>;
  toggleHabitCompletion(habitId: number, date: string, userId?: number): Promise<HabitCompletion>;
  
  // Extended operations
  getHabitsWithCategories(userId?: number): Promise<HabitWithCategory[]>;
  getHabitWithCategory(id: number): Promise<HabitWithCategory | undefined>;
  getHabitStatistics(userId?: number): Promise<HabitStatistics>;
  calculateStreaks(habitId: number): Promise<{ currentStreak: number, longestStreak: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private habits: Map<number, Habit>;
  private habitCompletions: Map<number, HabitCompletion>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private habitIdCounter: number;
  private habitCompletionIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.habits = new Map();
    this.habitCompletions = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.habitIdCounter = 1;
    this.habitCompletionIdCounter = 1;
    
    // Initialize with default categories
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Add default categories
    const defaultCategories = [
      { name: "Health", color: "#4F46E5" },
      { name: "Productivity", color: "#10B981" },
      { name: "Learning", color: "#8B5CF6" },
      { name: "Wellness", color: "#F59E0B" },
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory({ name: category.name, color: category.color });
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Habit operations
  async getHabits(userId?: number): Promise<Habit[]> {
    if (userId) {
      return Array.from(this.habits.values()).filter(habit => habit.userId === userId);
    }
    return Array.from(this.habits.values());
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }
  
  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.habitIdCounter++;
    const habit: Habit = { 
      ...insertHabit, 
      id, 
      createdAt: new Date(),
      description: insertHabit.description || null,
      reminderTime: insertHabit.reminderTime || null,
    };
    this.habits.set(id, habit);
    return habit;
  }
  
  async updateHabit(id: number, habitUpdate: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const updatedHabit: Habit = { ...habit, ...habitUpdate };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }
  
  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }
  
  // Habit completion operations
  async getHabitCompletions(habitId: number): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values())
      .filter(completion => completion.habitId === habitId);
  }
  
  async getHabitCompletionsByDate(dateStr: string): Promise<HabitCompletion[]> {
    const date = startOfDay(new Date(dateStr));
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    return Array.from(this.habitCompletions.values())
      .filter(completion => {
        const completionDate = completion.completedAt instanceof Date 
          ? format(completion.completedAt, 'yyyy-MM-dd')
          : format(new Date(completion.completedAt), 'yyyy-MM-dd');
        return completionDate === formattedDate;
      });
  }
  
  async createHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const id = this.habitCompletionIdCounter++;
    
    // Ensure completedAt is a Date object
    const completedAt = typeof insertCompletion.completedAt === 'string' 
      ? new Date(insertCompletion.completedAt)
      : insertCompletion.completedAt;
    
    const completion: HabitCompletion = { 
      ...insertCompletion, 
      id,
      completedAt
    };
    this.habitCompletions.set(id, completion);
    return completion;
  }
  
  async updateHabitCompletion(id: number, completionUpdate: Partial<InsertHabitCompletion>): Promise<HabitCompletion | undefined> {
    const completion = this.habitCompletions.get(id);
    if (!completion) return undefined;
    
    const updatedCompletion: HabitCompletion = { ...completion, ...completionUpdate };
    this.habitCompletions.set(id, updatedCompletion);
    return updatedCompletion;
  }
  
  async deleteHabitCompletion(id: number): Promise<boolean> {
    return this.habitCompletions.delete(id);
  }
  
  async toggleHabitCompletion(habitId: number, dateStr: string, userId?: number): Promise<HabitCompletion> {
    const date = startOfDay(new Date(dateStr));
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check if there's an existing completion record for this habit and date
    const existingCompletion = Array.from(this.habitCompletions.values()).find(completion => {
      const completionDate = format(
        completion.completedAt instanceof Date 
          ? completion.completedAt 
          : new Date(completion.completedAt), 
        'yyyy-MM-dd'
      );
      return completion.habitId === habitId && completionDate === formattedDate;
    });
    
    if (existingCompletion) {
      // Toggle the existing completion
      const updatedCompletion = await this.updateHabitCompletion(
        existingCompletion.id, 
        { completed: !existingCompletion.completed }
      );
      return updatedCompletion!;
    } else {
      // Create a new completion record
      const newCompletion = await this.createHabitCompletion({
        habitId,
        userId: userId || null,
        completedAt: date,
        completed: true
      });
      return newCompletion;
    }
  }
  
  // Extended operations
  async getHabitsWithCategories(userId?: number): Promise<HabitWithCategory[]> {
    const habits = userId 
      ? Array.from(this.habits.values()).filter(habit => habit.userId === userId || habit.userId === null)
      : Array.from(this.habits.values());
    
    return Promise.all(habits.map(async habit => {
      const category = habit.categoryId ? this.categories.get(habit.categoryId) : null;
      const { currentStreak } = await this.calculateStreaks(habit.id);
      
      // Check if habit is completed today
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayCompletions = Array.from(this.habitCompletions.values())
        .filter(completion => {
          const completionDate = format(
            completion.completedAt instanceof Date 
              ? completion.completedAt 
              : new Date(completion.completedAt), 
            'yyyy-MM-dd'
          );
          return completion.habitId === habit.id && 
                 completionDate === today && 
                 completion.completed === true;
        });
      
      return {
        ...habit,
        category,
        currentStreak,
        completedToday: todayCompletions.length > 0
      };
    }));
  }
  
  async getHabitWithCategory(id: number): Promise<HabitWithCategory | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const category = habit.categoryId ? this.categories.get(habit.categoryId) : null;
    const { currentStreak } = await this.calculateStreaks(habit.id);
    
    // Check if habit is completed today
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayCompletions = Array.from(this.habitCompletions.values())
      .filter(completion => {
        const completionDate = format(
          completion.completedAt instanceof Date 
            ? completion.completedAt 
            : new Date(completion.completedAt), 
          'yyyy-MM-dd'
        );
        return completion.habitId === habit.id && 
               completionDate === today && 
               completion.completed === true;
      });
    
    return {
      ...habit,
      category,
      currentStreak,
      completedToday: todayCompletions.length > 0
    };
  }
  
  async calculateStreaks(habitId: number): Promise<{ currentStreak: number, longestStreak: number }> {
    const completions = Array.from(this.habitCompletions.values())
      .filter(completion => completion.habitId === habitId && completion.completed)
      .sort((a, b) => {
        const dateA = a.completedAt instanceof Date ? a.completedAt : new Date(a.completedAt);
        const dateB = b.completedAt instanceof Date ? b.completedAt : new Date(b.completedAt);
        return dateB.getTime() - dateA.getTime(); // Sort descending
      });
    
    if (completions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakActive = true;
    
    // Check if the latest completion is today or yesterday
    const latestDate = completions[0].completedAt instanceof Date 
      ? completions[0].completedAt 
      : new Date(completions[0].completedAt);
    
    if (!isToday(latestDate) && latestDate < subDays(new Date(), 1)) {
      currentStreakActive = false;
    }
    
    // Calculate streaks
    let tempStreak = 0;
    let prevDate: Date | null = null;
    
    completions.forEach(completion => {
      const completionDate = completion.completedAt instanceof Date 
        ? completion.completedAt 
        : new Date(completion.completedAt);
      
      if (!prevDate) {
        tempStreak = 1;
        prevDate = completionDate;
      } else {
        const dayDiff = Math.floor(
          (prevDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          // Consecutive days
          tempStreak++;
        } else if (dayDiff === 0) {
          // Same day, ignore
        } else {
          // Streak broken
          if (currentStreakActive) {
            currentStreak = tempStreak;
            currentStreakActive = false;
          }
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        
        prevDate = completionDate;
      }
    });
    
    // Update current streak if still active
    if (currentStreakActive) {
      currentStreak = tempStreak;
    }
    
    // Final check for longest streak
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  }
  
  async getHabitStatistics(userId?: number): Promise<HabitStatistics> {
    const habits = await this.getHabitsWithCategories(userId);
    
    if (habits.length === 0) {
      return {
        completionRate: 0,
        longestStreak: 0,
        currentStreak: 0,
        totalHabits: 0,
        completedToday: 0,
      };
    }
    
    // Calculate completion rate for the last 7 days
    const today = new Date();
    let totalCompletions = 0;
    let possibleCompletions = 0;
    
    // Check last 7 days of completions
    for (let i = 0; i < 7; i++) {
      const checkDate = subDays(today, i);
      const formattedDate = format(checkDate, 'yyyy-MM-dd');
      
      habits.forEach(habit => {
        possibleCompletions++;
        
        const completed = Array.from(this.habitCompletions.values()).find(completion => {
          const completionDate = format(
            completion.completedAt instanceof Date 
              ? completion.completedAt 
              : new Date(completion.completedAt), 
            'yyyy-MM-dd'
          );
          return completion.habitId === habit.id && 
                 completionDate === formattedDate && 
                 completion.completed === true;
        });
        
        if (completed) {
          totalCompletions++;
        }
      });
    }
    
    const completionRate = possibleCompletions > 0 
      ? Math.round((totalCompletions / possibleCompletions) * 100) 
      : 0;
    
    // Find longest streak among all habits
    let longestStreak = 0;
    let totalCurrentStreak = 0;
    
    for (const habit of habits) {
      const { currentStreak, longestStreak: habitLongestStreak } = await this.calculateStreaks(habit.id);
      longestStreak = Math.max(longestStreak, habitLongestStreak);
      totalCurrentStreak += currentStreak;
    }
    
    // Calculate average current streak
    const currentStreak = habits.length > 0 ? Math.round(totalCurrentStreak / habits.length) : 0;
    
    // Count habits completed today
    const completedToday = habits.filter(habit => habit.completedToday).length;
    
    return {
      completionRate,
      longestStreak,
      currentStreak,
      totalHabits: habits.length,
      completedToday,
    };
  }
}

export const storage = new MemStorage();
