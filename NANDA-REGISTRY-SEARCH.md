# NANDA Registry Agent Discovery Guide

## How to Search for Agents in the NANDA Network

### Registry Endpoints

**Primary Registry**: `https://chat.nanda-registry.com:6900`

**Standard NANDA Registry API:**
```
GET  /agents                    - List all registered agents
GET  /agent/{agent_id}          - Get specific agent information  
POST /search                    - Search agents by criteria
POST /register                  - Register new agent
POST /heartbeat                 - Send agent heartbeat
```

### Search Methods

#### 1. List All Agents
```bash
curl https://chat.nanda-registry.com:6900/agents
```

#### 2. Search by Agent ID
```bash
curl https://chat.nanda-registry.com:6900/agent/globalsocial-001
```

#### 3. Search by Capabilities
```bash
curl -X POST https://chat.nanda-registry.com:6900/search \
  -H "Content-Type: application/json" \
  -d '{
    "capabilities": ["social_commerce", "trust_escrow"]
  }'
```

#### 4. Search by Region/Performance
```bash
curl -X POST https://chat.nanda-registry.com:6900/search \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Global",
    "min_performance": 90.0,
    "status": "active"
  }'
```

### Our Agent Information

**GlobalSocial Trust Network Agent:**
- **Agent ID**: `globalsocial-001`
- **Name**: `GlobalSocial Trust Network`
- **Endpoint**: `http://localhost:5000/api/agents` (development)
- **RPC Endpoint**: `http://localhost:5000/api/agents/rpc`
- **Capabilities**: `social_commerce`, `trust_escrow`, `peer_delivery`, `travel_logistics`, `multi_agent_orchestration`
- **Status**: Active (attempting registration)

### Cross-Agent Communication

#### Step 1: Discover Agent
```javascript
// Search for agents with specific capabilities
const searchResponse = await fetch('https://chat.nanda-registry.com:6900/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    capabilities: ['travel_logistics']
  })
});

const agents = await searchResponse.json();
```

#### Step 2: Get Agent Details
```javascript
// Get specific agent information
const agentResponse = await fetch('https://chat.nanda-registry.com:6900/agent/some-agent-id');
const agentInfo = await agentResponse.json();

// Extract RPC endpoint
const rpcEndpoint = agentInfo.rpc_endpoint;
```

#### Step 3: Communicate with Agent
```javascript
// Send JSON-RPC request to discovered agent
const rpcRequest = {
  jsonrpc: '2.0',
  method: 'travel_logistics.parse_itinerary',
  params: {
    document: 'base64_pdf_data',
    filename: 'travel-itinerary.pdf'
  },
  id: 'cross-agent-request-123'
};

const response = await fetch(rpcEndpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(rpcRequest)
});

const result = await response.json();
```

### Agent Discovery Patterns

#### Find Complementary Services
```javascript
// Find agents that complement our services
const complementaryCapabilities = [
  'payment_processing',     // To enhance our trust_escrow
  'identity_verification',  // To strengthen our social_commerce
  'logistics_optimization', // To improve our peer_delivery
  'translation_services',   // To expand our multi_agent_orchestration
  'fraud_detection'         // To secure our trust network
];

for (const capability of complementaryCapabilities) {
  const agents = await searchByCapability(capability);
  // Establish partnerships with discovered agents
}
```

#### Network Effect Discovery
```javascript
// Find agents in our operational regions
const regions = ['Global', 'Asia-Pacific', 'Europe', 'North America'];

for (const region of regions) {
  const regionalAgents = await searchByRegion(region);
  // Build regional partnerships
}
```

### Integration Examples

#### Business Partnership Request
```javascript
// Request to establish business partnership
const partnershipRequest = {
  jsonrpc: '2.0',
  method: 'partnership.establish',
  params: {
    requesting_agent: 'globalsocial-001',
    capabilities_offered: ['social_commerce', 'trust_escrow'],
    capabilities_needed: ['payment_processing'],
    partnership_type: 'service_integration'
  },
  id: 'partnership-001'
};
```

#### Cross-Agent Transaction
```javascript
// Initiate cross-agent business transaction
const crossAgentTransaction = {
  jsonrpc: '2.0',
  method: 'trust_escrow.create_cross_agent_escrow',
  params: {
    buyer_agent: 'globalsocial-001',
    seller_agent: 'discovered-merchant-agent',
    product_id: 'remote-product-456',
    amount: 250,
    currency: 'USD'
  },
  id: 'cross-agent-txn-789'
};
```

### Registry Monitoring

#### Check Registration Status
```bash
# Monitor our agent registration
curl https://chat.nanda-registry.com:6900/agent/globalsocial-001

# Expected responses:
# 200 OK + agent data = Successfully registered
# 404 Not Found = Not yet registered
# 500 Internal Error = Registration being processed
```

#### Network Health Monitoring
```bash
# Monitor overall network health
curl https://chat.nanda-registry.com:6900/agents | jq '.[] | {id: .agent_id, status: .status}'
```

### Production Deployment Notes

**For Production NANDA Network Access:**
1. Deploy app to production environment (removes Vite dev server conflicts)
2. Update agent endpoint to production URL
3. Re-register with production endpoint
4. Monitor for successful registry acceptance
5. Begin cross-agent discovery and integration

**Current Development Limitations:**
- Vite dev server intercepts external requests
- localhost endpoint not accessible from registry
- Manual testing required for full validation

**Recommended Next Steps:**
1. Deploy to production environment
2. Complete agent registration with registry
3. Monitor for other agents joining network
4. Establish business partnerships with compatible agents
5. Implement cross-agent trust and reputation systems