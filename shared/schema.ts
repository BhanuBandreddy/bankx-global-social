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

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  location: text("location").notNull(),
  coordinates: jsonb("coordinates"), // [lat, lng]
  category: text("category").notNull(),
  images: jsonb("images").default([]),
  deliveryOptions: jsonb("delivery_options").default(["instore", "merchant-ship"]),
  trustGuarantee: boolean("trust_guarantee").default(false),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feed posts table
export const feedPosts = pgTable("feed_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  location: text("location"),
  tags: jsonb("tags").default([]),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  trustBoosts: integer("trust_boosts").default(0),
  aiInsight: text("ai_insight"),
  trustInsight: text("trust_insight"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Escrow transactions
export const escrowTransactions = pgTable("escrow_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  buyerId: uuid("buyer_id").references(() => users.id),
  sellerId: uuid("seller_id").references(() => users.id),
  productId: uuid("product_id").references(() => products.id),
  feedPostId: uuid("feed_post_id").references(() => feedPosts.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("x402"),
  x402PaymentId: text("x402_payment_id"),
  escrowAddress: text("escrow_address"),
  deliveryOption: text("delivery_option"), // instore, merchant-ship, peer-delivery
  deliveryData: jsonb("delivery_data").default({}),
  releaseConditions: jsonb("release_conditions").default({}),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery options table
export const deliveryOptions = pgTable("delivery_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  escrowId: uuid("escrow_id").notNull().references(() => escrowTransactions.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // instore, merchant-ship, peer-delivery
  status: text("status").notNull().default("pending"),
  providerId: uuid("provider_id").references(() => users.id), // merchant or traveler
  details: jsonb("details").default({}),
  fee: decimal("fee", { precision: 10, scale: 2 }),
  estimatedDelivery: timestamp("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Travelers table for peer delivery
export const travelers = pgTable("travelers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  route: text("route").notNull(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  departureDate: timestamp("departure_date").notNull(),
  arrivalDate: timestamp("arrival_date").notNull(),
  maxWeight: text("max_weight"),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages for merchant communication
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  escrowId: uuid("escrow_id").notNull().references(() => escrowTransactions.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id),
  receiverId: uuid("receiver_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // text, image, location
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
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
  sessionId: text("session_id").default('default-session'),
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
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertFeedPostSchema = createInsertSchema(feedPosts);
export const selectFeedPostSchema = createSelectSchema(feedPosts);
export const insertEscrowTransactionSchema = createInsertSchema(escrowTransactions);
export const selectEscrowTransactionSchema = createSelectSchema(escrowTransactions);
export const insertDeliveryOptionSchema = createInsertSchema(deliveryOptions);
export const selectDeliveryOptionSchema = createSelectSchema(deliveryOptions);
export const insertTravelerSchema = createInsertSchema(travelers);
export const selectTravelerSchema = createSelectSchema(travelers);
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const selectChatMessageSchema = createSelectSchema(chatMessages);

export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = z.infer<typeof selectProfileSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Product = z.infer<typeof selectProductSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type FeedPost = z.infer<typeof selectFeedPostSchema>;
export type InsertFeedPost = z.infer<typeof insertFeedPostSchema>;
export type EscrowTransaction = z.infer<typeof selectEscrowTransactionSchema>;
export type InsertEscrowTransaction = z.infer<typeof insertEscrowTransactionSchema>;
export type DeliveryOption = z.infer<typeof selectDeliveryOptionSchema>;
export type InsertDeliveryOption = z.infer<typeof insertDeliveryOptionSchema>;
export type Traveler = z.infer<typeof selectTravelerSchema>;
export type InsertTraveler = z.infer<typeof insertTravelerSchema>;
export type ChatMessage = z.infer<typeof selectChatMessageSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
