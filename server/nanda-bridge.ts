// NANDA Protocol Bridge
// Translates NANDA agent requests to our existing API endpoints

import { Request, Response } from 'express';

interface NANDARequest {
  jsonrpc: string;
  method: string;
  params: any;
  id: string | number;
}

interface NANDAResponse {
  jsonrpc: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number;
}

export class NANDABridge {
  // Map NANDA capabilities to our existing endpoints
  private capabilityMap = {
    'social_commerce': {
      'get_feed': '/api/feed',
      'get_products': '/api/products',
      'initiate_purchase': '/api/escrow/initiate'
    },
    'trust_escrow': {
      'create_escrow': '/api/escrow/initiate',
      'release_escrow': '/api/escrow/release',
      'check_escrow_status': '/api/escrow/:id/status'
    },
    'peer_delivery': {
      'find_travelers': '/api/travelers/available',
      'create_delivery_option': '/api/delivery-options'
    },
    'travel_logistics': {
      'parse_itinerary': '/api/parse-itinerary',
      'discover_local': '/api/locale-lens/discover/:destination'
    },
    'multi_agent_orchestration': {
      'discover_agents': '/api/nanda/agents',
      'agent_conversation': '/api/blink/conversation'
    }
  };

  async handleNANDARequest(req: Request, res: Response) {
    try {
      const nandaReq: NANDARequest = req.body;
      
      console.log(`NANDA request received: ${nandaReq.method}`, nandaReq.params);

      // Validate JSON-RPC format
      if (nandaReq.jsonrpc !== '2.0') {
        return this.sendError(res, nandaReq.id, -32600, 'Invalid JSON-RPC version');
      }

      const response = await this.routeNANDAMethod(nandaReq);
      res.json(response);
    } catch (error) {
      console.error('NANDA bridge error:', error);
      this.sendError(res, req.body?.id || null, -32603, 'Internal error', error.message);
    }
  }

  private async routeNANDAMethod(nandaReq: NANDARequest): Promise<NANDAResponse> {
    const { method, params, id } = nandaReq;

    switch (method) {
      case 'social_commerce.get_feed':
        return this.handleGetFeed(params, id);
      
      case 'social_commerce.get_products':
        return this.handleGetProducts(params, id);
      
      case 'trust_escrow.create_escrow':
        return this.handleCreateEscrow(params, id);
      
      case 'peer_delivery.find_travelers':
        return this.handleFindTravelers(params, id);
      
      case 'travel_logistics.parse_itinerary':
        return this.handleParseItinerary(params, id);
      
      case 'travel_logistics.discover_local':
        return this.handleDiscoverLocal(params, id);
      
      case 'multi_agent_orchestration.discover_agents':
        return this.handleDiscoverAgents(params, id);
      
      case 'ping':
        return this.handlePing(params, id);
      
      default:
        return this.createError(id, -32601, `Method not found: ${method}`);
    }
  }

  private async handleGetFeed(params: any, id: string | number): Promise<NANDAResponse> {
    try {
      // Simulate internal API call to our feed endpoint
      const feedData = await this.callInternalAPI('/api/feed', 'GET', params);
      
      return {
        jsonrpc: '2.0',
        result: {
          success: true,
          posts: feedData.posts || [],
          count: feedData.posts?.length || 0,
          capability: 'social_commerce'
        },
        id
      };
    } catch (error) {
      return this.createError(id, -32000, 'Failed to get feed', error.message);
    }
  }

  private async handleGetProducts(params: any, id: string | number): Promise<NANDAResponse> {
    try {
      const { location, category } = params;
      const productData = await this.callInternalAPI('/api/products', 'GET', { location, category });
      
      return {
        jsonrpc: '2.0',
        result: {
          success: true,
          products: productData.products || [],
          count: productData.products?.length || 0,
          filters: { location, category }
        },
        id
      };
    } catch (error) {
      return this.createError(id, -32000, 'Failed to get products', error.message);
    }
  }

  private async handleCreateEscrow(params: any, id: string | number): Promise<NANDAResponse> {
    try {
      const { productId, amount, currency, buyerId } = params;
      
      const escrowData = await this.callInternalAPI('/api/escrow/initiate', 'POST', {
        productId: productId.toString(),
        amount,
        currency,
        buyerId
      });
      
      return {
        jsonrpc: '2.0',
        result: {
          success: true,
          transaction: escrowData.transaction,
          escrow_id: escrowData.transaction?.id,
          status: 'escrowed'
        },
        id
      };
    } catch (error) {
      return this.createError(id, -32000, 'Failed to create escrow', error.message);
    }
  }

  private async handleFindTravelers(params: any, id: string | number): Promise<NANDAResponse> {
    try {
      const { fromLocation, toLocation } = params;
      const travelersData = await this.callInternalAPI('/api/travelers/available', 'GET', { fromLocation, toLocation });
      
      return {
        jsonrpc: '2.0',
        result: {
          success: true,
          travelers: travelersData.travelers || [],
          routes: { from: fromLocation, to: toLocation },
          count: travelersData.travelers?.length || 0
        },
        id
      };
    } catch (error) {
      return this.createError(id, -32000, 'Failed to find travelers', error.message);
    }
  }

  private async handleParseItinerary(params: any, id: string | number): Promise<NANDAResponse> {
    try {
      const { document, filename } = params;
      
      const parseData = await this.callInternalAPI('/api/parse-itinerary', 'POST', {
        document,
        filename
      });
      
      return {
        jsonrpc: '2.0',
        result: {
          success: true,
          itinerary: parseData.itinerary,
          destination: parseData.itinerary?.destination,
          parsing_method: 'openai_enhanced'
        },
        id
      };
    } catch (error) {
      return this.createError(id, -32000, 'Failed to parse itinerary', error.message);
    }
  }

  private async handleDiscoverLocal(params: any, id: string | number): Promise<NANDAResponse> {
    try {
      const { destination } = params;
      
      const localData = await this.callInternalAPI(`/api/locale-lens/discover/${destination}`, 'GET');
      
      return {
        jsonrpc: '2.0',
        result: {
          success: true,
          discoveries: localData.discoveries || [],
          destination,
          source: 'perplexity_ai'
        },
        id
      };
    } catch (error) {
      return this.createError(id, -32000, 'Failed to discover local content', error.message);
    }
  }

  private async handleDiscoverAgents(params: any, id: string | number): Promise<NANDAResponse> {
    try {
      const agentsData = await this.callInternalAPI('/api/nanda/agents', 'GET');
      
      return {
        jsonrpc: '2.0',
        result: {
          success: true,
          agents: agentsData.agents || [],
          count: agentsData.agents?.length || 0,
          registry_source: agentsData.source || 'fallback'
        },
        id
      };
    } catch (error) {
      return this.createError(id, -32000, 'Failed to discover agents', error.message);
    }
  }

  private async handlePing(params: any, id: string | number): Promise<NANDAResponse> {
    return {
      jsonrpc: '2.0',
      result: {
        status: 'pong',
        agent_id: 'globalsocial-001',
        timestamp: new Date().toISOString(),
        capabilities: Object.keys(this.capabilityMap)
      },
      id
    };
  }

  private async callInternalAPI(endpoint: string, method: 'GET' | 'POST', data?: any): Promise<any> {
    // Make actual internal calls to our existing API endpoints
    console.log(`Internal API call: ${method} ${endpoint}`, data);
    
    try {
      // For now, return mock data that matches our API structure
      // In production, this would make actual internal HTTP calls or direct function calls
      
      switch (endpoint) {
        case '/api/feed':
          return { 
            success: true, 
            posts: [],
            message: 'Feed data accessible via NANDA protocol'
          };
          
        case '/api/products':
          return { 
            success: true, 
            products: [],
            filters: data,
            message: 'Product catalog accessible via NANDA protocol'
          };
          
        case '/api/escrow/initiate':
          return {
            success: true,
            transaction: {
              id: `escrow_${Date.now()}`,
              productId: data.productId,
              amount: data.amount,
              currency: data.currency,
              status: 'escrowed'
            },
            message: 'Escrow created via NANDA protocol'
          };
          
        case '/api/travelers/available':
          return {
            success: true,
            travelers: [],
            routes: data,
            message: 'Traveler network accessible via NANDA protocol'
          };
          
        case '/api/parse-itinerary':
          return {
            success: true,
            itinerary: {
              route: 'Sample → Destination',
              destination: 'Sample Destination',
              date: new Date().toISOString()
            },
            message: 'Document parsing accessible via NANDA protocol'
          };
          
        case '/api/nanda/agents':
          return {
            success: true,
            agents: [
              {
                id: 'globalsocial-001',
                name: 'GlobalSocial Trust Network',
                capabilities: ['social_commerce', 'trust_escrow', 'peer_delivery'],
                highlighted: true
              }
            ],
            source: 'nanda_registry',
            message: 'Agent discovery accessible via NANDA protocol'
          };
          
        default:
          return { 
            success: true, 
            message: `${endpoint} accessible via NANDA protocol` 
          };
      }
    } catch (error) {
      throw new Error(`Internal API call failed: ${error.message}`);
    }
  }

  private createError(id: string | number, code: number, message: string, data?: any): NANDAResponse {
    return {
      jsonrpc: '2.0',
      error: { code, message, data },
      id
    };
  }

  private sendError(res: Response, id: string | number | null, code: number, message: string, data?: any) {
    res.json(this.createError(id || 'unknown', code, message, data));
  }

  // Get available NANDA methods for discovery
  getAvailableMethods(): string[] {
    const methods: string[] = ['ping'];
    
    Object.entries(this.capabilityMap).forEach(([capability, endpoints]) => {
      Object.keys(endpoints).forEach(method => {
        methods.push(`${capability}.${method}`);
      });
    });
    
    return methods;
  }
}

export const nandaBridge = new NANDABridge();