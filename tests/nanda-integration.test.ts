import request from 'supertest';
import { Express } from 'express';
import { createServer } from 'http';
import { registerRoutes } from '../server/routes';
import express from 'express';

describe('NANDA Integration Tests', () => {
  let app: Express;
  let server: any;

  beforeAll(async () => {
    // Create test server instance
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Register routes
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('NANDA Agent Registry', () => {
    test('should return GlobalSocial agent in registry', async () => {
      const response = await request(app)
        .get('/api/nanda')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Find our GlobalSocial agent
      const globalSocialAgent = response.body.find((agent: any) => 
        agent.id === 'agent-globalsocial'
      );
      
      expect(globalSocialAgent).toBeDefined();
      expect(globalSocialAgent.name).toBe('GlobalSocial Trust Network');
      expect(globalSocialAgent.capabilities).toContain('social_commerce');
      expect(globalSocialAgent.owner).toBe('did:web:globalsocial.network');
      expect(globalSocialAgent.isOwnAgent).toBe(true);
    });

    test('should filter agents by capability', async () => {
      const response = await request(app)
        .get('/api/nanda/discover?cap=travel_commerce')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((agent: any) => {
        expect(agent.capabilities).toEqual(
          expect.arrayContaining(['travel_commerce'])
        );
      });
    });
  });

  describe('NANDA Heartbeat System', () => {
    test('should generate valid cryptographic DID on heartbeat', async () => {
      const heartbeatData = {
        agentId: 'agent-globalsocial',
        status: 'active'
      };

      const response = await request(app)
        .post('/api/nanda/heartbeat')
        .send(heartbeatData)
        .expect(200);

      // Verify response structure
      expect(response.body.success).toBe(true);
      expect(response.body.isRunning).toBe(true);
      expect(response.body.indicator).toBe('🟢');
      
      // Verify DID format
      expect(response.body.did).toMatch(/^did:nanda:globalsocial:[a-f0-9]{16}$/);
      
      // Verify cryptographic components
      expect(response.body.signature).toMatch(/^[a-f0-9]{64}$/);
      expect(response.body.nonce).toMatch(/^[a-f0-9]{32}$/);
      expect(typeof response.body.timestamp).toBe('number');
      
      // Verify timestamp is recent (within 5 seconds)
      const now = Date.now();
      expect(Math.abs(now - response.body.timestamp)).toBeLessThan(5000);
    });

    test('should return consistent heartbeat format', async () => {
      const heartbeatData = {
        agentId: 'agent-globalsocial',
        status: 'active'
      };

      const response = await request(app)
        .post('/api/nanda/heartbeat')
        .send(heartbeatData)
        .expect(200);

      // Verify required fields
      const requiredFields = [
        'success', 'isRunning', 'heartbeatAge', 'pingAge', 
        'indicator', 'lastHeartbeat', 'did', 'signature', 
        'timestamp', 'agentId', 'nonce'
      ];

      requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
    });
  });

  describe('NANDA Ping System', () => {
    test('should handle external endpoint ping testing', async () => {
      const pingData = {
        endpoint: 'https://httpbin.org/status/200'
      };

      const response = await request(app)
        .post('/api/nanda/ping')
        .send(pingData)
        .expect(200);

      // Verify ping response structure
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('endpoint');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.endpoint).toBe(pingData.endpoint);
    });

    test('should handle unreachable endpoints gracefully', async () => {
      const pingData = {
        endpoint: 'https://unreachable-endpoint-12345.invalid'
      };

      const response = await request(app)
        .post('/api/nanda/ping')
        .send(pingData)
        .expect(200);

      // Should return structured error response
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.endpoint).toBe(pingData.endpoint);
    });
  });

  describe('NANDA Protocol Compliance', () => {
    test('should generate unique DIDs for each heartbeat', async () => {
      const heartbeatData = {
        agentId: 'agent-globalsocial',
        status: 'active'
      };

      // Send multiple heartbeats
      const response1 = await request(app)
        .post('/api/nanda/heartbeat')
        .send(heartbeatData)
        .expect(200);

      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));

      const response2 = await request(app)
        .post('/api/nanda/heartbeat')
        .send(heartbeatData)
        .expect(200);

      // DIDs should be different due to timestamp and nonce
      expect(response1.body.did).not.toBe(response2.body.did);
      expect(response1.body.nonce).not.toBe(response2.body.nonce);
      expect(response1.body.signature).not.toBe(response2.body.signature);
    });

    test('should maintain agent registration consistency', async () => {
      // Test that our agent appears consistently in registry
      const response1 = await request(app).get('/api/nanda');
      const response2 = await request(app).get('/api/nanda');

      expect(response1.body).toEqual(response2.body);
      
      // Verify agent data integrity
      const agent = response1.body.find((a: any) => a.id === 'agent-globalsocial');
      expect(agent.performance_score).toBe(95);
      expect(agent.status).toBe('active');
      expect(agent.version).toBe('1.0.0');
    });
  });
});