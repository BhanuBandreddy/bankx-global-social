/**
 * Model Context Protocol (MCP) Transport Layer for NANDA 2025
 * Adds MCP-compatible transport methods as recommended by latest NANDA spec
 */

import { Request, Response } from 'express';
import { EventEmitter } from 'events';

interface MCPMessage {
  jsonrpc: '2.0';
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number;
}

export class MCPTransport extends EventEmitter {
  private connections: Map<string, Response> = new Map();

  // Server-Sent Events transport for persistent connections
  setupSSE(req: Request, res: Response, agentId: string) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    this.connections.set(agentId, res);

    // Send initial connection confirmation
    this.sendSSEMessage(agentId, {
      jsonrpc: '2.0',
      method: 'connection/established',
      params: {
        agentId,
        capabilities: [
          'social_commerce',
          'trust_escrow', 
          'peer_delivery',
          'travel_logistics',
          'multi_agent_orchestration'
        ],
        transport: 'sse',
        timestamp: new Date().toISOString()
      }
    });

    // Handle client disconnect
    req.on('close', () => {
      this.connections.delete(agentId);
      console.log(`MCP SSE connection closed for agent: ${agentId}`);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      if (this.connections.has(agentId)) {
        res.write('data: {"type":"ping"}\n\n');
      } else {
        clearInterval(keepAlive);
      }
    }, 30000);
  }

  // Send message via SSE
  sendSSEMessage(agentId: string, message: MCPMessage) {
    const connection = this.connections.get(agentId);
    if (connection) {
      const data = JSON.stringify(message);
      connection.write(`data: ${data}\n\n`);
    }
  }

  // Broadcast to all connected agents
  broadcast(message: MCPMessage) {
    for (const [agentId] of this.connections) {
      this.sendSSEMessage(agentId, message);
    }
  }

  // HTTP streaming transport
  setupStreaming(req: Request, res: Response) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*'
    });

    return {
      send: (message: MCPMessage) => {
        const chunk = JSON.stringify(message) + '\n';
        res.write(chunk);
      },
      end: () => res.end()
    };
  }

  // Standard HTTP transport (existing implementation)
  async handleHTTP(req: Request, res: Response) {
    try {
      const message: MCPMessage = req.body;
      
      // Process the message and generate response
      const response = await this.processMessage(message);
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message
        },
        id: req.body?.id || null
      });
    }
  }

  private async processMessage(message: MCPMessage): Promise<MCPMessage> {
    // This would integrate with existing NANDA bridge
    // For now, return a basic response
    return {
      jsonrpc: '2.0',
      result: {
        status: 'processed',
        method: message.method,
        timestamp: new Date().toISOString()
      },
      id: message.id
    };
  }

  // Get connection status
  getConnectionStatus() {
    return {
      activeConnections: this.connections.size,
      connectedAgents: Array.from(this.connections.keys()),
      transportTypes: ['http', 'sse', 'streaming']
    };
  }
}

export const mcpTransport = new MCPTransport();