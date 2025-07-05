// OpenAI Agents-SDK "Conductor" - Central Orchestration Engine
// Analyzes all user actions and coordinates AI workflows with context awareness

import OpenAI from "openai";
import { EventEmitter } from 'events';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UserAction {
  type: 'click' | 'chat' | 'webhook' | 'api_call';
  path: string;
  payload: any;
  userId: string;
  timestamp: Date;
  sessionId: string;
  context: {
    currentPage: string;
    userType: 'general' | 'business' | 'traveler';
    trustScore: number;
    location?: string;
  };
}

interface AgentWorkflow {
  agentId: 'trustpay' | 'localelens' | 'pathsync' | 'globeguides';
  action: string;
  parameters: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[];
  expectedDuration: number;
}

interface ConductorResponse {
  reasoning: string;
  workflows: AgentWorkflow[];
  contextUpdates: Record<string, any>;
  eventBusMessages: EventBusMessage[];
}

interface EventBusMessage {
  topic: string;
  payload: any;
  metadata: {
    sourceAgent?: string;
    priority: number;
    timestamp: Date;
    correlationId: string;
  };
}

interface ContextMemory {
  userId: string;
  sessionId: string;
  conversation: Array<{
    timestamp: Date;
    action: UserAction;
    response: ConductorResponse;
    agentResults: Record<string, any>;
  }>;
  userProfile: {
    preferences: Record<string, any>;
    trustNetwork: string[];
    transactionHistory: any[];
    travelPatterns: any[];
  };
  activeWorkflows: AgentWorkflow[];
  crowdHeatContext: any[];
}

export class ConductorOrchestrator extends EventEmitter {
  private contextMemory: Map<string, ContextMemory> = new Map();
  private agentCapabilities = {
    trustpay: ['escrow_creation', 'payment_processing', 'dispute_resolution', 'fraud_detection'],
    localelens: ['local_discovery', 'restaurant_recommendations', 'cultural_insights', 'price_analysis'],
    pathsync: ['route_optimization', 'traveler_matching', 'delivery_coordination', 'logistics_planning'],
    globeguides: ['itinerary_parsing', 'travel_planning', 'destination_recommendations', 'visa_requirements']
  };

  constructor() {
    super();
    this.setupEventListeners();
  }

  async analyzeUserAction(action: UserAction): Promise<ConductorResponse> {
    console.log(`🎯 Conductor analyzing action: ${action.type} at ${action.path}`);

    // Get or create user context memory
    const contextKey = `${action.userId}-${action.sessionId}`;
    let context = this.contextMemory.get(contextKey);
    
    if (!context) {
      context = await this.initializeUserContext(action.userId, action.sessionId);
      this.contextMemory.set(contextKey, context);
    }

    // Build comprehensive context for LLM reasoning
    const contextPrompt = this.buildContextPrompt(action, context);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are the Conductor - a central AI orchestrator for a social commerce platform. 
            
Your job is to analyze user actions and coordinate specialized AI agents:
- TrustPay: Payment escrow, fraud detection, transaction security
- LocaleLens: Local discovery, restaurant recommendations, cultural insights  
- PathSync: Logistics coordination, traveler matching, delivery optimization
- GlobeGuides: Travel planning, itinerary parsing, destination insights

For each user action, provide:
1. Reasoning about user intent and context
2. Which agents to invoke and their specific workflows
3. Context updates to maintain across the session
4. Event bus messages for real-time coordination

Respond in JSON format with reasoning, workflows, contextUpdates, and eventBusMessages.`
          },
          {
            role: "user", 
            content: contextPrompt
          }
        ],
        response_format: { type: "json_object" }
      });

      let conductorResponse: ConductorResponse;
      try {
        conductorResponse = JSON.parse(response.choices[0].message.content || '{}');
        
        // Ensure required properties exist
        if (!conductorResponse.workflows) {
          conductorResponse.workflows = [];
        }
        if (!conductorResponse.eventBusMessages) {
          conductorResponse.eventBusMessages = [];
        }
        if (!conductorResponse.contextUpdates) {
          conductorResponse.contextUpdates = {};
        }
        
      } catch (parseError) {
        console.warn('Failed to parse conductor response, using fallback');
        conductorResponse = {
          reasoning: "Fallback response due to parsing error",
          workflows: [],
          contextUpdates: {},
          eventBusMessages: []
        };
      }

      // Update context memory with this interaction
      context.conversation.push({
        timestamp: new Date(),
        action,
        response: conductorResponse,
        agentResults: {}
      });

      // Emit event bus messages
      if (Array.isArray(conductorResponse.eventBusMessages)) {
        conductorResponse.eventBusMessages.forEach(message => {
          this.emit('eventBusMessage', message);
        });
      }

      // Execute agent workflows
      if (Array.isArray(conductorResponse.workflows)) {
        await this.executeAgentWorkflows(conductorResponse.workflows, context);
      }

      return conductorResponse;
      
    } catch (error) {
      console.error('Conductor analysis failed:', error);
      throw new Error(`Conductor orchestration failed: ${error.message}`);
    }
  }

  private buildContextPrompt(action: UserAction, context: ContextMemory): string {
    return `
USER ACTION:
Type: ${action.type}
Path: ${action.path}
Payload: ${JSON.stringify(action.payload, null, 2)}
User Context: ${JSON.stringify(action.context, null, 2)}

CONVERSATION HISTORY (last 5 interactions):
${context.conversation.slice(-5).map(conv => `
  Action: ${conv.action.type} at ${conv.action.path}
  Response: ${conv.response.reasoning}
  Agents Used: ${conv.response.workflows.map(w => w.agentId).join(', ')}
`).join('\n')}

USER PROFILE:
Preferences: ${JSON.stringify(context.userProfile.preferences, null, 2)}
Trust Network Size: ${context.userProfile.trustNetwork.length}
Transaction Count: ${context.userProfile.transactionHistory.length}

ACTIVE WORKFLOWS:
${context.activeWorkflows.map(w => `${w.agentId}: ${w.action}`).join('\n')}

CROWD HEAT CONTEXT:
${JSON.stringify(context.crowdHeatContext, null, 2)}

Based on this context, analyze the user's intent and coordinate appropriate agent workflows.
    `;
  }

  private async initializeUserContext(userId: string, sessionId: string): Promise<ContextMemory> {
    // Fetch user profile from database
    const userProfile = await this.fetchUserProfile(userId);
    
    // Get current crowd heat data
    const crowdHeatData = await this.fetchCrowdHeatContext();

    return {
      userId,
      sessionId,
      conversation: [],
      userProfile,
      activeWorkflows: [],
      crowdHeatContext: crowdHeatData
    };
  }

  private async executeAgentWorkflows(workflows: AgentWorkflow[], context: ContextMemory): Promise<void> {
    // Sort workflows by priority and dependencies
    const sortedWorkflows = this.sortWorkflowsByPriority(workflows);

    for (const workflow of sortedWorkflows) {
      try {
        console.log(`🤖 Executing ${workflow.agentId} workflow: ${workflow.action}`);
        
        const result = await this.invokeAgent(workflow);
        
        // Store result in context
        const lastInteraction = context.conversation[context.conversation.length - 1];
        if (lastInteraction) {
          lastInteraction.agentResults[workflow.agentId] = result;
        }

        // Emit workflow completion event
        this.emit('workflowComplete', {
          agentId: workflow.agentId,
          action: workflow.action,
          result,
          timestamp: new Date()
        });

      } catch (error) {
        console.error(`Agent workflow failed: ${workflow.agentId}:${workflow.action}`, error);
        this.emit('workflowError', {
          agentId: workflow.agentId,
          action: workflow.action,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }
  }

  private async invokeAgent(workflow: AgentWorkflow): Promise<any> {
    // Route to appropriate agent implementation
    switch (workflow.agentId) {
      case 'trustpay':
        return this.invokeTrustPayAgent(workflow);
      case 'localelens':
        return this.invokeLocaleLensAgent(workflow);
      case 'pathsync':
        return this.invokePathSyncAgent(workflow);
      case 'globeguides':
        return this.invokeGlobeGuidesAgent(workflow);
      default:
        throw new Error(`Unknown agent: ${workflow.agentId}`);
    }
  }

  private async invokeTrustPayAgent(workflow: AgentWorkflow): Promise<any> {
    // Call existing escrow/payment APIs
    switch (workflow.action) {
      case 'escrow_creation':
        return fetch('http://localhost:5000/api/escrow/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflow.parameters)
        }).then(r => r.json());
      
      case 'fraud_detection':
        // Implement fraud detection logic
        return { riskScore: 0.1, factors: [], recommendation: 'proceed' };
      
      default:
        throw new Error(`Unknown TrustPay action: ${workflow.action}`);
    }
  }

  private async invokeLocaleLensAgent(workflow: AgentWorkflow): Promise<any> {
    // Call existing LocaleLens APIs
    switch (workflow.action) {
      case 'local_discovery':
        const { destination } = workflow.parameters;
        return fetch(`http://localhost:5000/api/locale-lens/discover/${destination}`)
          .then(r => r.json());
      
      default:
        throw new Error(`Unknown LocaleLens action: ${workflow.action}`);
    }
  }

  private async invokePathSyncAgent(workflow: AgentWorkflow): Promise<any> {
    // Call existing logistics APIs
    switch (workflow.action) {
      case 'traveler_matching':
        return fetch('http://localhost:5000/api/travelers/available')
          .then(r => r.json());
      
      default:
        throw new Error(`Unknown PathSync action: ${workflow.action}`);
    }
  }

  private async invokeGlobeGuidesAgent(workflow: AgentWorkflow): Promise<any> {
    // Call existing travel APIs
    switch (workflow.action) {
      case 'itinerary_parsing':
        return fetch('http://localhost:5000/api/parse-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflow.parameters)
        }).then(r => r.json());
      
      default:
        throw new Error(`Unknown GlobeGuides action: ${workflow.action}`);
    }
  }

  private sortWorkflowsByPriority(workflows: AgentWorkflow[]): AgentWorkflow[] {
    if (!Array.isArray(workflows)) {
      console.warn('sortWorkflowsByPriority received non-array:', workflows);
      return [];
    }
    
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return workflows.sort((a, b) => {
      const aPriority = a?.priority || 'medium';
      const bPriority = b?.priority || 'medium';
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    });
  }

  private async fetchUserProfile(userId: string): Promise<any> {
    // Fetch from database
    return {
      preferences: {},
      trustNetwork: [],
      transactionHistory: [],
      travelPatterns: []
    };
  }

  private async fetchCrowdHeatContext(): Promise<any[]> {
    // Get current AgentTorch crowd heat data
    return [];
  }

  private setupEventListeners(): void {
    // Listen for agent workflow completions
    this.on('workflowComplete', (data) => {
      console.log(`✅ Workflow completed: ${data.agentId}:${data.action}`);
    });

    this.on('workflowError', (data) => {
      console.log(`❌ Workflow failed: ${data.agentId}:${data.action} - ${data.error}`);
    });

    // Listen for event bus messages
    this.on('eventBusMessage', (message) => {
      console.log(`📡 Event Bus: ${message.topic}`, message.payload);
      // Route to Kafka or other event bus implementation
    });
  }

  // Public method to get context for debugging
  getContextMemory(userId: string, sessionId: string): ContextMemory | undefined {
    return this.contextMemory.get(`${userId}-${sessionId}`);
  }

  // Clean up old context memory
  cleanupOldContexts(maxAgeHours: number = 24): void {
    const cutoff = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    
    for (const [key, context] of Array.from(this.contextMemory.entries())) {
      const lastActivity = context.conversation[context.conversation.length - 1]?.timestamp;
      if (lastActivity && lastActivity < cutoff) {
        this.contextMemory.delete(key);
        console.log(`🧹 Cleaned up old context for ${key}`);
      }
    }
  }
}

// Singleton instance
export const conductor = new ConductorOrchestrator();