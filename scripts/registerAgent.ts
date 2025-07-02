#!/usr/bin/env tsx

// Environment configuration for agent registration
const config = process.env;

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

// NANDA Registry expects agent_id and agent_url format
const GLOBALSOCIAL_AGENT_NANDA = {
  agent_id: "globalsocial-001",
  agent_url: process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}/api/agents` : "https://your-app.replit.app/api/agents",
  name: "GlobalSocial Trust Network",
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

// Keep original format for compatibility
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
  const NANDA_BASE_URL = process.env.NANDA_BASE_URL || 'https://chat.nanda-registry.com:6900';
  
  console.log('🚀 Registering GlobalSocial agent with NANDA registry...');
  console.log('Agent data:', JSON.stringify(GLOBALSOCIAL_AGENT, null, 2));
  
  try {
    // Use discovered NANDA registry format
    console.log('Using NANDA registry format with agent_id and agent_url...');
    console.log('NANDA data:', JSON.stringify(GLOBALSOCIAL_AGENT_NANDA, null, 2));
    
    const response = await fetch(`${NANDA_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GlobalSocial-Agent-Registration/1.0'
      },
      body: JSON.stringify(GLOBALSOCIAL_AGENT_NANDA)
    });

    console.log(`Registration response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Registration error:', errorText);
      throw new Error(`NANDA registration failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Agent registered successfully!');
    console.log('Registry response:', result);
    
    // Verify registration by querying back
    await verifyRegistration();
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    
    // Fallback to mock for development
    console.log('📝 Registration failed, falling back to development mode...');
    console.log('Agent would be registered as:', GLOBALSOCIAL_AGENT_NANDA);
  }
}

async function verifyRegistration() {
  const NANDA_BASE_URL = process.env.NANDA_BASE_URL || 'https://chat.nanda-registry.com:6900';
  
  console.log('🔍 Verifying agent registration...');
  
  try {
    const response = await fetch(`${NANDA_BASE_URL}/api/v1/agents?owner=globalsocial.network`);
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

// Run registration if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  registerAgent();
}

export { registerAgent, GLOBALSOCIAL_AGENT };