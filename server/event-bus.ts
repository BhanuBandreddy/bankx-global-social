// Event Bus Implementation for Agent Workflow Coordination
// Replaces Kafka with in-memory pub/sub for development (can be upgraded to Kafka later)

import { EventEmitter } from 'events';

interface EventBusMessage {
  topic: string;
  payload: any;
  metadata: {
    sourceAgent?: string;
    priority: number;
    timestamp: Date;
    correlationId: string;
    retryCount?: number;
  };
}

interface EventSubscriber {
  id: string;
  topics: string[];
  handler: (message: EventBusMessage) => Promise<void> | void;
  options?: {
    persistent?: boolean;
    batchSize?: number;
    maxRetries?: number;
  };
}

export class EventBusOrchestrator extends EventEmitter {
  private subscribers: Map<string, EventSubscriber> = new Map();
  private messageQueue: EventBusMessage[] = [];
  private batchProcessor?: NodeJS.Timeout;
  private agentTorchQueue: EventBusMessage[] = [];

  constructor() {
    super();
    this.setupCoreSubscribers();
    this.startBatchProcessor();
  }

  // Publish message to event bus
  publish(topic: string, payload: any, metadata: Partial<EventBusMessage['metadata']> = {}): void {
    const message: EventBusMessage = {
      topic,
      payload,
      metadata: {
        priority: 1,
        timestamp: new Date(),
        correlationId: this.generateCorrelationId(),
        ...metadata
      }
    };

    console.log(`📡 EventBus: Publishing to ${topic}`, {
      correlationId: message.metadata.correlationId,
      priority: message.metadata.priority
    });

    // Add to message queue
    this.messageQueue.push(message);

    // Immediate delivery for high priority messages
    if (message.metadata.priority >= 3) {
      this.processMessage(message);
    }

    // Emit for real-time listeners
    this.emit('message', message);
    this.emit(`topic:${topic}`, message);
  }

  // Subscribe to topics
  subscribe(subscriber: EventSubscriber): void {
    this.subscribers.set(subscriber.id, subscriber);
    
    // Set up listeners for subscribed topics
    subscriber.topics.forEach(topic => {
      this.on(`topic:${topic}`, async (message: EventBusMessage) => {
        try {
          await subscriber.handler(message);
        } catch (error) {
          console.error(`Subscriber ${subscriber.id} failed to handle ${topic}:`, error);
          this.handleSubscriberError(subscriber, message, error);
        }
      });
    });

    console.log(`📋 EventBus: Subscriber ${subscriber.id} registered for topics: ${subscriber.topics.join(', ')}`);
  }

  // Unsubscribe
  unsubscribe(subscriberId: string): void {
    const subscriber = this.subscribers.get(subscriberId);
    if (subscriber) {
      subscriber.topics.forEach(topic => {
        this.removeAllListeners(`topic:${topic}`);
      });
      this.subscribers.delete(subscriberId);
      console.log(`📋 EventBus: Unsubscribed ${subscriberId}`);
    }
  }

  // Queue messages for AgentTorch batch processing
  queueForAgentTorch(message: EventBusMessage): void {
    this.agentTorchQueue.push(message);
    console.log(`🔄 EventBus: Queued for AgentTorch batch processing (${this.agentTorchQueue.length} pending)`);
  }

  // Process batch for nightly AgentTorch analysis
  async processBatchForAgentTorch(): Promise<any> {
    if (this.agentTorchQueue.length === 0) {
      return { processed: 0, insights: [] };
    }

    console.log(`🌙 EventBus: Processing ${this.agentTorchQueue.length} messages for AgentTorch analysis`);

    // Group messages by type for analysis
    const messagesByType = this.groupMessagesByType(this.agentTorchQueue);
    
    // Generate crowd heat insights
    const insights = await this.generateCrowdHeatInsights(messagesByType);

    // Clear processed queue
    const processedCount = this.agentTorchQueue.length;
    this.agentTorchQueue = [];

    return {
      processed: processedCount,
      insights,
      timestamp: new Date()
    };
  }

  private setupCoreSubscribers(): void {
    // Agent action listener
    this.subscribe({
      id: 'agent-action-logger',
      topics: ['agent.action', 'agent.complete', 'agent.error'],
      handler: (message) => {
        console.log(`🤖 Agent Activity: ${message.topic}`, {
          agent: message.metadata.sourceAgent,
          correlationId: message.metadata.correlationId
        });
        
        // Queue for AgentTorch if it's a transaction or significant action
        if (this.isSignificantAction(message)) {
          this.queueForAgentTorch(message);
        }
      }
    });

    // User action listener
    this.subscribe({
      id: 'user-action-logger',
      topics: ['user.click', 'user.chat', 'user.purchase', 'user.travel'],
      handler: (message) => {
        console.log(`👤 User Activity: ${message.topic}`, {
          userId: message.payload.userId,
          correlationId: message.metadata.correlationId
        });
        this.queueForAgentTorch(message);
      }
    });

    // Context update listener
    this.subscribe({
      id: 'context-updater',
      topics: ['context.update', 'context.memory'],
      handler: (message) => {
        // Update global context store
        this.emit('contextUpdate', message.payload);
      }
    });

    // Real-time UI update listener
    this.subscribe({
      id: 'ui-updater',
      topics: ['ui.badge', 'ui.notification', 'ui.feed'],
      handler: (message) => {
        // Emit to WebSocket connections for real-time UI updates
        this.emit('uiUpdate', message);
      }
    });
  }

  private startBatchProcessor(): void {
    // Process message queue every 5 seconds
    this.batchProcessor = setInterval(() => {
      if (this.messageQueue.length > 0) {
        const batch = this.messageQueue.splice(0, 50); // Process in batches of 50
        batch.forEach(message => {
          if (message.metadata.priority < 3) { // Skip already processed high priority
            this.processMessage(message);
          }
        });
      }
    }, 5000);
  }

  private async processMessage(message: EventBusMessage): Promise<void> {
    // Find relevant subscribers
    const relevantSubscribers = Array.from(this.subscribers.values())
      .filter(sub => sub.topics.some(topic => this.topicMatches(topic, message.topic)));

    // Deliver to subscribers
    for (const subscriber of relevantSubscribers) {
      try {
        await subscriber.handler(message);
      } catch (error) {
        this.handleSubscriberError(subscriber, message, error);
      }
    }
  }

  private topicMatches(subscriptionTopic: string, messageTopic: string): boolean {
    // Support wildcard matching
    if (subscriptionTopic.includes('*')) {
      const pattern = subscriptionTopic.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(messageTopic);
    }
    return subscriptionTopic === messageTopic;
  }

  private handleSubscriberError(subscriber: EventSubscriber, message: EventBusMessage, error: any): void {
    const maxRetries = subscriber.options?.maxRetries || 3;
    const retryCount = message.metadata.retryCount || 0;

    if (retryCount < maxRetries) {
      // Retry with exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      setTimeout(() => {
        message.metadata.retryCount = retryCount + 1;
        this.processMessage(message);
      }, delay);
    } else {
      console.error(`Subscriber ${subscriber.id} failed after ${maxRetries} retries:`, error);
      this.publish('error.subscriber', {
        subscriberId: subscriber.id,
        originalMessage: message,
        error: error.message
      }, { priority: 2 });
    }
  }

  private isSignificantAction(message: EventBusMessage): boolean {
    const significantTopics = [
      'agent.complete',
      'user.purchase', 
      'user.travel',
      'agent.action.escrow',
      'agent.action.delivery'
    ];
    return significantTopics.some(topic => message.topic.startsWith(topic));
  }

  private groupMessagesByType(messages: EventBusMessage[]): Record<string, EventBusMessage[]> {
    return messages.reduce((groups, message) => {
      const topicType = message.topic.split('.')[0];
      if (!groups[topicType]) {
        groups[topicType] = [];
      }
      groups[topicType].push(message);
      return groups;
    }, {} as Record<string, EventBusMessage[]>);
  }

  private async generateCrowdHeatInsights(messagesByType: Record<string, EventBusMessage[]>): Promise<any[]> {
    const insights = [];

    // Import AgentTorch event processor
    const { agentTorchEventProcessor } = await import('./agenttorch');
    
    // Process all messages through AgentTorch
    const allMessages = Object.values(messagesByType).flat();
    const agentTorchResults = await agentTorchEventProcessor.processBatchEvents(allMessages);
    
    insights.push({
      type: 'agenttorch_predictions',
      data: agentTorchResults.predictions,
      metadata: {
        processedEvents: agentTorchResults.processedEvents,
        timestamp: agentTorchResults.timestamp
      }
    });

    // Analyze user behavior patterns
    if (messagesByType.user) {
      const locations = messagesByType.user
        .map(m => m.payload.action?.context?.location || m.payload.location)
        .filter(Boolean);
      
      const uniqueLocations = [...new Set(locations)];
      insights.push({
        type: 'location_activity',
        data: uniqueLocations.map(loc => ({
          location: loc,
          activity_count: locations.filter(l => l === loc).length,
          trend: 'stable' // Could be enhanced with time-series analysis
        }))
      });
    }

    // Analyze agent workflow patterns
    if (messagesByType.agent) {
      const agentActions = messagesByType.agent.reduce((acc, message) => {
        const agent = message.metadata.sourceAgent || 'unknown';
        acc[agent] = (acc[agent] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      insights.push({
        type: 'agent_utilization',
        data: Object.entries(agentActions).map(([agent, count]) => ({
          agent,
          action_count: count,
          utilization_score: count / messagesByType.agent.length
        }))
      });
    }

    return insights;
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get queue status for monitoring
  getStatus(): any {
    return {
      messageQueue: this.messageQueue.length,
      agentTorchQueue: this.agentTorchQueue.length,
      subscribers: this.subscribers.size,
      uptime: process.uptime()
    };
  }

  // Manual trigger for AgentTorch batch processing (for testing)
  async triggerAgentTorchBatch(): Promise<any> {
    return this.processBatchForAgentTorch();
  }

  // Cleanup
  destroy(): void {
    if (this.batchProcessor) {
      clearInterval(this.batchProcessor);
    }
    this.removeAllListeners();
    console.log('🛑 EventBus: Shut down complete');
  }
}

// Singleton instance
export const eventBus = new EventBusOrchestrator();