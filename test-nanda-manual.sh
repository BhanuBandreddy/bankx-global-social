#!/bin/bash

# NANDA Integration Test Script
# Manual testing script that validates NANDA functionality

echo "🧪 NANDA Phase 3 Integration Tests"
echo "=================================="

# Test 1: Agent Registry
echo "Test 1: Checking Agent Registry..."
REGISTRY_RESPONSE=$(curl -s http://localhost:5000/api/nanda)
AGENT_COUNT=$(echo $REGISTRY_RESPONSE | jq '. | length')

if [ "$AGENT_COUNT" -gt 0 ]; then
    echo "✅ PASS: Registry returns $AGENT_COUNT agents"
    
    # Check for GlobalSocial agent
    GLOBALSOCIAL_AGENT=$(echo $REGISTRY_RESPONSE | jq '.[] | select(.id == "agent-globalsocial")')
    if [ -n "$GLOBALSOCIAL_AGENT" ]; then
        echo "✅ PASS: GlobalSocial agent found in registry"
        
        # Verify agent properties
        AGENT_NAME=$(echo $GLOBALSOCIAL_AGENT | jq -r '.name')
        AGENT_OWNER=$(echo $GLOBALSOCIAL_AGENT | jq -r '.owner')
        IS_OWN_AGENT=$(echo $GLOBALSOCIAL_AGENT | jq -r '.isOwnAgent')
        
        if [ "$AGENT_NAME" = "GlobalSocial Trust Network" ]; then
            echo "✅ PASS: Correct agent name"
        else
            echo "❌ FAIL: Incorrect agent name: $AGENT_NAME"
        fi
        
        if [ "$AGENT_OWNER" = "did:web:globalsocial.network" ]; then
            echo "✅ PASS: Correct DID owner"
        else
            echo "❌ FAIL: Incorrect DID owner: $AGENT_OWNER"
        fi
        
        if [ "$IS_OWN_AGENT" = "true" ]; then
            echo "✅ PASS: Correctly marked as own agent"
        else
            echo "❌ FAIL: Not marked as own agent"
        fi
    else
        echo "❌ FAIL: GlobalSocial agent not found"
    fi
else
    echo "❌ FAIL: Registry returns no agents"
fi

echo ""

# Test 2: Heartbeat System
echo "Test 2: Testing Heartbeat System..."
HEARTBEAT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/nanda/heartbeat \
    -H "Content-Type: application/json" \
    -d '{"agentId": "agent-globalsocial", "status": "active"}')

SUCCESS=$(echo $HEARTBEAT_RESPONSE | jq -r '.success')
IS_RUNNING=$(echo $HEARTBEAT_RESPONSE | jq -r '.isRunning')
INDICATOR=$(echo $HEARTBEAT_RESPONSE | jq -r '.indicator')
DID=$(echo $HEARTBEAT_RESPONSE | jq -r '.did')
SIGNATURE=$(echo $HEARTBEAT_RESPONSE | jq -r '.signature')

if [ "$SUCCESS" = "true" ]; then
    echo "✅ PASS: Heartbeat successful"
else
    echo "❌ FAIL: Heartbeat failed"
fi

if [ "$IS_RUNNING" = "true" ]; then
    echo "✅ PASS: Agent marked as running"
else
    echo "❌ FAIL: Agent not marked as running"
fi

if [ "$INDICATOR" = "🟢" ]; then
    echo "✅ PASS: Green indicator shown"
else
    echo "❌ FAIL: Wrong indicator: $INDICATOR"
fi

# Validate DID format
if [[ $DID =~ ^did:nanda:globalsocial:[a-f0-9]{16}$ ]]; then
    echo "✅ PASS: Valid DID format: $DID"
else
    echo "❌ FAIL: Invalid DID format: $DID"
fi

# Validate signature format
if [[ $SIGNATURE =~ ^[a-f0-9]{64}$ ]]; then
    echo "✅ PASS: Valid signature format"
else
    echo "❌ FAIL: Invalid signature format: $SIGNATURE"
fi

echo ""

# Test 3: Ping System
echo "Test 3: Testing Ping System..."
PING_RESPONSE=$(curl -s -X POST http://localhost:5000/api/nanda/ping \
    -H "Content-Type: application/json" \
    -d '{"endpoint": "https://httpbin.org/status/200"}')

PING_ENDPOINT=$(echo $PING_RESPONSE | jq -r '.endpoint')
PING_TIMESTAMP=$(echo $PING_RESPONSE | jq -r '.timestamp')

if [ "$PING_ENDPOINT" = "https://httpbin.org/status/200" ]; then
    echo "✅ PASS: Ping endpoint correctly recorded"
else
    echo "❌ FAIL: Wrong ping endpoint: $PING_ENDPOINT"
fi

if [ -n "$PING_TIMESTAMP" ] && [ "$PING_TIMESTAMP" != "null" ]; then
    echo "✅ PASS: Ping timestamp recorded"
else
    echo "❌ FAIL: No ping timestamp"
fi

echo ""

# Test 4: Capability Filtering
echo "Test 4: Testing Capability Filtering..."
FILTERED_RESPONSE=$(curl -s "http://localhost:5000/api/nanda/discover?cap=travel_commerce")
FILTERED_COUNT=$(echo $FILTERED_RESPONSE | jq '. | length')

if [ "$FILTERED_COUNT" -gt 0 ]; then
    echo "✅ PASS: Capability filtering works ($FILTERED_COUNT agents)"
    
    # Check that all agents have the required capability
    HAS_CAPABILITY=$(echo $FILTERED_RESPONSE | jq 'all(.capabilities | contains(["travel_commerce"]))')
    if [ "$HAS_CAPABILITY" = "true" ]; then
        echo "✅ PASS: All filtered agents have travel_commerce capability"
    else
        echo "❌ FAIL: Some agents missing travel_commerce capability"
    fi
else
    echo "❌ FAIL: Capability filtering returns no results"
fi

echo ""
echo "🏁 NANDA Integration Test Summary"
echo "================================="
echo "All tests completed. Check results above."
echo ""
echo "To run this script: chmod +x test-nanda-manual.sh && ./test-nanda-manual.sh"