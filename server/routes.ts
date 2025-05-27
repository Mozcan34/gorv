import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tasks with optional filtering
  app.get("/api/tasks", async (req, res) => {
    try {
      const { status, priority, search } = req.query;

      let tasks;
      if (search && typeof search === "string") {
        tasks = await storage.searchTasks(search);
      } else if (status && typeof status === "string") {
        tasks = await storage.getTasksByStatus(status);
      } else if (priority && typeof priority === "string") {
        tasks = await storage.getTasksByPriority(priority);
      } else {
        tasks = await storage.getAllTasks();
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Görevler yüklenirken hata oluştu" });
    }
  });

  // Get task by ID
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz görev ID" });
      }

      const task = await storage.getTaskById(id);
      if (!task) {
        return res.status(404).json({ message: "Görev bulunamadı" });
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Görev yüklenirken hata oluştu" });
    }
  });

  // Create new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Görev oluşturulurken hata oluştu" });
    }
  });

  // Update task
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz görev ID" });
      }

      const validatedData = updateTaskSchema.parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      
      if (!task) {
        return res.status(404).json({ message: "Görev bulunamadı" });
      }

      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Geçersiz veri", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Görev güncellenirken hata oluştu" });
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz görev ID" });
      }

      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Görev bulunamadı" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Görev silinirken hata oluştu" });
    }
  });

  // Get task statistics
  app.get("/api/tasks/stats", async (req, res) => {
    try {
      const allTasks = await storage.getAllTasks();
      
      const stats = {
        total: allTasks.length,
        open: allTasks.filter(t => t.status === "open").length,
        inProgress: allTasks.filter(t => t.status === "progress").length,
        completed: allTasks.filter(t => t.status === "completed").length,
        overdue: allTasks.filter(t => 
          t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed"
        ).length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "İstatistikler yüklenirken hata oluştu" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
