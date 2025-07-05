# Conductor Orchestration Testing Guide

## How to Test the OpenAI Agents-SDK Conductor System

The Conductor orchestration system is now implemented and ready for testing. Here's how to verify it works:

## 1. Visual Testing in the UI

### Conductor Dashboard
- **Location**: Bottom-right corner of the screen (purple "Conductor" button)
- **What to see**: Real-time orchestration activity, agent workflows, crowd heat data
- **Status**: Shows connection status (LIVE/OFFLINE) and recent activity

### Testing Steps:
1. **Login** to the platform
2. **Click the Conductor button** in bottom-right corner
3. **Perform user actions** like:
   - Browse social feed
   - Initiate a purchase
   - Chat with Blink agents
   - Upload travel itinerary
4. **Watch the dashboard** for real-time updates

## 2. API Testing with curl

### Test Conductor Analysis Directly
```bash
# Test the Conductor reasoning engine
curl -X POST http://localhost:5000/api/conductor/test \
  -H "Content-Type: application/json" \
  -d '{
    "action": {
      "intent": "I want to buy vintage electronics in Tokyo and ship them globally",
      "budget": 500,
      "urgency": "high"
    },
    "userId": "test-user-123"
  }'
```

**Expected Response**: GPT-4o analysis with agent workflows
```json
{
  "success": true,
  "analysis": {
    "reasoning": "User shows intent to purchase vintage electronics...",
    "workflows": [
      {
        "agentId": "localelens",
        "action": "local_discovery",
        "parameters": { "destination": "Tokyo", "category": "electronics" },
        "priority": "high"
      },
      {
        "agentId": "trustpay", 
        "action": "escrow_creation",
        "parameters": { "amount": 500, "currency": "USD" },
        "priority": "critical"
      }
    ]
  }
}
```

### Test Event Bus Status
```bash
# Check event bus activity
curl http://localhost:5000/api/conductor/status
```

**Expected Response**:
```json
{
  "conductor": {
    "activeContexts": "available",
    "uptime": 1247.52
  },
  "eventBus": {
    "messageQueue": 3,
    "agentTorchQueue": 7,
    "subscribers": 4,
    "uptime": 1247.52
  }
}
```

### Test AgentTorch Batch Processing
```bash
# Trigger AgentTorch crowd heat analysis
curl -X POST http://localhost:5000/api/agenttorch/batch \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "processed": 15,
  "insights": [
    {
      "type": "agenttorch_predictions",
      "data": [
        {
          "location": "Tokyo",
          "predicted_demand": 85,
          "trend": "rising",
          "confidence": 0.9,
          "factors": ["high_purchase_activity", "travel_activity"]
        }
      ]
    }
  ]
}
```

### Test Webhook Integration
```bash
# Test external webhook processing
curl -X POST http://localhost:5000/api/conductor/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "external-user",
    "event": "purchase_completed",
    "data": {
      "amount": 250,
      "location": "Seoul",
      "category": "fashion"
    },
    "sessionId": "webhook-test-session"
  }'
```

## 3. Real-time Testing with User Actions

### Enable Full Orchestration
To see the Conductor analyze every user action:

1. **Uncomment middleware** in `server/routes.ts`:
```typescript
// Change this:
// app.use(conductorMiddleware);
// app.use(conductorResponseMiddleware);

// To this:
app.use(conductorMiddleware);
app.use(conductorResponseMiddleware);
```

2. **Restart the application**
3. **Perform any user action** (browse feed, make purchase, chat)
4. **Check server logs** for Conductor analysis
5. **Check API responses** for `_conductor` field with insights

### What You'll See in Logs:
```
🎯 Conductor middleware intercepted: browse_feed
🎯 Conductor analyzing action: click at /api/feed
🤖 Executing localelens workflow: local_discovery
📡 EventBus: Publishing to user.browse_feed
✅ Workflow completed: localelens:local_discovery
```

### Enhanced API Responses:
Every API response will include conductor insights:
```json
{
  "products": [...],
  "_conductor": {
    "reasoning": "User is browsing the social feed, likely looking for trending products...",
    "workflows": [
      {
        "agent": "localelens",
        "action": "local_discovery", 
        "priority": "medium"
      }
    ],
    "contextUpdates": 2,
    "timestamp": "2025-01-05T06:30:00.000Z"
  }
}
```

## 4. Context Memory Testing

### Test Session Persistence
```bash
# First request with session
curl -X POST http://localhost:5000/api/conductor/test \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: persistent-session-123" \
  -d '{
    "action": { "intent": "Looking for Japanese street food" },
    "userId": "memory-test-user"
  }'

# Second request with same session - should reference previous context
curl -X POST http://localhost:5000/api/conductor/test \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: persistent-session-123" \
  -d '{
    "action": { "intent": "Now I want to book delivery" },
    "userId": "memory-test-user"  
  }'
```

The second response should reference the first interaction in its reasoning.

## 5. Agent Workflow Verification

### Individual Agent Testing
Test each specialized agent through the Conductor:

**LocaleLens Agent**:
```bash
curl -X POST http://localhost:5000/api/conductor/test \
  -d '{"action": {"intent": "Find authentic ramen in Shibuya"}}'
```

**TrustPay Agent**:
```bash
curl -X POST http://localhost:5000/api/conductor/test \
  -d '{"action": {"intent": "Set up secure payment for $200 purchase"}}'
```

**PathSync Agent**:
```bash
curl -X POST http://localhost:5000/api/conductor/test \
  -d '{"action": {"intent": "Find travelers from Tokyo to New York"}}'
```

**GlobeGuides Agent**:
```bash
curl -X POST http://localhost:5000/api/conductor/test \
  -d '{"action": {"intent": "Parse my flight itinerary PDF"}}'
```

## 6. Expected Results

### ✅ Success Indicators:
- **Conductor Dashboard shows activity**
- **Server logs show workflow execution**
- **API responses include `_conductor` insights** 
- **GPT-4o reasoning is logical and relevant**
- **Agent workflows match user intent**
- **Event bus processes messages**
- **AgentTorch generates crowd predictions**

### ❌ Troubleshooting:
- **No Conductor activity**: Check if OPENAI_API_KEY is set
- **"Conductor Dashboard" button missing**: Restart application
- **TypeScript errors**: All LSP issues have been fixed
- **API errors**: Check server logs for detailed error messages

## 7. Architecture Flow Verification

Test the complete flow:
```
User Action → Conductor Analysis → Agent Workflows → Event Bus → AgentTorch → UI Updates
```

1. **User clicks "Buy Product"** 
2. **Conductor analyzes intent** (GPT-4o reasoning)
3. **Coordinates TrustPay + LocaleLens agents**
4. **Publishes events to Event Bus**
5. **AgentTorch processes batch data**
6. **Crowd heat updates feed back to UI**
7. **Dashboard shows real-time activity**

This creates the exact orchestration system you specified with centralized AI coordination and real-time feedback loops.

## Prerequisites

**Required Secret**: OPENAI_API_KEY for GPT-4o reasoning engine
**Optional**: Set additional API keys for enhanced agent capabilities (Perplexity, Mapbox)

The system gracefully degrades if APIs are unavailable, but the core orchestration requires OpenAI for the Conductor's reasoning engine.