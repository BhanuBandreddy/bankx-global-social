#!/usr/bin/env tsx

import { config } from 'dotenv';
config();

interface AgentRegistration {
  name: string;
  endpoint: string;
  capabilities: string[];
  owner: string;
  description: string;
  version: string;
  region: string;
  performance_score: number;
  icon: string;
}

const GLOBALSOCIAL_AGENT: AgentRegistration = {
  name: "GlobalSocial Trust Network",
  endpoint: process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}/api/agents` : "https://your-app.replit.app/api/agents",
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
  icon: "globe-2"
};

async function registerAgent() {
  const NANDA_BASE_URL = process.env.NANDA_BASE_URL || 'https://nanda-registry.com/api/v1';
  
  console.log('🚀 Registering GlobalSocial agent with NANDA registry...');
  console.log('Agent data:', JSON.stringify(GLOBALSOCIAL_AGENT, null, 2));
  
  try {
    const response = await fetch(`${NANDA_BASE_URL}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GlobalSocial-Agent-Registration/1.0'
      },
      body: JSON.stringify(GLOBALSOCIAL_AGENT)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Agent registered successfully!');
    console.log('Registry response:', result);
    
    // Verify registration by querying back
    await verifyRegistration();
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    
    // Fallback to mock for development
    console.log('📝 Falling back to mock registration for development...');
    console.log('Agent would be registered as:', GLOBALSOCIAL_AGENT);
  }
}

async function verifyRegistration() {
  const NANDA_BASE_URL = process.env.NANDA_BASE_URL || 'https://nanda-registry.com/api/v1';
  
  console.log('🔍 Verifying agent registration...');
  
  try {
    const response = await fetch(`${NANDA_BASE_URL}/agents?owner=globalsocial.network`);
    const agents = await response.json();
    
    const ourAgent = agents.find((agent: any) => agent.name === GLOBALSOCIAL_AGENT.name);
    
    if (ourAgent) {
      console.log('✅ Agent found in registry!');
      console.log('Agent ID:', ourAgent.id);
    } else {
      console.log('⚠️ Agent not found in registry results');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

if (require.main === module) {
  registerAgent();
}

export { registerAgent, GLOBALSOCIAL_AGENT };