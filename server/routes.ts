import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signUp, signIn, getUser, authMiddleware, AuthenticatedRequest } from "./auth";
import { db, escrowTransactions, paymentEvents, blinkConversations, blinkWorkflows, blinkNotifications } from "./db";
import { products, feedPosts, deliveryOptions, travelers, chatMessages, users, profiles } from "../shared/schema";
import { insertProductSchema, insertFeedPostSchema, insertDeliveryOptionSchema, insertTravelerSchema, insertChatMessageSchema } from "../shared/schema";
import { eq, and, desc, asc, ilike } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", signUp);
  app.post("/api/auth/signin", signIn);
  app.get("/api/auth/user", authMiddleware, getUser);

  // Global Feed API
  app.get("/api/feed", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const feedData = await db.select({
        id: feedPosts.id,
        userId: feedPosts.userId,
        content: feedPosts.content,
        imageUrl: feedPosts.imageUrl,
        location: feedPosts.location,
        tags: feedPosts.tags,
        likes: feedPosts.likes,
        comments: feedPosts.comments,
        shares: feedPosts.shares,
        trustBoosts: feedPosts.trustBoosts,
        aiInsight: feedPosts.aiInsight,
        trustInsight: feedPosts.trustInsight,
        createdAt: feedPosts.createdAt,
        user: {
          id: users.id,
          name: profiles.fullName,
          trustScore: profiles.trustScore,
          level: profiles.level,
          location: profiles.location
        },
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          currency: products.currency,
          trustGuarantee: products.trustGuarantee
        }
      })
      .from(feedPosts)
      .leftJoin(users, eq(feedPosts.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.id))
      .leftJoin(products, eq(feedPosts.productId, products.id))
      .orderBy(desc(feedPosts.createdAt))
      .limit(20);

      res.json({ success: true, posts: feedData });
    } catch (error) {
      console.error("Feed fetch error:", error);
      res.status(500).json({ error: "Failed to fetch feed" });
    }
  });

  // Products API
  app.get("/api/products", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { location, category } = req.query;
      
      let whereConditions = [eq(products.status, "active")];
      
      if (location) {
        whereConditions.push(ilike(products.location, `%${location}%`));
      }
      if (category) {
        whereConditions.push(eq(products.category, category as string));
      }

      const productList = await db.select().from(products)
        .where(and(...whereConditions))
        .limit(50);
        
      res.json({ success: true, products: productList });
    } catch (error) {
      console.error("Products fetch error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Escrow and payment routes - Enhanced
  app.post("/api/escrow/initiate", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { productId, feedPostId, amount, currency = "USD", sellerId, deliveryOption } = req.body;
      const userId = req.user!.id;

      // Validate required fields
      if (!productId || !amount || !sellerId) {
        return res.status(400).json({ error: 'Missing required fields: productId, amount, sellerId' });
      }

      // Ensure amount is a valid number
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Invalid amount format' });
      }

      console.log('Creating escrow transaction with:', {
        userId,
        sellerId,
        productId,
        amount: numericAmount,
        currency,
        deliveryOption
      });

      const transaction = await db.insert(escrowTransactions).values({
        userId,
        buyerId: userId,
        sellerId,
        productId,
        feedPostId: feedPostId || null,
        amount: numericAmount,
        currency,
        status: "escrowed",
        paymentMethod: "x402",
        deliveryOption: deliveryOption || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }).returning();

      // Log the event
      await db.insert(paymentEvents).values({
        transactionId: transaction[0].id,
        eventType: "escrow_initiated",
        eventData: { productId, amount, currency, deliveryOption },
      });

      res.json({ success: true, transaction: transaction[0] });
    } catch (error) {
      console.error("Escrow initiation error:", error);
      res.status(500).json({ error: "Failed to initiate escrow" });
    }
  });

  app.post("/api/escrow/release", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { transactionId, confirmationCode } = req.body;
      const userId = req.user!.id;

      // Verify ownership and update status
      const result = await db.update(escrowTransactions)
        .set({ status: "released", updatedAt: new Date() })
        .where(and(
          eq(escrowTransactions.id, transactionId),
          eq(escrowTransactions.userId, userId),
          eq(escrowTransactions.status, "escrowed")
        ))
        .returning();

      if (!result[0]) {
        return res.status(404).json({ error: "Transaction not found or cannot be released" });
      }

      // Log the event
      await db.insert(paymentEvents).values({
        transactionId,
        eventType: "escrow_released",
        eventData: { confirmationCode, releasedBy: userId },
      });

      res.json({ success: true, message: "Escrow released successfully" });
    } catch (error) {
      console.error("Escrow release error:", error);
      res.status(500).json({ error: "Failed to release escrow" });
    }
  });

  app.get("/api/escrow/:id/status", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const transaction = await db.select()
        .from(escrowTransactions)
        .where(and(
          eq(escrowTransactions.id, id),
          eq(escrowTransactions.userId, userId)
        ))
        .limit(1);

      if (!transaction[0]) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const events = await db.select()
        .from(paymentEvents)
        .where(eq(paymentEvents.transactionId, id))
        .orderBy(desc(paymentEvents.createdAt));

      res.json({ success: true, escrow: transaction[0], events });
    } catch (error) {
      console.error("Escrow status error:", error);
      res.status(500).json({ error: "Failed to get escrow status" });
    }
  });

  // Delivery Options API
  app.get("/api/delivery-options/:escrowId", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { escrowId } = req.params;
      
      const options = await db.select().from(deliveryOptions)
        .where(eq(deliveryOptions.escrowId, escrowId));
      
      res.json({ success: true, options });
    } catch (error) {
      console.error("Delivery options fetch error:", error);
      res.status(500).json({ error: "Failed to fetch delivery options" });
    }
  });

  app.post("/api/delivery-options", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const optionData = insertDeliveryOptionSchema.parse(req.body);
      const newOption = await db.insert(deliveryOptions).values(optionData).returning();
      
      res.json({ success: true, option: newOption[0] });
    } catch (error) {
      console.error("Delivery option creation error:", error);
      res.status(500).json({ error: "Failed to create delivery option" });
    }
  });

  // Travelers API for peer delivery
  app.get("/api/travelers/available", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { fromLocation, toLocation } = req.query;
      
      let whereConditions = [eq(travelers.status, "available")];
      
      if (fromLocation) {
        whereConditions.push(ilike(travelers.fromLocation, `%${fromLocation}%`));
      }
      if (toLocation) {
        whereConditions.push(ilike(travelers.toLocation, `%${toLocation}%`));
      }

      const availableTravelers = await db.select({
        id: travelers.id,
        userId: travelers.userId,
        user: {
          name: profiles.fullName,
          trustScore: profiles.trustScore
        },
        route: travelers.route,
        fromLocation: travelers.fromLocation,
        toLocation: travelers.toLocation,
        departureDate: travelers.departureDate,
        arrivalDate: travelers.arrivalDate,
        maxWeight: travelers.maxWeight,
        deliveryFee: travelers.deliveryFee,
        status: travelers.status
      })
      .from(travelers)
      .leftJoin(users, eq(travelers.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.id))
      .where(and(...whereConditions))
      .limit(20);
      
      res.json({ success: true, travelers: availableTravelers });
    } catch (error) {
      console.error("Travelers fetch error:", error);
      res.status(500).json({ error: "Failed to fetch travelers" });
    }
  });

  // Chat API for merchant communication
  app.get("/api/chat/:escrowId", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { escrowId } = req.params;
      
      const messages = await db.select().from(chatMessages)
        .where(eq(chatMessages.escrowId, escrowId))
        .orderBy(asc(chatMessages.createdAt));
      
      res.json({ success: true, messages });
    } catch (error) {
      console.error("Chat fetch error:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/:escrowId", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { escrowId } = req.params;
      const { receiverId, message, messageType = "text" } = req.body;
      const senderId = req.user!.id;
      
      const chatData = {
        escrowId,
        senderId,
        receiverId,
        message,
        messageType
      };
      
      const newMessage = await db.insert(chatMessages).values(chatData).returning();
      res.json({ success: true, message: newMessage[0] });
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Blink AI routes
  app.post("/api/blink/conversation", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { message, query, sessionId = `session-${Date.now()}`, contextType, feedContext } = req.body;
      const userId = req.user!.id;
      const userMessage = message || query;

      // Save conversation
      await db.insert(blinkConversations).values({
        userId,
        sessionId,
        messageType: "user",
        speaker: "User",
        content: userMessage,
        contextData: { contextType, feedContext },
      });

      // Mock AI response for now
      const aiResponse = `I understand your request: "${userMessage}". I'm here to help with your trust network and logistics needs.`;

      await db.insert(blinkConversations).values({
        userId,
        sessionId,
        messageType: "agent",
        speaker: "PathSync",
        content: aiResponse,
        contextData: { contextType, feedContext },
      });

      res.json({
        success: true,
        finalAnswer: aiResponse,
        conversation: [
          { speaker: "User", content: query, emoji: "👤" },
          { speaker: "PathSync", content: aiResponse, emoji: "⚡" }
        ]
      });
    } catch (error) {
      console.error("Blink conversation error:", error);
      res.status(500).json({ error: "Failed to process conversation" });
    }
  });

  // NANDA agent discovery
  app.post("/api/nanda", async (req, res) => {
    try {
      const { path } = req.body;

      if (path === "/health") {
        return res.json({ ok: true, timestamp: new Date().toISOString() });
      }

      if (path.startsWith("/discover")) {
        const mockAgents = [
          {
            id: "agent-001",
            name: "GlobeGuides™ Concierge",
            tagline: "Turns every trip into home-turf.",
            description: "Builds & syncs your itinerary, auto-books locals' picks, nudges you on visas, weather, and last-mile tips—all via NANDA agents.",
            capabilities: ["itinerary_building", "local_booking", "visa_alerts", "weather_tracking", "travel_concierge"],
            status: "active",
            version: "1.2.0",
            endpoint: "https://globeguides-concierge.nanda.ai/api/v1",
            region: "Singapore",
            performance_score: 98.5,
            last_updated: "2024-01-15T10:30:00Z",
            icon: "globe-2"
          },
          {
            id: "agent-002",
            name: "TrustPay Orchestrator",
            tagline: "Payments that release themselves.",
            description: "Runs conversational escrow, FX, SLA timers and merchant chats; funds unlock only when both sides thumbs-up.",
            capabilities: ["conversational_escrow", "fx_handling", "sla_timers", "merchant_chat", "payment_orchestration"],
            status: "active",
            version: "2.1.3",
            endpoint: "https://trustpay-orchestrator.nanda.ai/api/v1",
            region: "Tokyo",
            performance_score: 96.2,
            last_updated: "2024-01-14T15:45:00Z",
            icon: "lock-keyhole"
          }
        ];

        return res.json(mockAgents);
      }

      res.status(404).json({ error: "Route not found", path });
    } catch (error) {
      console.error("NANDA API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
