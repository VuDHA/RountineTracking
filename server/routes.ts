import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, insertCategorySchema, insertHabitCompletionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { format } from "date-fns";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Error handling middleware
  const handleError = (res: Response, error: unknown) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error("API Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  };

  // Categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const parsed = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(parsed);
      res.status(201).json(category);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Habits
  app.get("/api/habits", async (_req: Request, res: Response) => {
    try {
      const habits = await storage.getHabitsWithCategories();
      res.json(habits);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/habits/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const habit = await storage.getHabitWithCategory(id);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(habit);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/habits", async (req: Request, res: Response) => {
    try {
      const parsed = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(parsed);
      res.status(201).json(habit);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/habits/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedHabit = await storage.updateHabit(id, req.body);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/habits/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHabit(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Habit Completions
  app.get("/api/habits/:id/completions", async (req: Request, res: Response) => {
    try {
      const habitId = parseInt(req.params.id);
      const completions = await storage.getHabitCompletions(habitId);
      res.json(completions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/habits/:id/completions", async (req: Request, res: Response) => {
    try {
      const habitId = parseInt(req.params.id);
      const parsed = insertHabitCompletionSchema.parse({
        ...req.body,
        habitId,
      });
      
      const completion = await storage.createHabitCompletion(parsed);
      res.status(201).json(completion);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Toggle habit completion for a specific date
  app.post("/api/habits/:id/toggle", async (req: Request, res: Response) => {
    try {
      const habitId = parseInt(req.params.id);
      const { date } = req.body;
      
      // Default to today if no date provided
      const dateToUse = date || format(new Date(), 'yyyy-MM-dd');
      
      const completion = await storage.toggleHabitCompletion(habitId, dateToUse);
      const habit = await storage.getHabitWithCategory(habitId);
      
      res.json({ completion, habit });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Completions by date
  app.get("/api/completions/date/:date", async (req: Request, res: Response) => {
    try {
      const date = req.params.date;
      const completions = await storage.getHabitCompletionsByDate(date);
      res.json(completions);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Statistics
  app.get("/api/statistics", async (_req: Request, res: Response) => {
    try {
      const statistics = await storage.getHabitStatistics();
      res.json(statistics);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
