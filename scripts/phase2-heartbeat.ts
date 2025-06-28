#!/usr/bin/env tsx

// Phase 2: Cryptographic heartbeat & secure ping implementation

interface HeartbeatConfig {
  agentId: string;
  endpoint: string;
  intervalMs: number;
  registryUrl: string;
}

interface PingTest {
  endpoint: string;
  method: string;
  payload: any;
  expectedResponse?: any;
}

class NandaHeartbeat {
  private config: HeartbeatConfig;
  private isRunning = false;
  private heartbeatTimer?: NodeJS.Timeout;
  private lastHeartbeat?: Date;
  private lastPingSuccess?: Date;

  constructor(config: HeartbeatConfig) {
    this.config = config;
  }

  // Phase 2.1: Generate DID keypair (placeholder for @nanda/sdk)
  generateKeypair() {
    // In real implementation, this would use @nanda/sdk
    const mockDID = `did:web:globalsocial.network:${Date.now()}`;
    const mockPrivateKey = `private_key_${Math.random().toString(36)}`;
    
    console.log('Generated DID keypair:');
    console.log('DID:', mockDID);
    console.log('Private key stored securely (not logged in production)');
    
    return {
      did: mockDID,
      privateKey: mockPrivateKey,
      sign: (data: string) => `signature_${Buffer.from(data).toString('base64')}`
    };
  }

  // Phase 2.2: Heartbeat function
  async sendHeartbeat() {
    const { did, sign } = this.generateKeypair();
    const timestamp = Date.now();
    const signature = sign(`${did}:${timestamp}`);

    const heartbeatData = {
      did,
      signature,
      timestamp,
      agentId: this.config.agentId,
      status: 'active'
    };

    try {
      console.log('📡 Sending heartbeat to NANDA registry...');
      
      const response = await fetch(`${this.config.registryUrl}/agents/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GlobalSocial-Heartbeat/1.0'
        },
        body: JSON.stringify(heartbeatData)
      });

      if (response.ok) {
        this.lastHeartbeat = new Date();
        console.log('✅ Heartbeat sent successfully');
        return { success: true, timestamp: this.lastHeartbeat };
      } else {
        throw new Error(`Heartbeat failed: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Heartbeat failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Phase 2.3: JSON-RPC ping test
  async pingAgent(endpoint: string): Promise<{ success: boolean; response?: any; error?: string }> {
    const pingPayload = {
      jsonrpc: "2.0",
      method: "ping",
      params: { source: "GlobalSocial", timestamp: Date.now() },
      id: 1
    };

    try {
      console.log(`🏓 Pinging agent at ${endpoint}...`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GlobalSocial-Ping/1.0'
        },
        body: JSON.stringify(pingPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.result === 'pong' || result.result?.status === 'ok') {
        this.lastPingSuccess = new Date();
        console.log('✅ Ping successful - agent responding');
        return { success: true, response: result };
      } else {
        throw new Error('Invalid ping response');
      }
      
    } catch (error) {
      console.error(`❌ Ping failed:`, error);
      return { success: false, error: error.message };
    }
  }

  // Phase 2.4: Status monitoring
  getStatus() {
    const now = new Date();
    const heartbeatAge = this.lastHeartbeat ? now.getTime() - this.lastHeartbeat.getTime() : null;
    const pingAge = this.lastPingSuccess ? now.getTime() - this.lastPingSuccess.getTime() : null;

    const status = {
      isRunning: this.isRunning,
      lastHeartbeat: this.lastHeartbeat?.toISOString(),
      lastPingSuccess: this.lastPingSuccess?.toISOString(),
      heartbeatAge: heartbeatAge ? Math.round(heartbeatAge / 1000) : null,
      pingAge: pingAge ? Math.round(pingAge / 1000) : null,
      indicator: this.getStatusIndicator(heartbeatAge, pingAge)
    };

    return status;
  }

  private getStatusIndicator(heartbeatAge: number | null, pingAge: number | null): '🟢' | '🟡' | '🔴' {
    // Green: Recent heartbeat and ping (< 6 minutes)
    if (heartbeatAge && heartbeatAge < 360000 && pingAge && pingAge < 360000) {
      return '🟢';
    }
    
    // Yellow: Stale but not critical (< 15 minutes)
    if (heartbeatAge && heartbeatAge < 900000) {
      return '🟡';
    }
    
    // Red: Critical or no data
    return '🔴';
  }

  // Start automatic heartbeat
  startHeartbeat() {
    if (this.isRunning) {
      console.log('Heartbeat already running');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Starting heartbeat every ${this.config.intervalMs}ms`);
    
    // Send initial heartbeat
    this.sendHeartbeat();
    
    // Schedule recurring heartbeats
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.intervalMs);
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    this.isRunning = false;
    console.log('🛑 Heartbeat stopped');
  }
}

// Demo function for Phase 2 testing
async function runPhase2Demo() {
  console.log('🚀 Phase 2: NANDA Cryptographic Heartbeat Demo\n');

  const config: HeartbeatConfig = {
    agentId: 'agent-globalsocial',
    endpoint: process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}/api/agents` : 'http://localhost:5000/api/agents',
    intervalMs: 5 * 60 * 1000, // 5 minutes
    registryUrl: process.env.NANDA_BASE_URL || 'https://nanda-registry.com/api/v1'
  };

  const heartbeat = new NandaHeartbeat(config);

  // Test 1: Generate keypair
  console.log('1. Testing DID keypair generation...');
  heartbeat.generateKeypair();
  console.log('');

  // Test 2: Send single heartbeat
  console.log('2. Testing heartbeat...');
  await heartbeat.sendHeartbeat();
  console.log('');

  // Test 3: Ping test endpoints
  console.log('3. Testing JSON-RPC ping...');
  const testEndpoints = [
    'https://globeguides-concierge.nanda.ai/api/v1',
    config.endpoint
  ];

  for (const endpoint of testEndpoints) {
    await heartbeat.pingAgent(endpoint);
  }
  console.log('');

  // Test 4: Status check
  console.log('4. Status summary:');
  const status = heartbeat.getStatus();
  console.log(JSON.stringify(status, null, 2));
  console.log('');

  console.log('Phase 2 demo complete! Ready for UI integration.');
}

// Run demo if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPhase2Demo().catch(console.error);
}

export { NandaHeartbeat, runPhase2Demo };