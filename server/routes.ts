import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, insertCategorySchema, insertHabitCompletionSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { format } from "date-fns";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Middleware to ensure user is authenticated
  const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };
  
  // API Error handling middleware
  const handleError = (res: Response, error: unknown) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error("API Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  };



  // Habits
  app.get("/api/habits", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const habits = await storage.getHabitsWithCategories(userId);
      res.json(habits);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/habits/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const habit = await storage.getHabitWithCategory(id);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      // Check if the habit belongs to the current user
      if (habit.userId !== (req.user as Express.User).id) {
        return res.status(403).json({ message: "You don't have permission to view this habit" });
      }
      
      res.json(habit);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Habit Completions
  app.get("/api/habits/:id/completions", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const habitId = parseInt(req.params.id);
      
      // Check that the habit belongs to the current user
      const habit = await storage.getHabit(habitId);
      if (!habit || habit.userId !== (req.user as Express.User).id) {
        return res.status(403).json({ message: "You don't have permission to view this habit's completions" });
      }
      
      const completions = await storage.getHabitCompletions(habitId);
      res.json(completions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/habits/:id/completions", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const habitId = parseInt(req.params.id);
      
      // Check that the habit belongs to the current user
      const habit = await storage.getHabit(habitId);
      if (!habit || habit.userId !== (req.user as Express.User).id) {
        return res.status(403).json({ message: "You don't have permission to add completions to this habit" });
      }
      
      const parsed = insertHabitCompletionSchema.parse({
        ...req.body,
        habitId,
        userId: (req.user as Express.User).id
      });
      
      const completion = await storage.createHabitCompletion(parsed);
      res.status(201).json(completion);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Toggle habit completion for a specific date
  app.post("/api/habits/:id/toggle", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const habitId = parseInt(req.params.id);
      const { date } = req.body;
      const userId = (req.user as Express.User).id;
      
      // Check that the habit belongs to the current user
      const habit = await storage.getHabit(habitId);
      if (!habit || habit.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to toggle this habit" });
      }
      
      // Default to today if no date provided
      const dateToUse = date || format(new Date(), 'yyyy-MM-dd');
      
      const completion = await storage.toggleHabitCompletion(habitId, dateToUse, userId);
      const habitWithCategory = await storage.getHabitWithCategory(habitId);
      
      res.json({ completion, habit: habitWithCategory });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Completions by date
  app.get("/api/completions/date/:date", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const date = req.params.date;
      const userId = (req.user as Express.User).id;
      
      // Modified to get completions only for the current user
      const completions = await storage.getHabitCompletionsByDate(date, userId);
      res.json(completions);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Statistics
  app.get("/api/statistics", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const statistics = await storage.getHabitStatistics(userId);
      res.json(statistics);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Categories endpoint
  app.get("/api/categories", ensureAuthenticated, async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/categories", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as Express.User).id;
      const parsed = insertCategorySchema.parse({
        ...req.body,
        userId
      });
      const category = await storage.createCategory(parsed);
      res.status(201).json(category);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
