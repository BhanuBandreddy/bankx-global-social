// Conductor Middleware - Intercepts all user actions and routes through Conductor
// This middleware sits between UI/APIs and routes all interactions through the Conductor

import { Request, Response, NextFunction } from 'express';
import { conductor } from '../conductor';
import { eventBus } from '../event-bus';
import { AuthenticatedRequest } from '../auth';

interface ConductorRequest extends AuthenticatedRequest {
  conductorAnalysis?: any;
  skipConductor?: boolean;
}

// Actions that should bypass Conductor (health checks, static assets, etc.)
const BYPASS_PATHS = [
  '/health',
  '/api/agents/health',
  '/api/nanda/heartbeat',
  '/api/nanda/ping',
  '/assets/',
  '/favicon.ico',
  '/_next/',
  '/static/'
];

// Actions that trigger Conductor analysis
const CONDUCTOR_TRIGGERS: Record<string, string> = {
  // User click actions
  'GET:/api/feed': 'browse_feed',
  'GET:/api/products': 'browse_products',
  'POST:/api/escrow/initiate': 'initiate_purchase',
  'POST:/api/delivery-options': 'select_delivery',
  
  // Chat and conversational actions
  'POST:/api/blink/conversation': 'chat_agents',
  'POST:/api/chat/': 'merchant_chat',
  
  // Travel and logistics actions
  'POST:/api/parse-itinerary': 'upload_itinerary',
  'GET:/api/travelers/available': 'search_travelers',
  'GET:/api/locale-lens/discover/': 'discover_local',
  
  // Social actions
  'POST:/api/feed': 'create_post',
  'PUT:/api/feed/': 'engage_post'
};

export const conductorMiddleware = async (
  req: ConductorRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Skip conductor for bypass paths
    if (shouldBypassConductor(req.path)) {
      req.skipConductor = true;
      return next();
    }

    // Skip if no user (unauthenticated endpoints)
    if (!req.user) {
      return next();
    }

    // Get action type from route
    const actionKey = `${req.method}:${req.route?.path || req.path}`;
    const actionType = CONDUCTOR_TRIGGERS[actionKey] || getActionTypeFromPath(req);

    if (!actionType) {
      return next(); // Skip conductor for unrecognized actions
    }

    // Build user action context
    const userAction = {
      type: getActionCategory(actionType) as 'click' | 'chat' | 'webhook' | 'api_call',
      path: req.path,
      payload: {
        body: req.body,
        query: req.query,
        params: req.params
      },
      userId: req.user.id,
      timestamp: new Date(),
      sessionId: getSessionId(req),
      context: await buildUserContext(req)
    };

    console.log(`🎯 Conductor middleware intercepted: ${actionType}`);

    // Analyze action through Conductor
    const conductorResponse = await conductor.analyzeUserAction(userAction);

    // Store analysis in request for downstream use
    req.conductorAnalysis = conductorResponse;

    // Publish user action to event bus
    eventBus.publish(`user.${actionType}`, {
      userId: req.user.id,
      action: userAction,
      conductorResponse
    }, {
      sourceAgent: 'conductor',
      priority: 2,
      correlationId: generateCorrelationId()
    });

    // Continue to route handler
    next();

  } catch (error) {
    console.error('Conductor middleware error:', error);
    // Don't block request if conductor fails
    req.skipConductor = true;
    next();
  }
};

// Middleware to inject conductor insights into responses
export const conductorResponseMiddleware = (
  req: ConductorRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.skipConductor || !req.conductorAnalysis) {
    return next();
  }

  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json to include conductor insights
  res.json = function(body: any) {
    const enhancedResponse = {
      ...body,
      _conductor: {
        reasoning: req.conductorAnalysis.reasoning,
        workflows: req.conductorAnalysis.workflows.map((w: any) => ({
          agent: w.agentId,
          action: w.action,
          priority: w.priority
        })),
        contextUpdates: Object.keys(req.conductorAnalysis.contextUpdates).length,
        timestamp: new Date()
      }
    };

    return originalJson(enhancedResponse);
  };

  next();
};

// Webhook handler for external systems
export const webhookConductorHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userAction = {
    type: 'webhook' as const,
    path: req.path,
    payload: req.body,
    userId: req.body.userId || 'system',
    timestamp: new Date(),
    sessionId: req.body.sessionId || 'webhook-session',
    context: {
      currentPage: 'webhook',
      userType: 'general' as const,
      trustScore: 100,
      webhookSource: req.headers['x-webhook-source'] || 'unknown'
    }
  };

  try {
    const conductorResponse = await conductor.analyzeUserAction(userAction);
    
    res.json({
      success: true,
      message: 'Webhook processed by Conductor',
      reasoning: conductorResponse.reasoning,
      workflowsTriggered: conductorResponse.workflows.length
    });
  } catch (error) {
    console.error('Webhook conductor error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Conductor processing failed' 
    });
  }
};

function shouldBypassConductor(path: string): boolean {
  return BYPASS_PATHS.some(bypassPath => path.startsWith(bypassPath));
}

function getActionTypeFromPath(req: Request): string | null {
  // Extract action type from path patterns
  if (req.path.includes('/feed')) return 'browse_feed';
  if (req.path.includes('/products')) return 'browse_products';
  if (req.path.includes('/escrow')) return 'handle_payment';
  if (req.path.includes('/travelers')) return 'search_delivery';
  if (req.path.includes('/chat')) return 'communicate';
  if (req.path.includes('/blink')) return 'chat_agents';
  if (req.path.includes('/parse-itinerary')) return 'process_travel';
  if (req.path.includes('/locale-lens')) return 'discover_local';
  
  return null;
}

function getActionCategory(actionType: string): 'click' | 'chat' | 'webhook' | 'api_call' {
  if (actionType.includes('chat') || actionType.includes('communicate')) return 'chat';
  if (actionType.includes('webhook')) return 'webhook';
  return 'click';
}

function getSessionId(req: Request): string {
  // Extract session ID from headers, cookies, or generate one
  return req.headers['x-session-id'] as string || 
         (req as any).sessionID || 
         `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function buildUserContext(req: ConductorRequest): Promise<any> {
  if (!req.user) {
    return {
      currentPage: 'unknown',
      userType: 'guest',
      trustScore: 0
    };
  }

  // Build context from request and user data
  return {
    currentPage: getCurrentPageFromPath(req.path),
    userType: determineUserType(req.user),
    trustScore: req.user.trustScore || 50,
    location: req.headers['x-user-location'] as string,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer
  };
}

function getCurrentPageFromPath(path: string): string {
  if (path.includes('/feed')) return 'social_feed';
  if (path.includes('/products')) return 'product_catalog';
  if (path.includes('/escrow')) return 'payment_flow';
  if (path.includes('/travelers')) return 'delivery_network';
  if (path.includes('/chat')) return 'communication';
  if (path.includes('/agents')) return 'agent_dashboard';
  return 'unknown';
}

function determineUserType(user: any): 'general' | 'business' | 'traveler' {
  // Logic to determine user type based on profile
  if (user.accountType) return user.accountType;
  if (user.businessProfile) return 'business';
  if (user.travelHistory?.length > 0) return 'traveler';
  return 'general';
}

function generateCorrelationId(): string {
  return `conductor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}