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
  productId: text("product_id"), // Changed to text for demo compatibility
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
  userId: uuid("user_id").references(() => users.id), // Nullable for anonymous users
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

// Travel itineraries for 3D map discovery
export const travelItineraries = pgTable("travel_itineraries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  travelerId: text("traveler_id").notNull(), // For referencing traveler profiles
  fromCity: text("from_city").notNull(),
  toCity: text("to_city").notNull(),
  fromCountry: text("from_country").notNull(),
  toCountry: text("to_country").notNull(),
  fromCoordinates: jsonb("from_coordinates").notNull(), // [lat, lng]
  toCoordinates: jsonb("to_coordinates").notNull(), // [lat, lng]
  fromAirport: text("from_airport"), // IATA code (e.g., JFK)
  toAirport: text("to_airport"), // IATA code (e.g., CDG)
  departureDate: timestamp("departure_date").notNull(),
  arrivalDate: timestamp("arrival_date").notNull(),
  airline: text("airline"),
  flightNumber: text("flight_number"),
  maxCarryCapacity: decimal("max_carry_capacity", { precision: 5, scale: 2 }), // kg
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  availableForConnection: boolean("available_for_connection").default(true),
  connectionPurpose: text("connection_purpose").array().default(["social", "shopping", "sightseeing"]),
  travelNote: text("travel_note"),
  status: text("status").notNull().default("upcoming"), // upcoming, traveling, completed, cancelled
  trustScore: integer("trust_score").default(100),
  verificationStatus: text("verification_status").default("pending"), // pending, verified, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User locations for map centering
export const userLocations = pgTable("user_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  city: text("city").notNull(),
  country: text("country").notNull(),
  coordinates: jsonb("coordinates").notNull(), // [lat, lng]
  timezone: text("timezone"),
  isPrimary: boolean("is_primary").default(true),
  detectionMethod: text("detection_method").default("manual"), // manual, ip, gps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Connection requests between users and travelers
export const connectionRequests = pgTable("connection_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  requesterId: uuid("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  travelerId: uuid("traveler_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itineraryId: uuid("itinerary_id").notNull().references(() => travelItineraries.id, { onDelete: "cascade" }),
  connectionType: text("connection_type").notNull(), // social, shopping, delivery, meetup
  message: text("message"),
  proposedMeeting: jsonb("proposed_meeting"), // {location, time, purpose}
  status: text("status").notNull().default("pending"), // pending, accepted, declined, completed
  responseMessage: text("response_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Airport data for map layers
export const airports = pgTable("airports", {
  id: uuid("id").primaryKey().defaultRandom(),
  iataCode: text("iata_code").notNull().unique(),
  icaoCode: text("icao_code"),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  coordinates: jsonb("coordinates").notNull(), // [lat, lng]
  elevation: integer("elevation"), // in feet
  timezone: text("timezone"),
  isInternational: boolean("is_international").default(true),
  passengerVolume: integer("passenger_volume"), // annual passengers
  runwayCount: integer("runway_count"),
  createdAt: timestamp("created_at").defaultNow(),
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
export const insertTravelItinerarySchema = createInsertSchema(travelItineraries);
export const selectTravelItinerarySchema = createSelectSchema(travelItineraries);
export const insertUserLocationSchema = createInsertSchema(userLocations);
export const selectUserLocationSchema = createSelectSchema(userLocations);
export const insertConnectionRequestSchema = createInsertSchema(connectionRequests);
export const selectConnectionRequestSchema = createSelectSchema(connectionRequests);
export const insertAirportSchema = createInsertSchema(airports);
export const selectAirportSchema = createSelectSchema(airports);

// Add marketplace tables for seed data
import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum('user_role', ['general', 'business', 'traveler', 'merchant', 'shopper']);
export const requestStatusEnum = pgEnum('request_status', ['open', 'matched', 'delivered']);
export const escrowStateEnum = pgEnum('escrow_state', ['held', 'released', 'disputed']);

// Marketplace seed tables
export const marketplaceUsers = pgTable("marketplace_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  role: userRoleEnum("role").notNull(),
  trustScore: integer("trust_score").default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceProducts = pgTable("marketplace_products", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").references(() => marketplaceUsers.id).notNull(),
  title: text("title").notNull(),
  priceUsd: integer("price_usd").notNull(),
  city: text("city").notNull(),
  stock: integer("stock").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceTrips = pgTable("marketplace_trips", {
  id: text("id").primaryKey(),
  travelerId: text("traveler_id").references(() => marketplaceUsers.id).notNull(),
  fromCity: text("from_city").notNull(),
  toCity: text("to_city").notNull(),
  departUtc: timestamp("depart_utc").notNull(),
  capacityKg: integer("capacity_kg").default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceRequests = pgTable("marketplace_requests", {
  id: text("id").primaryKey(),
  shopperId: text("shopper_id").references(() => marketplaceUsers.id).notNull(),
  productId: text("product_id").references(() => marketplaceProducts.id).notNull(),
  qty: integer("qty").default(1),
  status: requestStatusEnum("status").default('open'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceMatches = pgTable("marketplace_matches", {
  id: text("id").primaryKey(),
  requestId: text("request_id").references(() => marketplaceRequests.id).notNull(),
  tripId: text("trip_id").references(() => marketplaceTrips.id).notNull(),
  escrowId: text("escrow_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceEscrows = pgTable("marketplace_escrows", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  currency: text("currency").default('USD'),
  state: escrowStateEnum("state").default('held'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User music tracks table
export const userTracks = pgTable("user_tracks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  filePath: text("file_path").notNull(), // Path to stored file
  duration: integer("duration"), // Duration in seconds
  isActive: boolean("is_active").default(false), // Currently playing track
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
export type TravelItinerary = z.infer<typeof selectTravelItinerarySchema>;
export type InsertTravelItinerary = z.infer<typeof insertTravelItinerarySchema>;
export type UserLocation = z.infer<typeof selectUserLocationSchema>;
export type InsertUserLocation = z.infer<typeof insertUserLocationSchema>;
export type ConnectionRequest = z.infer<typeof selectConnectionRequestSchema>;
export type InsertConnectionRequest = z.infer<typeof insertConnectionRequestSchema>;
export type Airport = z.infer<typeof selectAirportSchema>;
export type InsertAirport = z.infer<typeof insertAirportSchema>;

// User tracks schemas
export const insertUserTrackSchema = createInsertSchema(userTracks);
export const selectUserTrackSchema = createSelectSchema(userTracks);

// Marketplace types
export type MarketplaceUser = typeof marketplaceUsers.$inferSelect;
export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type MarketplaceTrip = typeof marketplaceTrips.$inferSelect;
export type UserTrack = z.infer<typeof selectUserTrackSchema>;
export type InsertUserTrack = z.infer<typeof insertUserTrackSchema>;
