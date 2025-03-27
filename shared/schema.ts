import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  frequency: text("frequency").notNull().default("daily"),
  reminderTime: text("reminder_time"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  name: true,
  description: true,
  categoryId: true,
  frequency: true,
  reminderTime: true,
  userId: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").references(() => habits.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  completedAt: date("completed_at").notNull(),
  completed: boolean("completed").notNull().default(true),
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).pick({
  habitId: true,
  userId: true,
  completedAt: true,
  completed: true,
});

export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;

export const habitWithCategory = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  categoryId: z.number().nullable(),
  frequency: z.string(),
  reminderTime: z.string().nullable(),
  userId: z.number().nullable(),
  createdAt: z.date(),
  category: z.object({
    id: z.number(),
    name: z.string(),
    color: z.string(),
  }).nullable(),
  currentStreak: z.number(),
  completedToday: z.boolean(),
});

export type HabitWithCategory = z.infer<typeof habitWithCategory>;

export const habitStatistics = z.object({
  completionRate: z.number(),
  longestStreak: z.number(),
  currentStreak: z.number(),
  totalHabits: z.number(),
  completedToday: z.number(),
});

export type HabitStatistics = z.infer<typeof habitStatistics>;
