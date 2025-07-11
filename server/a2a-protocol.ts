/**
 * Agent-to-Agent (A2A) Protocol Implementation for NANDA 2025
 * Implements Google's A2A protocol for peer-to-peer agent collaboration
 */

import { EventEmitter } from 'events';

interface A2AMessage {
  protocol: 'a2a/1.0';
  type: 'request' | 'response' | 'notification' | 'handshake';
  from: string;
  to: string;
  conversationId: string;
  messageId: string;
  timestamp: string;
  payload: {
    method?: string;
    params?: any;
    result?: any;
    error?: any;
    capability?: string;
    context?: any;
  };
  signature?: string;
}

interface AgentPeer {
  agentId: string;
  endpoint: string;
  capabilities: string[];
  trustScore: number;
  lastSeen: Date;
  status: 'active' | 'inactive' | 'unreachable';
}

export class A2AProtocol extends EventEmitter {
  private peers: Map<string, AgentPeer> = new Map();
  private conversations: Map<string, any> = new Map();
  private agentId = 'globalsocial-001';

  async discoverPeers(capability?: string): Promise<AgentPeer[]> {
    try {
      // Use our existing NANDA discovery
      const response = await fetch('http://localhost:5000/api/nanda/agents');
      const data = await response.json();
      
      if (data.success && data.agents) {
        for (const agent of data.agents) {
          if (agent.id !== this.agentId) {
            this.peers.set(agent.id, {
              agentId: agent.id,
              endpoint: agent.endpoint || agent.rpc_endpoint,
              capabilities: agent.capabilities || [],
              trustScore: agent.performance_score || 75,
              lastSeen: new Date(),
              status: 'active'
            });
          }
        }
      }

      // Filter by capability if specified
      const allPeers = Array.from(this.peers.values());
      return capability 
        ? allPeers.filter(peer => peer.capabilities.includes(capability))
        : allPeers;
    } catch (error) {
      console.error('A2A peer discovery failed:', error);
      return [];
    }
  }

  async sendMessage(to: string, method: string, params: any = {}): Promise<any> {
    const peer = this.peers.get(to);
    if (!peer) {
      throw new Error(`Peer ${to} not found or not reachable`);
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const message: A2AMessage = {
      protocol: 'a2a/1.0',
      type: 'request',
      from: this.agentId,
      to,
      conversationId,
      messageId,
      timestamp: new Date().toISOString(),
      payload: {
        method,
        params,
        capability: this.inferCapability(method)
      }
    };

    try {
      const response = await fetch(peer.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-A2A-Protocol': '1.0',
          'X-Agent-ID': this.agentId
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`A2A request failed: ${response.status}`);
      }

      const result = await response.json();
      this.conversations.set(conversationId, { message, result, timestamp: new Date() });
      
      return result;
    } catch (error) {
      // Mark peer as unreachable
      peer.status = 'unreachable';
      peer.lastSeen = new Date();
      throw error;
    }
  }

  async handleIncomingMessage(message: A2AMessage): Promise<A2AMessage> {
    try {
      // Validate message
      if (message.protocol !== 'a2a/1.0') {
        throw new Error('Unsupported A2A protocol version');
      }

      if (message.to !== this.agentId) {
        throw new Error('Message not addressed to this agent');
      }

      // Process based on type
      switch (message.type) {
        case 'handshake':
          return this.handleHandshake(message);
        case 'request':
          return this.handleRequest(message);
        case 'notification':
          return this.handleNotification(message);
        default:
          throw new Error(`Unsupported message type: ${message.type}`);
      }
    } catch (error) {
      return {
        protocol: 'a2a/1.0',
        type: 'response',
        from: this.agentId,
        to: message.from,
        conversationId: message.conversationId,
        messageId: `resp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        payload: {
          error: {
            code: -32603,
            message: error.message
          }
        }
      };
    }
  }

  private async handleHandshake(message: A2AMessage): Promise<A2AMessage> {
    // Register the peer
    this.peers.set(message.from, {
      agentId: message.from,
      endpoint: message.payload.context?.endpoint || '',
      capabilities: message.payload.context?.capabilities || [],
      trustScore: 50, // Initial trust score
      lastSeen: new Date(),
      status: 'active'
    });

    return {
      protocol: 'a2a/1.0',
      type: 'response',
      from: this.agentId,
      to: message.from,
      conversationId: message.conversationId,
      messageId: `resp_${Date.now()}`,
      timestamp: new Date().toISOString(),
      payload: {
        result: {
          agentId: this.agentId,
          capabilities: [
            'social_commerce',
            'trust_escrow',
            'peer_delivery',
            'travel_logistics',
            'multi_agent_orchestration'
          ],
          endpoint: 'http://localhost:5000/api/agents/rpc',
          status: 'handshake_accepted'
        }
      }
    };
  }

  private async handleRequest(message: A2AMessage): Promise<A2AMessage> {
    // Route to appropriate business logic
    const method = message.payload.method;
    const params = message.payload.params || {};

    let result;
    try {
      // Route to existing NANDA bridge
      const internalRequest = {
        jsonrpc: '2.0',
        method,
        params,
        id: message.messageId
      };

      // This would integrate with existing NANDA bridge
      result = await this.routeToBusinessLogic(internalRequest);
    } catch (error) {
      throw new Error(`Business logic error: ${error.message}`);
    }

    return {
      protocol: 'a2a/1.0',
      type: 'response',
      from: this.agentId,
      to: message.from,
      conversationId: message.conversationId,
      messageId: `resp_${Date.now()}`,
      timestamp: new Date().toISOString(),
      payload: { result }
    };
  }

  private async handleNotification(message: A2AMessage): Promise<A2AMessage> {
    // Handle notification (fire-and-forget)
    this.emit('notification', message);

    return {
      protocol: 'a2a/1.0',
      type: 'response',
      from: this.agentId,
      to: message.from,
      conversationId: message.conversationId,
      messageId: `ack_${Date.now()}`,
      timestamp: new Date().toISOString(),
      payload: { result: { acknowledged: true } }
    };
  }

  private inferCapability(method: string): string {
    if (method.startsWith('social_commerce')) return 'social_commerce';
    if (method.startsWith('trust_escrow')) return 'trust_escrow';
    if (method.startsWith('peer_delivery')) return 'peer_delivery';
    if (method.startsWith('travel_logistics')) return 'travel_logistics';
    if (method.startsWith('multi_agent')) return 'multi_agent_orchestration';
    return 'unknown';
  }

  private async routeToBusinessLogic(request: any): Promise<any> {
    // This would integrate with existing NANDA bridge
    // For now, return a placeholder
    return {
      success: true,
      method: request.method,
      processed_by: this.agentId,
      timestamp: new Date().toISOString()
    };
  }

  // Get network statistics
  getNetworkStatus() {
    const activePeers = Array.from(this.peers.values()).filter(p => p.status === 'active');
    const capabilities = new Set();
    activePeers.forEach(peer => peer.capabilities.forEach(cap => capabilities.add(cap)));

    return {
      totalPeers: this.peers.size,
      activePeers: activePeers.length,
      availableCapabilities: Array.from(capabilities),
      conversations: this.conversations.size,
      networkHealth: activePeers.length / Math.max(this.peers.size, 1)
    };
  }

  // Initiate handshake with peer
  async handshake(peerEndpoint: string): Promise<boolean> {
    const message: A2AMessage = {
      protocol: 'a2a/1.0',
      type: 'handshake',
      from: this.agentId,
      to: 'unknown',
      conversationId: `handshake_${Date.now()}`,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      payload: {
        context: {
          agentId: this.agentId,
          capabilities: [
            'social_commerce',
            'trust_escrow',
            'peer_delivery',
            'travel_logistics',
            'multi_agent_orchestration'
          ],
          endpoint: 'http://localhost:5000/api/agents/rpc'
        }
      }
    };

    try {
      const response = await fetch(peerEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-A2A-Protocol': '1.0',
          'X-Agent-ID': this.agentId
        },
        body: JSON.stringify(message)
      });

      return response.ok;
    } catch (error) {
      console.error('A2A handshake failed:', error);
      return false;
    }
  }
}

export const a2aProtocol = new A2AProtocol();