#!/usr/bin/env tsx

// Comprehensive validation of NANDA integration
// Tests both protocol compliance and business logic integration

async function validateNANDAIntegration() {
  const LOCAL_URL = 'http://localhost:5000';
  
  console.log('=== NANDA Integration Validation ===');

  let testsPassed = 0;
  let totalTests = 0;

  async function runTest(testName: string, testFn: () => Promise<boolean>): Promise<void> {
    totalTests++;
    try {
      const result = await testFn();
      if (result) {
        console.log(`✅ ${testName}`);
        testsPassed++;
      } else {
        console.log(`❌ ${testName}`);
      }
    } catch (error) {
      console.log(`❌ ${testName}: ${error.message}`);
    }
  }

  // Test 1: Agent Info Compliance
  await runTest('Agent Info NANDA Compliance', async () => {
    const response = await fetch(`${LOCAL_URL}/api/agents`);
    const data = await response.json();
    
    const requiredFields = ['agent_id', 'name', 'status', 'capabilities', 'rpc_endpoint'];
    return requiredFields.every(field => data[field]);
  });

  // Test 2: Methods Discovery
  await runTest('Methods Discovery Working', async () => {
    const response = await fetch(`${LOCAL_URL}/api/agents/methods`);
    const data = await response.json();
    
    return data.success && data.methods && data.methods.length > 0;
  });

  // Test 3: JSON-RPC Format Compliance
  await runTest('JSON-RPC 2.0 Format Compliance', async () => {
    const rpcRequest = {
      jsonrpc: '2.0',
      method: 'ping',
      params: {},
      id: 'compliance-test'
    };

    const response = await fetch(`${LOCAL_URL}/api/agents/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcRequest)
    });

    const data = await response.json();
    return data.jsonrpc === '2.0' && data.id === 'compliance-test' && data.result;
  });

  // Test 4: All Business Capabilities Available
  await runTest('All Business Capabilities Available', async () => {
    const response = await fetch(`${LOCAL_URL}/api/agents/methods`);
    const data = await response.json();
    
    const requiredCapabilities = [
      'social_commerce.get_products',
      'trust_escrow.create_escrow',
      'peer_delivery.find_travelers',
      'travel_logistics.parse_itinerary',
      'multi_agent_orchestration.discover_agents'
    ];
    
    return requiredCapabilities.every(cap => data.methods?.includes(cap));
  });

  // Test 5: Error Handling
  await runTest('Invalid Method Error Handling', async () => {
    const rpcRequest = {
      jsonrpc: '2.0',
      method: 'invalid.method',
      params: {},
      id: 'error-test'
    };

    const response = await fetch(`${LOCAL_URL}/api/agents/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcRequest)
    });

    const data = await response.json();
    return data.error && data.error.code === -32601; // Method not found
  });

  // Test 6: Social Commerce Integration
  await runTest('Social Commerce Integration', async () => {
    const rpcRequest = {
      jsonrpc: '2.0',
      method: 'social_commerce.get_products',
      params: { location: 'Tokyo' },
      id: 'commerce-test'
    };

    const response = await fetch(`${LOCAL_URL}/api/agents/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcRequest)
    });

    const data = await response.json();
    return data.result?.success && 'products' in data.result;
  });

  // Test 7: Trust Escrow Integration
  await runTest('Trust Escrow Integration', async () => {
    const rpcRequest = {
      jsonrpc: '2.0',
      method: 'trust_escrow.create_escrow',
      params: { productId: '1', amount: 100, currency: 'USD' },
      id: 'escrow-test'
    };

    const response = await fetch(`${LOCAL_URL}/api/agents/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcRequest)
    });

    const data = await response.json();
    return data.result?.success && data.result?.transaction;
  });

  console.log('\n=== Validation Results ===');
  console.log(`Tests passed: ${testsPassed}/${totalTests}`);
  console.log(`Success rate: ${Math.round((testsPassed/totalTests) * 100)}%`);

  if (testsPassed === totalTests) {
    console.log('\n🎉 NANDA Integration Fully Validated!');
    console.log('✅ Protocol compliance confirmed');
    console.log('✅ Business logic integration working');
    console.log('✅ Ready for production deployment');
  } else {
    console.log('\n⚠️  Some tests failed - review integration');
  }

  return testsPassed === totalTests;
}

validateNANDAIntegration().catch(console.error);