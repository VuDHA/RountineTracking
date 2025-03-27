import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  habits, type Habit, type InsertHabit,
  habitCompletions, type HabitCompletion, type InsertHabitCompletion,
  type HabitWithCategory, type HabitStatistics
} from "@shared/schema";
import { format, isToday, parseISO, startOfDay, subDays } from "date-fns";
import { db } from "./db";
import { eq, and, gte, desc, like, SQL, asc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

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

export interface IStorageWithSession extends IStorage {
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorageWithSession {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'user_sessions'
    });
    
    // Check for default categories and add if none exist
    this.initializeDefaultData();
  }
  
  private async initializeDefaultData() {
    // Check if we have any categories
    const existingCategories = await this.getCategories();
    
    if (existingCategories.length === 0) {
      // Add default categories
      const defaultCategories = [
        { name: "Health", color: "#4F46E5" },
        { name: "Productivity", color: "#10B981" },
        { name: "Learning", color: "#8B5CF6" },
        { name: "Wellness", color: "#F59E0B" },
      ];
      
      for (const category of defaultCategories) {
        await this.createCategory({ name: category.name, color: category.color });
      }
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  
  // Habit operations
  async getHabits(userId?: number): Promise<Habit[]> {
    if (userId) {
      return await db.select().from(habits).where(eq(habits.userId, userId));
    }
    return await db.select().from(habits);
  }
  
  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }
  
  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    // Ensure nullable fields are properly handled
    const habitToInsert = {
      ...insertHabit,
      description: insertHabit.description || null,
      reminderTime: insertHabit.reminderTime || null,
      categoryId: insertHabit.categoryId || null,
      userId: insertHabit.userId || null
    };
    
    const [habit] = await db.insert(habits).values({
      ...habitToInsert,
      createdAt: new Date()
    }).returning();
    
    return habit;
  }
  
  async updateHabit(id: number, habitUpdate: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [updatedHabit] = await db.update(habits)
      .set(habitUpdate)
      .where(eq(habits.id, id))
      .returning();
    
    return updatedHabit;
  }
  
  async deleteHabit(id: number): Promise<boolean> {
    const result = await db.delete(habits).where(eq(habits.id, id));
    return true; // If execution reaches here without throwing an error, deletion was successful
  }
  
  // Habit completion operations
  async getHabitCompletions(habitId: number): Promise<HabitCompletion[]> {
    return await db.select()
      .from(habitCompletions)
      .where(eq(habitCompletions.habitId, habitId));
  }
  
  async getHabitCompletionsByDate(dateStr: string): Promise<HabitCompletion[]> {
    const date = startOfDay(new Date(dateStr));
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // NOTE: This depends on how the date is stored in the database
    // For PostgreSQL with Date type, we might need a different approach
    return await db.select()
      .from(habitCompletions)
      .where(sql`DATE(${habitCompletions.completedAt}) = ${formattedDate}`);
  }
  
  async createHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    // Format date correctly for DB storage if needed
    let completionToInsert = { ...insertCompletion };
    
    // Ensure userId is properly handled
    if (completionToInsert.userId === undefined) {
      completionToInsert.userId = null;
    }
    
    // Insert the completion
    const [completion] = await db.insert(habitCompletions)
      .values(completionToInsert)
      .returning();
    
    return completion;
  }
  
  async updateHabitCompletion(id: number, completionUpdate: Partial<InsertHabitCompletion>): Promise<HabitCompletion | undefined> {
    const [updatedCompletion] = await db.update(habitCompletions)
      .set(completionUpdate)
      .where(eq(habitCompletions.id, id))
      .returning();
    
    return updatedCompletion;
  }
  
  async deleteHabitCompletion(id: number): Promise<boolean> {
    await db.delete(habitCompletions)
      .where(eq(habitCompletions.id, id));
    
    return true;
  }
  
  async toggleHabitCompletion(habitId: number, dateStr: string, userId?: number): Promise<HabitCompletion> {
    const date = startOfDay(new Date(dateStr));
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Find existing completion record for this habit and date
    const [existingCompletion] = await db.select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          sql`DATE(${habitCompletions.completedAt}) = ${formattedDate}`
        )
      );
    
    if (existingCompletion) {
      // Toggle the existing completion
      const [updatedCompletion] = await db.update(habitCompletions)
        .set({ completed: !existingCompletion.completed })
        .where(eq(habitCompletions.id, existingCompletion.id))
        .returning();
      
      return updatedCompletion;
    } else {
      // Create a new completion record
      return await this.createHabitCompletion({
        habitId,
        userId: userId || null,
        completedAt: formattedDate, // Store as formatted date string
        completed: true
      });
    }
  }
  
  // Extended operations
  async getHabitsWithCategories(userId?: number): Promise<HabitWithCategory[]> {
    // Get habits with left join to categories
    const habitsQuery = userId
      ? db.select({
          habit: habits,
          category: categories
        })
        .from(habits)
        .leftJoin(categories, eq(habits.categoryId, categories.id))
        .where(eq(habits.userId, userId))
      : db.select({
          habit: habits,
          category: categories
        })
        .from(habits)
        .leftJoin(categories, eq(habits.categoryId, categories.id));
    
    const habitsData = await habitsQuery;
    
    // Process each habit with its category
    return Promise.all(habitsData.map(async ({ habit, category }) => {
      const { currentStreak } = await this.calculateStreaks(habit.id);
      
      // Check if habit is completed today
      const today = format(new Date(), 'yyyy-MM-dd');
      const [todayCompletion] = await db.select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, habit.id),
            sql`DATE(${habitCompletions.completedAt}) = ${today}`,
            eq(habitCompletions.completed, true)
          )
        );
      
      return {
        ...habit,
        category,
        currentStreak,
        completedToday: !!todayCompletion
      };
    }));
  }
  
  async getHabitWithCategory(id: number): Promise<HabitWithCategory | undefined> {
    // Get habit with its category
    const [habitData] = await db.select({
      habit: habits,
      category: categories
    })
    .from(habits)
    .leftJoin(categories, eq(habits.categoryId, categories.id))
    .where(eq(habits.id, id));
    
    if (!habitData) return undefined;
    
    const { habit, category } = habitData;
    const { currentStreak } = await this.calculateStreaks(habit.id);
    
    // Check if habit is completed today
    const today = format(new Date(), 'yyyy-MM-dd');
    const [todayCompletion] = await db.select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habit.id),
          sql`DATE(${habitCompletions.completedAt}) = ${today}`,
          eq(habitCompletions.completed, true)
        )
      );
    
    return {
      ...habit,
      category,
      currentStreak,
      completedToday: !!todayCompletion
    };
  }
  
  async calculateStreaks(habitId: number): Promise<{ currentStreak: number, longestStreak: number }> {
    // Get completed habit completions for this habit, ordered by date
    const completions = await db.select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          eq(habitCompletions.completed, true)
        )
      )
      .orderBy(desc(habitCompletions.completedAt));
    
    if (completions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakActive = true;
    
    // Check if the latest completion is today or yesterday
    const latestDate = new Date(completions[0].completedAt);
    
    if (!isToday(latestDate) && latestDate < subDays(new Date(), 1)) {
      currentStreakActive = false;
    }
    
    // Calculate streaks
    let tempStreak = 0;
    let prevDate: Date | null = null;
    
    completions.forEach(completion => {
      const completionDate = new Date(completion.completedAt);
      
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
      
      for (const habit of habits) {
        possibleCompletions++;
        
        const [completed] = await db.select()
          .from(habitCompletions)
          .where(
            and(
              eq(habitCompletions.habitId, habit.id),
              sql`DATE(${habitCompletions.completedAt}) = ${formattedDate}`,
              eq(habitCompletions.completed, true)
            )
          );
        
        if (completed) {
          totalCompletions++;
        }
      }
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

export const storage = new DatabaseStorage();
