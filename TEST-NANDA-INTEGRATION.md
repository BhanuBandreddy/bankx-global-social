# NANDA Integration Testing Guide

## How to Test Phase 2 Updates

### Quick Testing Steps

**1. Test Agent Discovery**
```bash
curl http://localhost:5000/api/agents
```
Expected: Returns agent info with `rpc_endpoint` and `methods_endpoint`

**2. Test Methods Discovery**
```bash
curl http://localhost:5000/api/agents/methods
```
Expected: Returns list of available NANDA methods

**3. Test JSON-RPC Ping**
```bash
curl -X POST http://localhost:5000/api/agents/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"ping","params":{},"id":"test"}'
```
Expected: Returns `{"jsonrpc":"2.0","result":{"status":"pong"},"id":"test"}`

**4. Test Business Capability**
```bash
curl -X POST http://localhost:5000/api/agents/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"social_commerce.get_products","params":{"location":"Tokyo"},"id":"test"}'
```
Expected: Returns products data via NANDA protocol

### Automated Testing

**Run Comprehensive Validation:**
```bash
cd scripts && npx tsx validateNandaIntegration.ts
```

**Run Local Protocol Tests:**
```bash
cd scripts && npx tsx testNandaLocal.ts
```

## What's Been Implemented

### NANDA Protocol Bridge
- ✅ JSON-RPC 2.0 compatibility
- ✅ Method routing to business capabilities
- ✅ Error handling with proper codes
- ✅ Agent discovery endpoints

### Business Capability Mapping
- ✅ `social_commerce.*` → Product catalog and feed
- ✅ `trust_escrow.*` → Payment escrow system  
- ✅ `peer_delivery.*` → Traveler network
- ✅ `travel_logistics.*` → Document parsing and local discovery
- ✅ `multi_agent_orchestration.*` → Agent discovery

### Agent Endpoints
- ✅ `/api/agents` - Agent information (NANDA registry format)
- ✅ `/api/agents/methods` - Available methods discovery
- ✅ `/api/agents/rpc` - JSON-RPC 2.0 endpoint
- ✅ `/api/agents/health` - Health check

## Testing Issues

### Vite Development Server Conflict
The external domain tests fail because Vite's dev server intercepts requests. Use localhost testing instead:

**❌ External domain:** `https://...replit.dev/api/agents/rpc` → Returns HTML
**✅ Localhost:** `http://localhost:5000/api/agents/rpc` → Returns JSON

### Production Deployment
For production NANDA network integration, the app needs to be deployed without Vite dev server conflicts.

## Expected Test Results

### Successful Integration
```
=== NANDA Integration Validation ===
✅ Agent Info NANDA Compliance
✅ Methods Discovery Working  
✅ JSON-RPC 2.0 Format Compliance
✅ All Business Capabilities Available
✅ Invalid Method Error Handling
✅ Social Commerce Integration
✅ Trust Escrow Integration

Tests passed: 7/7
Success rate: 100%

🎉 NANDA Integration Fully Validated!
```

### Available NANDA Methods
- `ping`
- `social_commerce.get_feed`
- `social_commerce.get_products` 
- `social_commerce.initiate_purchase`
- `trust_escrow.create_escrow`
- `trust_escrow.release_escrow`
- `trust_escrow.check_escrow_status`
- `peer_delivery.find_travelers`
- `peer_delivery.create_delivery_option`
- `travel_logistics.parse_itinerary`
- `travel_logistics.discover_local`
- `multi_agent_orchestration.discover_agents`
- `multi_agent_orchestration.agent_conversation`

## Next Steps

1. **Phase 3**: Deploy using NANDA SDK for production registry registration
2. **Real Agent Testing**: Test with actual NANDA agents in the network
3. **Performance Optimization**: Monitor cross-agent communication latency
4. **Security Enhancement**: Add DID-based authentication