import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTaskSchema = insertTaskSchema.partial();

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Validation schemas for frontend forms
export const taskFormSchema = insertTaskSchema.extend({
  title: z.string().min(1, "İş başlığı gereklidir").max(255, "İş başlığı çok uzun"),
  description: z.string().optional(),
  status: z.enum(["open", "progress", "completed"], {
    errorMap: () => ({ message: "Geçerli bir durum seçin" }),
  }),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Geçerli bir öncelik seçin" }),
  }),
  dueDate: z.date().optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
