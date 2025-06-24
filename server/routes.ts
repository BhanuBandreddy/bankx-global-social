import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signUp, signIn, getUser, authMiddleware, AuthenticatedRequest } from "./auth";
import { db, escrowTransactions, paymentEvents, blinkConversations, blinkWorkflows, blinkNotifications } from "./db";
import { eq, and, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", signUp);
  app.post("/api/auth/signin", signIn);
  app.get("/api/auth/user", authMiddleware, getUser);

  // Escrow and payment routes
  app.post("/api/escrow/initiate", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { productId, amount, currency = "USD", sellerId } = req.body;
      const userId = req.user!.id;

      const transaction = await db.insert(escrowTransactions).values({
        userId,
        buyerId: userId,
        sellerId,
        productId,
        amount,
        currency,
        status: "escrowed",
        paymentMethod: "x402",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }).returning();

      // Log the event
      await db.insert(paymentEvents).values({
        transactionId: transaction[0].id,
        eventType: "escrow_initiated",
        eventData: { productId, amount, currency },
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

  // Blink AI routes
  app.post("/api/blink/conversation", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { query, sessionId, contextType, feedContext } = req.body;
      const userId = req.user!.id;

      // Save conversation
      await db.insert(blinkConversations).values({
        userId,
        sessionId,
        messageType: "user",
        speaker: "User",
        content: query,
        contextData: { contextType, feedContext },
      });

      // Mock AI response for now
      const aiResponse = `I understand your request: "${query}". I'm here to help with your trust network and logistics needs.`;

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
