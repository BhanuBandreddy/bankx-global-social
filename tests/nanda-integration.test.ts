// NANDA Integration Tests
// Automated testing suite for NANDA protocol compliance

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { Express } from 'express';

describe('NANDA Integration Tests', () => {
  let app: Express;
  const BASE_URL = 'http://localhost:5000';

  beforeAll(async () => {
    // Server should already be running via npm run dev
    console.log('Testing NANDA integration against running server...');
  });

  afterAll(async () => {
    console.log('NANDA integration tests completed');
  });

  describe('Agent Discovery', () => {
    test('should return NANDA-compliant agent info', async () => {
      const response = await fetch(`${BASE_URL}/api/agents`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.agent_id).toBe('globalsocial-001');
      expect(data.name).toBe('GlobalSocial Trust Network');
      expect(data.status).toBe('active');
      expect(Array.isArray(data.capabilities)).toBe(true);
      expect(data.capabilities.length).toBeGreaterThan(0);
      expect(data.rpc_endpoint).toContain('/api/agents/rpc');
    });

    test('should return agent health status', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.agent_id).toBe('globalsocial-001');
      expect(typeof data.uptime).toBe('number');
    });
  });

  describe('Methods Discovery', () => {
    test('should return available NANDA methods', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/methods`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.methods)).toBe(true);
      expect(data.methods.length).toBeGreaterThan(10);
      expect(data.methods).toContain('ping');
      expect(data.protocol).toBe('JSON-RPC 2.0');
    });

    test('should include all required business capabilities', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/methods`);
      const data = await response.json();

      const requiredMethods = [
        'social_commerce.get_products',
        'trust_escrow.create_escrow',
        'peer_delivery.find_travelers',
        'travel_logistics.parse_itinerary',
        'multi_agent_orchestration.discover_agents'
      ];

      requiredMethods.forEach(method => {
        expect(data.methods).toContain(method);
      });
    });
  });

  describe('JSON-RPC Protocol', () => {
    test('should handle ping request correctly', async () => {
      const rpcRequest = {
        jsonrpc: '2.0',
        method: 'ping',
        params: {},
        id: 'test-ping'
      };

      const response = await fetch(`${BASE_URL}/api/agents/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcRequest)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe('test-ping');
      expect(data.result.status).toBe('pong');
      expect(data.result.agent_id).toBe('globalsocial-001');
    });

    test('should return error for invalid method', async () => {
      const rpcRequest = {
        jsonrpc: '2.0',
        method: 'invalid.method',
        params: {},
        id: 'test-error'
      };

      const response = await fetch(`${BASE_URL}/api/agents/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcRequest)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe('test-error');
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32601);
    });
  });

  describe('Business Capabilities', () => {
    test('should handle social commerce requests', async () => {
      const rpcRequest = {
        jsonrpc: '2.0',
        method: 'social_commerce.get_products',
        params: { location: 'Tokyo', category: 'electronics' },
        id: 'test-commerce'
      };

      const response = await fetch(`${BASE_URL}/api/agents/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcRequest)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.success).toBe(true);
      expect(data.result.products).toBeDefined();
      expect(data.result.filters.location).toBe('Tokyo');
    });

    test('should handle trust escrow requests', async () => {
      const rpcRequest = {
        jsonrpc: '2.0',
        method: 'trust_escrow.create_escrow',
        params: { 
          productId: '1', 
          amount: 100, 
          currency: 'USD',
          buyerId: 'test-buyer'
        },
        id: 'test-escrow'
      };

      const response = await fetch(`${BASE_URL}/api/agents/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcRequest)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.success).toBe(true);
      expect(data.result.transaction).toBeDefined();
      expect(data.result.escrow_id).toBeDefined();
      expect(data.result.status).toBe('escrowed');
    });

    test('should handle peer delivery requests', async () => {
      const rpcRequest = {
        jsonrpc: '2.0',
        method: 'peer_delivery.find_travelers',
        params: { fromLocation: 'Tokyo', toLocation: 'Osaka' },
        id: 'test-delivery'
      };

      const response = await fetch(`${BASE_URL}/api/agents/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcRequest)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.success).toBe(true);
      expect(data.result.travelers).toBeDefined();
      expect(data.result.routes.from).toBe('Tokyo');
    });

    test('should handle travel logistics requests', async () => {
      const rpcRequest = {
        jsonrpc: '2.0',
        method: 'travel_logistics.parse_itinerary',
        params: { document: 'test_doc', filename: 'test.pdf' },
        id: 'test-logistics'
      };

      const response = await fetch(`${BASE_URL}/api/agents/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcRequest)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.success).toBe(true);
      expect(data.result.itinerary).toBeDefined();
      expect(data.result.parsing_method).toBe('openai_enhanced');
    });

    test('should handle multi-agent orchestration', async () => {
      const rpcRequest = {
        jsonrpc: '2.0',
        method: 'multi_agent_orchestration.discover_agents',
        params: {},
        id: 'test-orchestration'
      };

      const response = await fetch(`${BASE_URL}/api/agents/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcRequest)
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.success).toBe(true);
      expect(Array.isArray(data.result.agents)).toBe(true);
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle concurrent requests', async () => {
      const requests = Array(5).fill(0).map((_, i) => ({
        jsonrpc: '2.0',
        method: 'ping',
        params: {},
        id: `concurrent-${i}`
      }));

      const promises = requests.map(req => 
        fetch(`${BASE_URL}/api/agents/rpc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req)
        })
      );

      const responses = await Promise.all(promises);
      
      for (let i = 0; i < responses.length; i++) {
        expect(responses[i].status).toBe(200);
        const data = await responses[i].json();
        expect(data.result.status).toBe('pong');
        expect(data.id).toBe(`concurrent-${i}`);
      }
    });

    test('should respond within reasonable time', async () => {
      const start = Date.now();
      
      const response = await fetch(`${BASE_URL}/api/agents/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'ping',
          params: {},
          id: 'perf-test'
        })
      });

      const duration = Date.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});