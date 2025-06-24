import { pgTable, text, serial, integer, boolean, uuid, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - simplified from auth.users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  username: text("username").unique(),
  fullName: text("full_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  trustScore: integer("trust_score").default(100),
  level: text("level").default("Trust Newbie"),
  trustPoints: integer("trust_points").default(0),
  userLevel: integer("user_level").default(1),
  badges: jsonb("badges").default([]),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Escrow transactions
export const escrowTransactions = pgTable("escrow_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  buyerId: uuid("buyer_id").references(() => users.id),
  sellerId: uuid("seller_id").references(() => users.id),
  productId: text("product_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("x402"),
  x402PaymentId: text("x402_payment_id"),
  escrowAddress: text("escrow_address"),
  releaseConditions: jsonb("release_conditions").default({}),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment events
export const paymentEvents = pgTable("payment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").notNull().references(() => escrowTransactions.id, { onDelete: "cascade" }),
  paymentId: text("payment_id").unique(),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blink conversations
export const blinkConversations = pgTable("blink_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  sessionId: text("session_id").notNull(),
  messageType: text("message_type").notNull(),
  speaker: text("speaker").notNull(),
  content: text("content").notNull(),
  contextData: jsonb("context_data").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Blink workflows
export const blinkWorkflows = pgTable("blink_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  workflowType: text("workflow_type").notNull(),
  status: text("status").notNull().default("pending"),
  contextData: jsonb("context_data").notNull().default({}),
  feedPostId: text("feed_post_id"),
  agentResponses: jsonb("agent_responses").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blink notifications
export const blinkNotifications = pgTable("blink_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  workflowId: uuid("workflow_id").references(() => blinkWorkflows.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);
export const insertEscrowTransactionSchema = createInsertSchema(escrowTransactions);
export const selectEscrowTransactionSchema = createSelectSchema(escrowTransactions);

export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = z.infer<typeof selectProfileSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type EscrowTransaction = z.infer<typeof selectEscrowTransactionSchema>;
export type InsertEscrowTransaction = z.infer<typeof insertEscrowTransactionSchema>;
