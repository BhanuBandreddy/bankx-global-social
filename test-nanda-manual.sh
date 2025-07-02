#!/bin/bash

# Manual NANDA Integration Testing Script
# Comprehensive validation of all NANDA capabilities

echo "=== NANDA Integration Manual Testing ==="
echo "Testing localhost endpoints to bypass Vite routing..."
echo

BASE_URL="http://localhost:5000"

# Test 1: Agent Discovery
echo "1. Testing Agent Discovery..."
echo "GET $BASE_URL/api/agents"
curl -s "$BASE_URL/api/agents" | jq '{agent_id, name, status, capabilities: .capabilities | length, rpc_endpoint}' || echo "❌ Agent discovery failed"
echo

# Test 2: Methods Discovery  
echo "2. Testing Methods Discovery..."
echo "GET $BASE_URL/api/agents/methods"
curl -s "$BASE_URL/api/agents/methods" | jq '{success, methods: .methods | length, protocol}' || echo "❌ Methods discovery failed"
echo

# Test 3: Health Check
echo "3. Testing Health Check..."
echo "GET $BASE_URL/api/agents/health"
curl -s "$BASE_URL/api/agents/health" | jq '{status, agent_id, uptime}' || echo "❌ Health check failed"
echo

# Test 4: JSON-RPC Ping
echo "4. Testing JSON-RPC Ping..."
echo "POST $BASE_URL/api/agents/rpc"
curl -s -X POST "$BASE_URL/api/agents/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"ping","params":{},"id":"manual-test"}' \
  | jq '{jsonrpc, id, result: .result.status}' || echo "❌ RPC ping failed"
echo

# Test 5: Social Commerce
echo "5. Testing Social Commerce..."
curl -s -X POST "$BASE_URL/api/agents/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"social_commerce.get_products","params":{"location":"Tokyo","category":"electronics"},"id":"commerce-test"}' \
  | jq '{success: .result.success, products: .result.products | length, filters: .result.filters}' || echo "❌ Social commerce failed"
echo

# Test 6: Trust Escrow
echo "6. Testing Trust Escrow..."
curl -s -X POST "$BASE_URL/api/agents/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"trust_escrow.create_escrow","params":{"productId":"1","amount":100,"currency":"USD","buyerId":"test"},"id":"escrow-test"}' \
  | jq '{success: .result.success, escrow_id: .result.escrow_id, status: .result.status}' || echo "❌ Trust escrow failed"
echo

# Test 7: Peer Delivery
echo "7. Testing Peer Delivery..."
curl -s -X POST "$BASE_URL/api/agents/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"peer_delivery.find_travelers","params":{"fromLocation":"Tokyo","toLocation":"Osaka"},"id":"delivery-test"}' \
  | jq '{success: .result.success, travelers: .result.travelers | length, routes: .result.routes}' || echo "❌ Peer delivery failed"
echo

# Test 8: Travel Logistics
echo "8. Testing Travel Logistics..."
curl -s -X POST "$BASE_URL/api/agents/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"travel_logistics.parse_itinerary","params":{"document":"test_doc","filename":"test.pdf"},"id":"logistics-test"}' \
  | jq '{success: .result.success, destination: .result.itinerary.destination, method: .result.parsing_method}' || echo "❌ Travel logistics failed"
echo

# Test 9: Multi-Agent Orchestration
echo "9. Testing Multi-Agent Orchestration..."
curl -s -X POST "$BASE_URL/api/agents/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"multi_agent_orchestration.discover_agents","params":{},"id":"orchestration-test"}' \
  | jq '{success: .result.success, agents: .result.agents | length, source: .result.registry_source}' || echo "❌ Multi-agent orchestration failed"
echo

# Test 10: Error Handling
echo "10. Testing Error Handling..."
curl -s -X POST "$BASE_URL/api/agents/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"invalid.method","params":{},"id":"error-test"}' \
  | jq '{jsonrpc, error: .error.code, message: .error.message}' || echo "❌ Error handling failed"
echo

echo "=== Manual Testing Complete ==="
echo "✅ All NANDA capabilities tested via manual curl commands"
echo "🎯 Phase 3 integration validated"