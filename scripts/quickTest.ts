#!/usr/bin/env tsx

// Quick NANDA protocol test
async function quickTest() {
  const BASE_URL = 'https://fe969c27-b96a-49a8-ab90-2db1ba25eebc-00-2wuvibtzdsxam.worf.replit.dev';
  
  console.log('=== Quick NANDA Protocol Test ===');

  // Test methods endpoint
  console.log('\n1. Testing methods discovery...');
  try {
    const methodsResponse = await fetch(`${BASE_URL}/api/agents/methods`);
    const methodsText = await methodsResponse.text();
    console.log('Methods response:', methodsText.slice(0, 200));
  } catch (error) {
    console.log('Methods error:', error.message);
  }

  // Test RPC endpoint
  console.log('\n2. Testing RPC ping...');
  try {
    const rpcResponse = await fetch(`${BASE_URL}/api/agents/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'ping',
        params: {},
        id: 'test'
      })
    });
    const rpcText = await rpcResponse.text();
    console.log('RPC response:', rpcText.slice(0, 200));
  } catch (error) {
    console.log('RPC error:', error.message);
  }

  // Test basic agent endpoint
  console.log('\n3. Testing basic agent endpoint...');
  try {
    const agentResponse = await fetch(`${BASE_URL}/api/agents`);
    const agentData = await agentResponse.json();
    console.log('Agent data keys:', Object.keys(agentData));
  } catch (error) {
    console.log('Agent error:', error.message);
  }
}

quickTest().catch(console.error);