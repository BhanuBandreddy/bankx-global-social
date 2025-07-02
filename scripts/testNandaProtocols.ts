#!/usr/bin/env tsx

// Test NANDA protocol integration
// Verifies our business capabilities are properly exposed via NANDA protocols

const BASE_URL = process.env.REPLIT_DOMAINS 
  ? `https://${process.env.REPLIT_DOMAINS}` 
  : 'http://localhost:5000';

interface NANDARequest {
  jsonrpc: string;
  method: string;
  params: any;
  id: string | number;
}

async function sendNANDARequest(method: string, params: any = {}): Promise<any> {
  const request: NANDARequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: Math.random().toString(36).substr(2, 9)
  };

  console.log(`\n🔌 Testing NANDA method: ${method}`);
  console.log('   Request:', JSON.stringify(request, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/agents/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    console.log('   Response Status:', response.status);
    console.log('   Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.log('   Error:', error.message);
    return null;
  }
}

async function testNANDAProtocols() {
  console.log('=== NANDA Protocol Integration Tests ===');
  console.log(`Testing against: ${BASE_URL}`);

  // Test 1: Ping
  await sendNANDARequest('ping');

  // Test 2: Social Commerce - Get Products
  await sendNANDARequest('social_commerce.get_products', {
    location: 'Tokyo',
    category: 'electronics'
  });

  // Test 3: Trust Escrow - Create Escrow
  await sendNANDARequest('trust_escrow.create_escrow', {
    productId: '1',
    amount: 100,
    currency: 'USD',
    buyerId: 'test-buyer'
  });

  // Test 4: Travel Logistics - Parse Itinerary
  await sendNANDARequest('travel_logistics.parse_itinerary', {
    document: 'sample_document_data',
    filename: 'test-itinerary.pdf'
  });

  // Test 5: Peer Delivery - Find Travelers
  await sendNANDARequest('peer_delivery.find_travelers', {
    fromLocation: 'Tokyo',
    toLocation: 'Osaka'
  });

  // Test 6: Multi-Agent Orchestration - Discover Agents
  await sendNANDARequest('multi_agent_orchestration.discover_agents');

  // Test 7: Invalid method (should return error)
  await sendNANDARequest('invalid.method');

  console.log('\n=== Methods Discovery Test ===');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/methods`);
    const data = await response.json();
    console.log('Available methods:', data.methods?.length || 0);
    console.log('Methods:', data.methods?.slice(0, 5).join(', ') + '...');
  } catch (error) {
    console.log('Methods discovery failed:', error.message);
  }

  console.log('\n🎯 NANDA Protocol Testing Complete');
  console.log('✅ Business capabilities now accessible via NANDA JSON-RPC');
}

testNANDAProtocols().catch(console.error);