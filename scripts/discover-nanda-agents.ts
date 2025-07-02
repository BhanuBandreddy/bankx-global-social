#!/usr/bin/env tsx

// NANDA Agent Discovery and Registry Search
// Shows how to find and interact with agents in the NANDA network

const NANDA_REGISTRY = 'https://chat.nanda-registry.com:6900';
const LOCAL_AGENT = 'http://localhost:5000/api/agents';

class NANDAAgentDiscovery {
  
  async searchRegistryAgents() {
    console.log('=== NANDA Registry Agent Discovery ===');
    console.log(`Registry URL: ${NANDA_REGISTRY}`);
    
    // Method 1: Direct registry search (if available)
    console.log('\n1. Attempting direct registry agent list...');
    try {
      const listResponse = await fetch(`${NANDA_REGISTRY}/agents`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log(`Registry response: ${listResponse.status}`);
      
      if (listResponse.ok) {
        const agents = await listResponse.json();
        console.log('✅ Found agents:', agents.length || 'unknown count');
        if (agents.length) {
          agents.slice(0, 3).forEach((agent: any, i: number) => {
            console.log(`   ${i+1}. ${agent.name || agent.id} - ${agent.capabilities?.join(', ') || 'no capabilities listed'}`);
          });
        }
      } else {
        console.log('⚠️  Registry agent list not available via GET /agents');
      }
    } catch (error) {
      console.log(`❌ Registry search failed: ${error.message}`);
    }

    // Method 2: Search by capability
    console.log('\n2. Searching by capability...');
    try {
      const capabilitySearch = await fetch(`${NANDA_REGISTRY}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capabilities: ['social_commerce', 'trust_escrow']
        })
      });
      
      console.log(`Capability search response: ${capabilitySearch.status}`);
      
      if (capabilitySearch.ok) {
        const results = await capabilitySearch.json();
        console.log('✅ Capability search results available');
      } else {
        console.log('⚠️  Capability search not available via POST /search');
      }
    } catch (error) {
      console.log(`❌ Capability search failed: ${error.message}`);
    }

    // Method 3: Discovery via ping
    console.log('\n3. Testing known agent endpoints...');
    const knownAgentPatterns = [
      'globalsocial-001',
      'trustpay-agent',
      'travel-logistics',
      'peer-delivery-network'
    ];

    for (const agentId of knownAgentPatterns) {
      try {
        // Try to reach agent directly if we knew the pattern
        const agentResponse = await fetch(`${NANDA_REGISTRY}/agent/${agentId}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (agentResponse.ok) {
          const agentInfo = await agentResponse.json();
          console.log(`✅ Found agent: ${agentId}`);
        } else {
          console.log(`❌ Agent not found: ${agentId} (${agentResponse.status})`);
        }
      } catch (error) {
        console.log(`❌ Agent lookup failed: ${agentId}`);
      }
    }
  }

  async validateOurRegistration() {
    console.log('\n=== Validating Our Agent Registration ===');
    
    // Check if our agent is discoverable
    console.log('1. Checking if GlobalSocial agent is registered...');
    try {
      const ourAgentCheck = await fetch(`${NANDA_REGISTRY}/agent/globalsocial-001`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (ourAgentCheck.ok) {
        const agentData = await ourAgentCheck.json();
        console.log('✅ GlobalSocial agent found in registry!');
        console.log(`   Name: ${agentData.name}`);
        console.log(`   Capabilities: ${agentData.capabilities?.join(', ')}`);
        console.log(`   Endpoint: ${agentData.endpoint}`);
      } else {
        console.log(`⚠️  GlobalSocial agent not yet discoverable (${ourAgentCheck.status})`);
      }
    } catch (error) {
      console.log(`❌ Agent registration check failed: ${error.message}`);
    }

    // Test our agent's discoverability
    console.log('\n2. Testing our agent endpoint accessibility...');
    try {
      const ourAgentTest = await fetch(LOCAL_AGENT);
      const agentData = await ourAgentTest.json();
      
      console.log('✅ Our agent endpoint accessible:');
      console.log(`   Agent ID: ${agentData.agent_id}`);
      console.log(`   Name: ${agentData.name}`);
      console.log(`   Status: ${agentData.status}`);
      console.log(`   RPC Endpoint: ${agentData.rpc_endpoint}`);
      console.log(`   Capabilities: ${agentData.capabilities?.length} items`);
    } catch (error) {
      console.log(`❌ Our agent endpoint failed: ${error.message}`);
    }
  }

  async demonstrateAgentInteraction() {
    console.log('\n=== Agent Interaction Examples ===');
    
    // Example 1: Ping another agent (if we found one)
    console.log('1. Example: Ping interaction with discovered agent...');
    console.log('   // If we found another agent at some_endpoint:');
    console.log('   const pingRequest = {');
    console.log('     jsonrpc: "2.0",');
    console.log('     method: "ping",');
    console.log('     params: {},');
    console.log('     id: "discovery-ping"');
    console.log('   };');
    console.log('   const response = await fetch("agent_endpoint/rpc", {');
    console.log('     method: "POST",');
    console.log('     body: JSON.stringify(pingRequest)');
    console.log('   });');

    // Example 2: Request capabilities
    console.log('\n2. Example: Requesting agent capabilities...');
    console.log('   const capabilitiesRequest = {');
    console.log('     jsonrpc: "2.0",');
    console.log('     method: "get_capabilities",');
    console.log('     params: {},');
    console.log('     id: "capabilities-query"');
    console.log('   };');

    // Example 3: Cross-agent business request
    console.log('\n3. Example: Cross-agent business request...');
    console.log('   const businessRequest = {');
    console.log('     jsonrpc: "2.0",');
    console.log('     method: "trust_escrow.create_escrow",');
    console.log('     params: {');
    console.log('       productId: "remote-product-123",');
    console.log('       amount: 150,');
    console.log('       currency: "USD"');
    console.log('     },');
    console.log('     id: "cross-agent-escrow"');
    console.log('   };');
  }

  async showRegistrySearchMethods() {
    console.log('\n=== NANDA Registry Search Methods ===');
    
    console.log('📋 Standard NANDA Registry Endpoints:');
    console.log('   GET  /agents                    - List all registered agents');
    console.log('   GET  /agent/{agent_id}          - Get specific agent info');
    console.log('   POST /search                    - Search agents by criteria');
    console.log('   POST /register                  - Register new agent');
    console.log('   POST /heartbeat                 - Agent heartbeat');
    console.log('');
    
    console.log('🔍 Search Criteria Examples:');
    console.log('   By capability:    { "capabilities": ["social_commerce"] }');
    console.log('   By region:        { "region": "Global" }');
    console.log('   By performance:   { "min_performance": 90.0 }');
    console.log('   By status:        { "status": "active" }');
    console.log('');
    
    console.log('💬 Cross-Agent Communication:');
    console.log('   1. Discover agent via registry search');
    console.log('   2. Get agent RPC endpoint from agent info');
    console.log('   3. Send JSON-RPC request to agent.rpc_endpoint');
    console.log('   4. Handle response according to JSON-RPC 2.0 spec');
    console.log('');
    
    console.log('🌐 Our Agent Discovery Info:');
    console.log(`   Agent ID: globalsocial-001`);
    console.log(`   Registry: ${NANDA_REGISTRY}`);
    console.log(`   Endpoint: ${LOCAL_AGENT}`);
    console.log(`   RPC: ${LOCAL_AGENT.replace('/api/agents', '/api/agents/rpc')}`);
    console.log(`   Capabilities: social_commerce, trust_escrow, peer_delivery, travel_logistics, multi_agent_orchestration`);
  }

  async runCompleteDiscovery() {
    console.log('🔍 NANDA Agent Discovery & Registry Search');
    console.log('==========================================');
    
    await this.searchRegistryAgents();
    await this.validateOurRegistration(); 
    await this.showRegistrySearchMethods();
    await this.demonstrateAgentInteraction();
    
    console.log('\n🎯 Discovery Summary:');
    console.log('✅ Registry search methods documented');
    console.log('✅ Agent interaction patterns demonstrated');
    console.log('✅ Our agent registration status checked');
    console.log('✅ Cross-agent communication examples provided');
    console.log('\n📝 Next Steps:');
    console.log('1. Monitor registry for agent registration acceptance');
    console.log('2. Use registry search to find compatible agents');
    console.log('3. Establish cross-agent business workflows');
    console.log('4. Implement agent-to-agent trust protocols');
  }
}

// Run complete discovery process
const discovery = new NANDAAgentDiscovery();
discovery.runCompleteDiscovery().catch(console.error);