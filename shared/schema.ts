import { pgTable, serial, varchar, text, date, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Parent users table for account owners (parents)
export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  name: text("name"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentsRelations = relations(parents, ({ many }) => ({
  children: many(children),
  tasks: many(tasks),
}));

export const insertParentSchema = createInsertSchema(parents).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  walletAddress: true,
});

// Children table for sub-accounts (children)
export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => parents.id).notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  walletAddress: text("wallet_address"),
  allowanceBalance: integer("allowance_balance").default(0), // In cents
  spendLimit: integer("spend_limit").default(1000), // In cents per day
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const childrenRelations = relations(children, ({ one, many }) => ({
  parent: one(parents, {
    fields: [children.parentId],
    references: [parents.id],
  }),
  tasks: many(tasks),
}));

export const insertChildSchema = createInsertSchema(children).pick({
  parentId: true,
  username: true,
  password: true,
  name: true,
  walletAddress: true,
  allowanceBalance: true,
  spendLimit: true,
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => parents.id).notNull(),
  childId: integer("child_id").references(() => children.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  rewardAmount: integer("reward_amount").notNull(), // In cents
  status: text("status").default("pending"), // pending, completed, approved, rejected
  proofImageUrl: text("proof_image_url"),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  parent: one(parents, {
    fields: [tasks.parentId],
    references: [parents.id],
  }),
  child: one(children, {
    fields: [tasks.childId],
    references: [children.id],
  }),
}));

export const insertTaskSchema = createInsertSchema(tasks).pick({
  parentId: true,
  childId: true,
  title: true,
  description: true,
  rewardAmount: true,
  status: true,
  dueDate: true,
});

// Transactions table for allowance spending
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").references(() => children.id).notNull(),
  amount: integer("amount").notNull(), // In cents, negative for spending
  description: text("description").notNull(),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  child: one(children, {
    fields: [transactions.childId],
    references: [children.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  childId: true,
  amount: true,
  description: true,
  transactionHash: true,
});

// We keep the legacy users table for backward compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Export types for use in the application
export type Parent = typeof parents.$inferSelect;
export type InsertParent = z.infer<typeof insertParentSchema>;

export type Child = typeof children.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
