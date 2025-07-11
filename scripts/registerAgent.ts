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

// Real NANDA Registry format based on official API
const GLOBALSOCIAL_AGENT_NANDA = {
  name: "GlobalSocial Trust Network",
  description: "Social trust network platform with AI agents, payment escrow, and logistics coordination for seamless travel commerce",
  capabilities: [
    "social_commerce", 
    "trust_escrow", 
    "peer_delivery", 
    "travel_logistics",
    "multi_agent_orchestration",
    "conversational_ai"
  ],
  endpoint: process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}/api/agents` : "https://your-app.replit.app/api/agents",
  version: "1.0.0",
  metadata: {
    owner: "did:web:globalsocial.network",
    region: "Global",
    performance_score: 95.0,
    icon: "globe-2",
    contact: "admin@globalsocial.network"
  }
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
  const NANDA_BASE_URL = process.env.NANDA_BASE_URL || 'https://nanda-registry.com';
  
  console.log('🚀 Registering GlobalSocial agent with real NANDA registry...');
  console.log('Registry URL:', NANDA_BASE_URL);
  console.log('Agent data:', JSON.stringify(GLOBALSOCIAL_AGENT_NANDA, null, 2));
  
  try {
    const response = await fetch(`${NANDA_BASE_URL}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GlobalSocial-Agent-Registration/1.0',
        'Accept': 'application/json'
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
    console.log('Assigned Agent ID:', result.agent_id);
    console.log('Registry response:', result);
    
    // Store the assigned agent_id for future use
    if (result.agent_id) {
      console.log(`📝 Store this agent_id for future operations: ${result.agent_id}`);
    }
    
    // Verify registration by querying back
    await verifyRegistration(result.agent_id);
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    console.log('🔍 This might be due to:');
    console.log('- Missing authentication credentials');
    console.log('- Network connectivity issues');
    console.log('- Registry API changes');
    console.log('- Endpoint validation failures');
  }
}

async function verifyRegistration(agentId?: string) {
  const NANDA_BASE_URL = process.env.NANDA_BASE_URL || 'https://nanda-registry.com';
  
  console.log('🔍 Verifying agent registration...');
  
  try {
    if (agentId) {
      // Query specific agent by ID
      const response = await fetch(`${NANDA_BASE_URL}/api/agents/${agentId}`);
      if (response.ok) {
        const agent = await response.json();
        console.log('✅ Agent found in registry!');
        console.log('Agent details:', agent);
        return;
      }
    }
    
    // Query all agents and find ours
    const response = await fetch(`${NANDA_BASE_URL}/api/agents`);
    if (response.ok) {
      const agents = await response.json();
      const ourAgent = agents.find((agent: any) => 
        agent.name === GLOBALSOCIAL_AGENT_NANDA.name ||
        agent.endpoint?.includes(process.env.REPLIT_DOMAINS || 'replit.dev')
      );
      
      if (ourAgent) {
        console.log('✅ Agent found in registry!');
        console.log('Agent ID:', ourAgent.agent_id || ourAgent.id);
        console.log('Status:', ourAgent.status);
      } else {
        console.log('⚠️ Agent not found in registry results');
        console.log('Available agents:', agents.length);
      }
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