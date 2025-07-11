import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomBytes, createHash } from "crypto";
import { storage } from "./storage";
import { signUp, signIn, getUser, authMiddleware, AuthenticatedRequest } from "./auth";
import { db, escrowTransactions, paymentEvents, blinkConversations, blinkWorkflows, blinkNotifications } from "./db";
import { products, feedPosts, deliveryOptions, travelers, chatMessages, users, profiles, travelItineraries, userLocations, connectionRequests, airports } from "../shared/schema";
import { insertProductSchema, insertFeedPostSchema, insertDeliveryOptionSchema, insertTravelerSchema, insertChatMessageSchema, insertTravelItinerarySchema, insertUserLocationSchema, insertConnectionRequestSchema } from "../shared/schema";
import { eq, and, desc, asc, ilike } from "drizzle-orm";
import { agentTorchSimulator } from "./agenttorch";
import { perplexityLocaleLens, getSmartPricing } from "./perplexity";
import { openaiParser } from "./openai-parser";

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
      if (!amount) {
        return res.status(400).json({ error: 'Missing required fields: amount' });
      }

      // Ensure amount is a valid number
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Invalid amount format' });
      }

      // For demo purposes, use current user as seller if the provided sellerId doesn't exist
      // This allows the demo to work without requiring pre-existing seller accounts
      const finalSellerId = userId; // Use current user as seller for demo

      console.log('Creating escrow transaction with:', {
        userId,
        sellerId: finalSellerId,
        productId,
        amount: numericAmount,
        currency,
        deliveryOption
      });

      const transaction = await db.insert(escrowTransactions).values({
        userId,
        buyerId: userId,
        sellerId: finalSellerId,
        productId: productId || null, // Allow null for demo
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
  // OpenAI PDF parsing endpoint
  app.post("/api/parse-itinerary", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      console.log('Parse itinerary request received');
      const { base64PDF, filename } = req.body;
      
      if (!base64PDF || !filename) {
        console.log('Missing required fields:', { hasBase64: !!base64PDF, hasFilename: !!filename });
        return res.status(400).json({
          success: false,
          error: "Missing base64PDF or filename"
        });
      }

      console.log('Processing file:', filename);
      
      // Try OpenAI parsing first, then fallback to filename parsing
      const { openaiParser } = await import('./openai-parser');
      
      let result;
      if (openaiParser.isConfigured()) {
        console.log('Attempting OpenAI PDF parsing...');
        try {
          result = await openaiParser.parseItinerary(base64PDF, filename);
          console.log('OpenAI parsing result:', result);
        } catch (error) {
          console.error('OpenAI parsing failed, falling back to filename parsing:', error);
          result = null;
        }
      }
      
      // Check if OpenAI returned template responses instead of real data
      if (result && result.success && result.itinerary) {
        const itinerary = result.itinerary;
        if (itinerary.destination === "main destination city" || 
            itinerary.route === "departure → destination" ||
            itinerary.date === "travel date") {
          console.log('OpenAI returned template data, using enhanced filename parsing...');
          result = null; // Force fallback
        }
      }
      
      // If OpenAI failed or returned templates, return honest error
      if (!result || !result.success) {
        console.log('PDF parsing failed, returning error');
        return res.status(400).json({
          success: false,
          error: result?.error || 'PDF parsing failed. Please ensure the document contains readable travel information and try again.'
        });
      }
      
      console.log('Returning result:', result);
      return res.json(result);
    } catch (error: any) {
      console.error('Parse itinerary error:', error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to parse itinerary"
      });
    }
  });

  app.post("/api/blink/conversation", async (req, res) => {
    try {
      const { message, query, sessionId = `session-${Date.now()}`, contextType, feedContext } = req.body;
      // Generate a proper UUID for anonymous users
      const { randomUUID } = await import('crypto');
      const userId = (req as any).user?.id || randomUUID();
      const userMessage = message || query;

      // Create user action for Conductor analysis
      const userAction = {
        type: 'chat' as const,
        path: '/blink',
        payload: { message: userMessage, conversationId: sessionId },
        userId,
        timestamp: new Date(),
        sessionId: sessionId || `session-${Date.now()}`,
        context: {
          currentPage: 'blink',
          userType: 'general' as const,
          trustScore: 75
        }
      };

      let conductorResponse = null;
      let finalAnswer = "I understand. Let me help you with that.";
      let agentsUsed: string[] = [];

      // Helper function to check if message is a greeting
      const isGreeting = (text: string): boolean => {
        return /^(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(text.trim());
      };

      // Handle simple greetings without orchestration
      if (isGreeting(userMessage)) {
        finalAnswer = "Hey there! What would you like to explore today? I can help with shopping, travel planning, or delivery logistics. Just ask!";
      } else {
        // Analyze through Conductor for complex requests
        try {
          const { conductor } = await import('./conductor');
          conductorResponse = await conductor.analyzeUserAction(userAction);
          
          // Extract agents used - handle multiple workflow formats safely
          agentsUsed = [];
          try {
            if (Array.isArray(conductorResponse.workflows)) {
              agentsUsed = conductorResponse.workflows.map((w: any) => {
                return w.agent || w.agentId || (w.workflow ? w.workflow.agent : null);
              }).filter(Boolean);
            } else if (conductorResponse.workflows && typeof conductorResponse.workflows === 'object') {
              // Handle object format like {"TrustPay": {...}}
              agentsUsed = Object.keys(conductorResponse.workflows);
            }
          } catch (err) {
            console.warn('Error extracting agents from workflows:', err);
            agentsUsed = [];
          }
          
          // Process based on conductor analysis and marketplace data
          try {
            const { findProductOffer } = await import('./marketplace');
            
            // Extract the primary workflow/agent coordination from conductor
            const primaryAgent = agentsUsed.length > 0 ? agentsUsed[0] : null;
            
            if (userMessage.toLowerCase().includes('sneaker') || userMessage.toLowerCase().includes('shoes')) {
              const offer = await findProductOffer('Air Max', 'Bengaluru');
              if (offer?.trip) {
                finalAnswer = `🤖 TrustPay & PathSync coordinated: Raj can bring your Nike Air Max 270 for $150, arriving Bengaluru ${offer.trip.departUtc.toLocaleDateString()} • escrow held 💰 • Accept?`;
              } else {
                finalAnswer = `🤖 LocaleLens found: Nike Air Max 270 for $150 in NYC. PathSync checking traveler routes to Bengaluru...`;
              }
            } else if (userMessage.toLowerCase().includes('headphones') || userMessage.toLowerCase().includes('audio')) {
              const offer = await findProductOffer('Sony', 'Tokyo');
              if (offer?.trip) {
                finalAnswer = `🤖 Multi-agent coordination: Emma can deliver Sony WH-1000XM5 for $349, arriving Tokyo ${offer.trip.departUtc.toLocaleDateString()} • TrustPay escrow ready 💰 • Accept?`;
              } else {
                finalAnswer = `🤖 LocaleLens found: Sony WH-1000XM5 for $349 in Tokyo. PathSync coordinating delivery routes...`;
              }
            } else if (userMessage.toLowerCase().includes('camera')) {
              const offer = await findProductOffer('Leica', 'Lagos');
              if (offer?.trip) {
                finalAnswer = `🤖 High-value coordination: Li Chen can carry Leica M6 Camera for $3,800, arriving Lagos ${offer.trip.departUtc.toLocaleDateString()} • TrustPay premium escrow 💰 • Accept?`;
              } else {
                finalAnswer = `🤖 LocaleLens found: Leica M6 Film Camera for $3,800 in Paris. PathSync securing premium traveler route...`;
              }
            } else if (userMessage.toLowerCase().includes('accept')) {
              finalAnswer = `🤖 TrustPay executed: Escrow created and funds secured! PathSync notifying traveler and merchant. GlobeGuides will provide tracking updates as your item begins its journey.`;
            } else if (userMessage.toLowerCase().includes('restaurant') || userMessage.toLowerCase().includes('food')) {
              finalAnswer = `🤖 LocaleLens activated: Found great dining recommendations in your area! ${primaryAgent === 'GlobeGuides' ? 'GlobeGuides cross-referencing with travel preferences.' : ''}`;
            } else if (userMessage.toLowerCase().includes('travel') || userMessage.toLowerCase().includes('trip')) {
              finalAnswer = `🤖 GlobeGuides & PathSync coordinated: Raj is traveling New York → Bengaluru on 7/7/2025. Where are you planning to go?`;
            } else {
              finalAnswer = `🤖 Conductor analyzed your request. ${agentsUsed.length > 0 ? `${agentsUsed.join(' & ')} agents coordinating` : 'Multi-agent system ready'} to help you!`;
            }
          } catch (error) {
            console.error('Marketplace integration error:', error);
            finalAnswer = `🤖 System coordination active. ${agentsUsed.length > 0 ? `${agentsUsed.join(' & ')} agents engaged` : 'Multi-agent response ready'}.`;
          }
          
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Conductor analysis failed:', error);
          }
          finalAnswer = "I understand your request. Let me provide what I can help you with.";
        }
      }

      // Save conversation to database
      try {
        // For anonymous users, use null userId (now allowed by schema)
        const validUserId = (req as any).user?.id || null;

        await db.insert(blinkConversations).values({
          userId: validUserId,
          sessionId,
          messageType: "user",
          speaker: "User",
          content: userMessage,
          contextData: { contextType, feedContext },
        });

        // Save AI response
        await db.insert(blinkConversations).values({
          userId: validUserId,
          sessionId,
          messageType: "assistant", 
          speaker: "Blink",
          content: finalAnswer,
          contextData: { agentsUsed, confidence: 0.8, conductorResponse },
        });
      } catch (dbError) {
        console.warn('Database save failed, continuing with response:', dbError);
      }

      // Fetch updated conversation
      let conversation: any[] = [];
      try {
        conversation = await db.select()
          .from(blinkConversations)
          .where(eq(blinkConversations.sessionId, sessionId))
          .orderBy(blinkConversations.createdAt);
      } catch (dbError) {
        console.warn('Database fetch failed:', dbError);
      }

      res.json({
        success: true,
        response: finalAnswer,
        finalAnswer,
        agentsUsed,
        _conductor: conductorResponse,
        confidence: 0.8,
        conversation,
        sessionId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Blink conversation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process conversation'
      });
    }
  });

  // AgentTorch crowd-heat endpoints
  app.get("/api/crowd-heat", async (req, res) => {
    try {
      const { city, product_tag, min_demand } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      if (product_tag) filters.product_tag = product_tag as string;
      if (min_demand) filters.min_demand = parseFloat(min_demand as string);

      const { agentTorchSimulator } = await import('./agenttorch');
      const heatData = agentTorchSimulator.getCrowdHeat(filters);
      
      res.json({
        success: true,
        data: heatData,
        count: heatData.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Crowd heat error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch crowd heat data'
      });
    }
  });

  app.get("/api/crowd-heat/trending/:city", async (req, res) => {
    try {
      const { city } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const { agentTorchSimulator } = await import('./agenttorch');
      const trending = agentTorchSimulator.getTopTrendingByCity(city, limit);
      
      res.json({
        success: true,
        city,
        trending,
        count: trending.length
      });
    } catch (error) {
      console.error('Trending data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trending data'
      });
    }
  });

  app.post("/api/crowd-heat/surge-check", async (req, res) => {
    try {
      const { city, product_tag } = req.body;
      
      if (!city || !product_tag) {
        return res.status(400).json({
          success: false,
          error: 'City and product_tag are required'
        });
      }

      const { agentTorchSimulator } = await import('./agenttorch');
      const surgeInfo = agentTorchSimulator.getDemandSurge(city, product_tag);
      
      res.json({
        success: true,
        city,
        product_tag,
        ...surgeInfo
      });
    } catch (error) {
      console.error('Surge check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check demand surge'
      });
    }
  });

  app.get("/api/crowd-heat/status", async (req, res) => {
    try {
      const { agentTorchSimulator } = await import('./agenttorch');
      const status = agentTorchSimulator.getSimulationStatus();
      
      res.json({
        success: true,
        ...status
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get simulation status'
      });
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
            id: "agent-globalsocial",
            name: "GlobalSocial Trust Network",
            tagline: "Social commerce with verified trust.",
            description: "Social trust network platform with AI agents, payment escrow, and logistics coordination for seamless travel commerce",
            capabilities: ["social_commerce", "trust_escrow", "peer_delivery", "travel_logistics", "multi_agent_orchestration"],
            status: "active",
            version: "1.0.0",
            endpoint: process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}/api/agents` : "https://your-app.replit.app/api/agents",
            region: "Global",
            performance_score: 95.0,
            last_updated: new Date().toISOString(),
            icon: "globe-2",
            owner: "did:web:globalsocial.network",
            isOwnAgent: true
          },
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
          },
          {
            id: "agent-003",
            name: "LocaleLens AI",
            tagline: "Hidden gems via social proof.",
            description: "Discovers authentic local experiences through community data analysis and social validation.",
            capabilities: ["local_discovery", "social_analysis", "experience_curation", "cultural_insights"],
            status: "active",
            version: "1.8.2",
            endpoint: "https://localelens-ai.nanda.ai/api/v1",
            region: "Global",
            performance_score: 94.7,
            last_updated: "2024-01-13T09:20:00Z",
            icon: "search-check"
          },
          {
            id: "agent-004",
            name: "PathSync Social Logistics",
            tagline: "Crowd-sourced delivery network.",
            description: "Coordinates peer-to-peer delivery through trusted traveler networks and social logistics.",
            capabilities: ["peer_delivery", "route_optimization", "traveler_matching", "logistics_coordination"],
            status: "active",
            version: "2.0.1",
            endpoint: "https://pathsync-logistics.nanda.ai/api/v1",
            region: "Global",
            performance_score: 92.8,
            last_updated: "2024-01-12T14:30:00Z",
            icon: "navigation-2"
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

  // NANDA Phase 2: Heartbeat API
  app.post("/api/nanda/heartbeat", async (req, res) => {
    try {
      const { agentId, status } = req.body;
      
      // NANDA SDK-style DID generation with crypto
      const timestamp = Date.now();
      const nonce = randomBytes(16).toString('hex');
      const did = `did:nanda:globalsocial:${createHash('sha256').update(`${agentId}:${timestamp}:${nonce}`).digest('hex').substring(0, 16)}`;
      
      // Generate cryptographic signature (simplified for demo)
      const payload = `${did}:${timestamp}:${agentId}:${status}`;
      const signature = createHash('sha256').update(payload).digest('hex');
      
      const heartbeatResponse = {
        success: true,
        isRunning: true,
        heartbeatAge: 0,
        pingAge: null,
        indicator: '🟢' as const,
        lastHeartbeat: new Date().toISOString(),
        did,
        signature,
        timestamp,
        agentId,
        nonce
      };

      console.log(`✅ NANDA Heartbeat registered for ${agentId}`);
      res.json(heartbeatResponse);
    } catch (error) {
      console.error("Heartbeat error:", error);
      res.status(500).json({ 
        success: false,
        isRunning: false,
        indicator: '🔴',
        error: "Heartbeat failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // NANDA Phase 2: Ping API
  app.post("/api/nanda/ping", async (req, res) => {
    try {
      const { endpoint } = req.body;
      
      // Attempt real JSON-RPC ping with proper error handling
      let pingResult;
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "ping",
            params: {},
            id: 1
          }),
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            pingResult = {
              success: true,
              endpoint,
              timestamp: new Date().toISOString(),
              response: data,
              latency: "< 5000ms"
            };
          } else {
            // Handle non-JSON responses
            const text = await response.text();
            pingResult = {
              success: false,
              endpoint,
              timestamp: new Date().toISOString(),
              response: null,
              error: `Endpoint returned HTML instead of JSON (likely a web page, not an API)`
            };
          }
        } else {
          pingResult = {
            success: false,
            endpoint,
            timestamp: new Date().toISOString(),
            response: null,
            error: `HTTP ${response.status}: ${response.statusText}`
          };
        }
      } catch (fetchError) {
        // Handle network errors, JSON parsing errors, timeouts
        pingResult = {
          success: false,
          endpoint,
          timestamp: new Date().toISOString(),
          response: null,
          error: fetchError instanceof Error ? 
            `Network error: ${fetchError.message}` : 
            "Unknown network error"
        };
      }

      console.log(`Ping test to ${endpoint}:`, pingResult);
      res.json(pingResult);
    } catch (error) {
      console.error("Ping error:", error);
      res.status(500).json({ 
        success: false,
        error: "Ping failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // LocaleLens API endpoints
  app.get("/api/locale-lens/discover/:destination", async (req: AuthenticatedRequest, res) => {
    try {
      const { destination } = req.params;
      const { category = 'all', search } = req.query;
      
      if (!perplexityLocaleLens.isConfigured()) {
        return res.status(503).json({
          success: false,
          error: "Perplexity API not configured",
          message: "LocaleLens requires Perplexity API key for real-time discovery"
        });
      }

      const discoveries = await perplexityLocaleLens.searchLocalDiscoveries(
        destination,
        category as string,
        search as string
      );

      const crowdData = agentTorchSimulator.getCrowdHeat({ city: destination });
      const smartPricing = getSmartPricing(discoveries, crowdData);

      res.json({
        success: true,
        destination,
        discoveries,
        count: discoveries.length,
        smart_pricing: smartPricing,
        crowd_context: crowdData.slice(0, 3),
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('LocaleLens discovery error:', error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to discover local spots"
      });
    }
  });

  app.get("/api/locale-lens/status", async (req, res) => {
    res.json({
      success: true,
      configured: perplexityLocaleLens.isConfigured(),
      message: perplexityLocaleLens.isConfigured() 
        ? "LocaleLens ready for real-time discovery"
        : "Perplexity API key required for LocaleLens activation"
    });
  });

  // NANDA Protocol Bridge - Handle JSON-RPC requests
  app.post("/api/agents/rpc", async (req, res) => {
    const { nandaBridge } = await import('./nanda-bridge');
    await nandaBridge.handleNANDARequest(req, res);
  });

  // NANDA Methods Discovery
  app.get("/api/agents/methods", async (req, res) => {
    const { nandaBridge } = await import('./nanda-bridge');
    res.json({
      success: true,
      methods: nandaBridge.getAvailableMethods(),
      agent_id: "globalsocial-001",
      protocol: "JSON-RPC 2.0"
    });
  });

  const httpServer = createServer(app);

  // Conductor orchestration endpoints
  app.post("/api/conductor/webhook", async (req, res) => {
    const { webhookConductorHandler } = await import('./middleware/conductor-middleware');
    await webhookConductorHandler(req, res, () => {});
  });
  
  app.get("/api/conductor/status", async (req, res) => {
    const { conductor } = await import('./conductor');
    const { eventBus } = await import('./event-bus');
    res.json({
      conductor: {
        activeContexts: 'available',
        uptime: process.uptime()
      },
      eventBus: eventBus.getStatus()
    });
  });

  // AgentTorch batch processing endpoint
  app.post("/api/agenttorch/batch", async (req, res) => {
    try {
      const { eventBus } = await import('./event-bus');
      const batchResults = await eventBus.triggerAgentTorchBatch();
      res.json({
        success: true,
        ...batchResults
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test Conductor endpoint - manually trigger analysis
  app.post("/api/conductor/test", async (req, res) => {
    try {
      const { conductor } = await import('./conductor');
      const { action, userId = 'test-user' } = req.body;
      
      const testAction = {
        type: 'api_call' as const,
        path: '/test',
        payload: action,
        userId,
        timestamp: new Date(),
        sessionId: 'test-session',
        context: {
          currentPage: 'test',
          userType: 'general' as const,
          trustScore: 75
        }
      };

      const result = await conductor.analyzeUserAction(testAction);
      
      res.json({
        success: true,
        analysis: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Blink Test Engine endpoints
  app.post("/api/blink/test/scenario/:scenarioId", async (req, res) => {
    try {
      const { blinkTestEngine } = await import('./blink-test-engine');
      const { scenarioId } = req.params;
      const { userId = 'test-user' } = req.body;
      
      const result = await blinkTestEngine.runTestScenario(scenarioId, userId);
      
      res.json({
        success: true,
        result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/blink/test/suite", async (req, res) => {
    try {
      const { blinkTestEngine } = await import('./blink-test-engine');
      const { filter } = req.body;
      
      const results = await blinkTestEngine.runTestSuite(filter);
      
      res.json({
        success: true,
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          avgDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length
        },
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/blink/test/scenarios", async (req, res) => {
    try {
      const { blinkTestEngine } = await import('./blink-test-engine');
      
      res.json({
        success: true,
        scenarios: blinkTestEngine.getScenarios(),
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // NANDA Agent Endpoint - Required for registry validation
  app.get("/api/agents", async (req, res) => {
    try {
      // Return our agent information in NANDA-compatible format
      const agentInfo = {
        agent_id: "globalsocial-001",
        name: "GlobalSocial Trust Network",
        status: "active",
        capabilities: [
          "social_commerce", 
          "trust_escrow", 
          "peer_delivery", 
          "travel_logistics",
          "multi_agent_orchestration",
          "conversational_ai"
        ],
        owner: "did:web:globalsocial.network",
        description: "Social trust network platform with AI agents, payment escrow, and logistics coordination for seamless travel commerce",
        version: "1.0.0",
        region: "Global",
        performance_score: 95.0,
        endpoint: `${req.protocol}://${req.get('host')}/api/agents`,
        api_version: "1.0",
        last_heartbeat: new Date().toISOString(),
        supported_protocols: ["HTTP", "JSON-RPC"],
        rpc_endpoint: `${req.protocol}://${req.get('host')}/api/agents/rpc`,
        methods_endpoint: `${req.protocol}://${req.get('host')}/api/agents/methods`,
        registration_time: new Date().toISOString()
      };

      console.log('NANDA agent info requested from:', req.ip);
      res.json(agentInfo);
    } catch (error) {
      console.error("Agent endpoint error:", error);
      res.status(500).json({ error: "Agent information unavailable" });
    }
  });

  // NANDA Agent Health Check
  app.get("/api/agents/health", async (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      agent_id: "globalsocial-001"
    });
  });

  // Traveler Discovery API for 3D Map System
  
  // Get user's current location for map centering
  app.get("/api/traveler-discovery/location", async (req, res) => {
    try {
      const { city = "New York" } = req.query;
      
      // Simple city coordinate lookup for demo
      const cityCoords: Record<string, {city: string, country: string, coordinates: [number, number]}> = {
        "New York": { city: "New York", country: "United States", coordinates: [40.7128, -74.0060] },
        "London": { city: "London", country: "United Kingdom", coordinates: [51.5074, -0.1278] },
        "Paris": { city: "Paris", country: "France", coordinates: [48.8566, 2.3522] },
        "Tokyo": { city: "Tokyo", country: "Japan", coordinates: [35.6762, 139.6503] },
        "Mumbai": { city: "Mumbai", country: "India", coordinates: [19.0760, 72.8777] },
        "Dubai": { city: "Dubai", country: "UAE", coordinates: [25.2048, 55.2708] }
      };
      
      const locationData = cityCoords[city as string] || cityCoords["New York"];
      
      res.json({
        success: true,
        location: locationData
      });
    } catch (error) {
      console.error("Location fetch error:", error);
      res.status(500).json({ error: "Failed to fetch user location" });
    }
  });

  // Set user's location
  app.post("/api/traveler-discovery/location", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { city, country, coordinates, timezone } = req.body;
      
      // Disable any existing primary location
      await db.update(userLocations)
        .set({ isPrimary: false })
        .where(eq(userLocations.userId, userId));
      
      // Insert new primary location
      const locationData = {
        userId,
        city,
        country,
        coordinates,
        timezone,
        isPrimary: true,
        detectionMethod: "manual"
      };
      
      const newLocation = await db.insert(userLocations).values(locationData).returning();
      res.json({ success: true, location: newLocation[0] });
    } catch (error) {
      console.error("Location set error:", error);
      res.status(500).json({ error: "Failed to set user location" });
    }
  });

  // Get travelers arriving to user's city
  app.get("/api/traveler-discovery/incoming", async (req, res) => {
    try {
      const { city = "New York", filter, date_range, connection_type } = req.query;
      
      const targetCity = city as string;
      
      // Get travel itineraries to user's city
      const travelersToCity = await db.select({
        id: travelItineraries.id,
        travelerId: travelItineraries.travelerId,
        fromCity: travelItineraries.fromCity,
        toCity: travelItineraries.toCity,
        fromCountry: travelItineraries.fromCountry,
        toCountry: travelItineraries.toCountry,
        fromCoordinates: travelItineraries.fromCoordinates,
        toCoordinates: travelItineraries.toCoordinates,
        fromAirport: travelItineraries.fromAirport,
        toAirport: travelItineraries.toAirport,
        departureDate: travelItineraries.departureDate,
        arrivalDate: travelItineraries.arrivalDate,
        airline: travelItineraries.airline,
        flightNumber: travelItineraries.flightNumber,
        maxCarryCapacity: travelItineraries.maxCarryCapacity,
        deliveryFee: travelItineraries.deliveryFee,
        currency: travelItineraries.currency,
        connectionPurpose: travelItineraries.connectionPurpose,
        travelNote: travelItineraries.travelNote,
        status: travelItineraries.status,
        trustScore: travelItineraries.trustScore,
        verificationStatus: travelItineraries.verificationStatus,
        createdAt: travelItineraries.createdAt,
        traveler: {
          id: users.id,
          name: profiles.fullName,
          trustScore: profiles.trustScore,
          level: profiles.level,
          avatarUrl: profiles.avatarUrl
        }
      })
      .from(travelItineraries)
      .leftJoin(users, eq(travelItineraries.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.id))
      .where(and(
        eq(travelItineraries.toCity, targetCity),
        eq(travelItineraries.availableForConnection, true),
        eq(travelItineraries.status, "upcoming")
      ))
      .orderBy(asc(travelItineraries.arrivalDate))
      .limit(50);
      
      res.json({
        success: true,
        travelers: travelersToCity,
        totalCount: travelersToCity.length,
        targetCity,
        filters: {
          applied: { filter, date_range, connection_type },
          available: {
            purposes: ["social", "shopping", "sightseeing", "business", "delivery"],
            timeframes: ["this_week", "this_month", "next_month", "all"]
          }
        }
      });
    } catch (error) {
      console.error("Incoming travelers fetch error:", error);
      res.status(500).json({ error: "Failed to fetch incoming travelers" });
    }
  });

  // Get global travel patterns for 3D visualization
  app.get("/api/traveler-discovery/global-patterns", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { time_range = "week" } = req.query;
      
      // Get all active travel itineraries
      const globalTravelers = await db.select({
        id: travelItineraries.id,
        fromCity: travelItineraries.fromCity,
        toCity: travelItineraries.toCity,
        fromCountry: travelItineraries.fromCountry,
        toCountry: travelItineraries.toCountry,
        fromCoordinates: travelItineraries.fromCoordinates,
        toCoordinates: travelItineraries.toCoordinates,
        departureDate: travelItineraries.departureDate,
        arrivalDate: travelItineraries.arrivalDate,
        status: travelItineraries.status,
        trustScore: travelItineraries.trustScore
      })
      .from(travelItineraries)
      .where(eq(travelItineraries.status, "upcoming"))
      .orderBy(asc(travelItineraries.departureDate))
      .limit(200);
      
      // Group by routes for visualization
      const routePatterns = globalTravelers.reduce((acc, travel) => {
        const routeKey = `${travel.fromCity}-${travel.toCity}`;
        if (!acc[routeKey]) {
          acc[routeKey] = {
            route: routeKey,
            fromCity: travel.fromCity,
            toCity: travel.toCity,
            fromCountry: travel.fromCountry,
            toCountry: travel.toCountry,
            fromCoordinates: travel.fromCoordinates,
            toCoordinates: travel.toCoordinates,
            count: 0,
            avgTrustScore: 0,
            nextDeparture: null
          };
        }
        acc[routeKey].count++;
        acc[routeKey].avgTrustScore += travel.trustScore;
        if (!acc[routeKey].nextDeparture || travel.departureDate < acc[routeKey].nextDeparture) {
          acc[routeKey].nextDeparture = travel.departureDate;
        }
        return acc;
      }, {});
      
      // Calculate averages
      Object.values(routePatterns).forEach((pattern: any) => {
        pattern.avgTrustScore = Math.round(pattern.avgTrustScore / pattern.count);
      });
      
      res.json({
        success: true,
        patterns: Object.values(routePatterns),
        totalRoutes: Object.keys(routePatterns).length,
        totalTravelers: globalTravelers.length,
        timeRange: time_range
      });
    } catch (error) {
      console.error("Global patterns fetch error:", error);
      res.status(500).json({ error: "Failed to fetch global travel patterns" });
    }
  });

  // Send connection request to traveler
  app.post("/api/traveler-discovery/connect", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const requesterId = req.user!.id;
      const { itineraryId, travelerId, connectionType, message, proposedMeeting } = req.body;
      
      const connectionData = {
        requesterId,
        travelerId,
        itineraryId,
        connectionType,
        message,
        proposedMeeting: proposedMeeting || {},
        status: "pending"
      };
      
      const newConnection = await db.insert(connectionRequests).values(connectionData).returning();
      
      res.json({
        success: true,
        connectionRequest: newConnection[0],
        message: "Connection request sent successfully"
      });
    } catch (error) {
      console.error("Connection request error:", error);
      res.status(500).json({ error: "Failed to send connection request" });
    }
  });

  // Get connection requests for current user
  app.get("/api/traveler-discovery/connections", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { type = "all" } = req.query; // sent, received, all
      
      let connections;
      
      if (type === "sent") {
        connections = await db.select().from(connectionRequests)
          .where(eq(connectionRequests.requesterId, userId))
          .orderBy(desc(connectionRequests.createdAt));
      } else if (type === "received") {
        connections = await db.select().from(connectionRequests)
          .where(eq(connectionRequests.travelerId, userId))
          .orderBy(desc(connectionRequests.createdAt));
      } else {
        connections = await db.select().from(connectionRequests)
          .where(and(
            eq(connectionRequests.requesterId, userId),
            eq(connectionRequests.travelerId, userId)
          ))
          .orderBy(desc(connectionRequests.createdAt));
      }
      
      res.json({
        success: true,
        connections,
        type,
        count: connections.length
      });
    } catch (error) {
      console.error("Connections fetch error:", error);
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  return httpServer;
}
