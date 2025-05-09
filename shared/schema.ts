import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const walletConnections = pgTable("wallet_connections", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  chainId: integer("chain_id").notNull(),
  subAccountAddress: text("sub_account_address"),
  lastConnected: timestamp("last_connected").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  hash: text("hash").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  value: text("value").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull(), // pending, success, failed
});

export const spendPermissions = pgTable("spend_permissions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  account: text("account").notNull(),
  spender: text("spender").notNull(),
  token: text("token").notNull(),
  allowance: text("allowance").notNull(),
  period: integer("period").notNull(),
  start: integer("start").notNull(),
  end: integer("end").notNull(),
  salt: text("salt").notNull(),
  extraData: text("extra_data").notNull(),
  signature: text("signature").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWalletConnectionSchema = createInsertSchema(walletConnections).pick({
  address: true,
  chainId: true,
  subAccountAddress: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  walletId: true,
  hash: true,
  from: true,
  to: true,
  value: true,
  status: true,
});

export const insertSpendPermissionSchema = createInsertSchema(spendPermissions).pick({
  walletId: true,
  account: true,
  spender: true,
  token: true,
  allowance: true,
  period: true,
  start: true,
  end: true,
  salt: true,
  extraData: true,
  signature: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWalletConnection = z.infer<typeof insertWalletConnectionSchema>;
export type WalletConnection = typeof walletConnections.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertSpendPermission = z.infer<typeof insertSpendPermissionSchema>;
export type SpendPermission = typeof spendPermissions.$inferSelect;

// Validation schema for collecting subscription
export const collectSubscriptionSchema = z.object({
  spendPermission: z.object({
    account: z.string(),
    spender: z.string(),
    token: z.string(),
    allowance: z.union([z.string(), z.bigint()]),
    period: z.union([z.number(), z.bigint()]),
    start: z.union([z.number(), z.bigint()]),
    end: z.union([z.number(), z.bigint()]),
    salt: z.union([z.bigint(), z.string()]),
    extraData: z.string(),
  }),
  signature: z.string(),
  dummyData: z.number().optional(),
});

export type CollectSubscription = z.infer<typeof collectSubscriptionSchema>;
