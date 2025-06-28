# NANDA Integration Testing Guide

## Phase 1: Agent Registration Testing

### Prerequisites
- Application running on localhost:5000
- Agent Dashboard accessible at `/agent-dashboard` 
- Console access for viewing network requests

### Test 1: Mock Registry Verification (Current State)
**Steps:**
1. Navigate to Agent Dashboard
2. Open browser DevTools → Network tab
3. Wait for agent data to load (15-second refresh)
4. Verify "GlobalSocial Trust Network" appears with gold border
5. Check it shows "OUR AGENT" label

**Expected Results:**
- 5 agents total (GlobalSocial + 4 mock agents)
- GlobalSocial agent has yellow/gold border
- Performance scores displayed
- All agents show "ACTIVE" status

**Verification Commands:**
```bash
# Check SWR is fetching data
curl -X POST http://localhost:5000/api/nanda \
  -H "Content-Type: application/json" \
  -d '{"path": "/discover?cap=travel_commerce"}'

# Should return array with GlobalSocial as first agent
```

### Test 2: Registration Script Execution
**Steps:**
1. Run registration script:
```bash
npx tsx scripts/registerAgent.ts
```

**Expected Output:**
```
🚀 Registering GlobalSocial agent with NANDA registry...
Agent data: { ... }
📝 Falling back to mock registration for development...
Agent would be registered as: { ... }
```

**What This Tests:**
- Script executes without errors
- Agent configuration is valid JSON
- Fallback mechanism works when no real registry URL

### Test 3: Environment Variable Configuration
**Steps:**
1. Add to environment:
```bash
export NANDA_BASE_URL=mock
```
2. Restart application
3. Check agent dashboard still loads
4. Verify console shows "Proxying to NANDA registry: mock/discover"

### Test 4: Network Error Handling
**Steps:**
1. Set invalid NANDA URL:
```bash
export NANDA_BASE_URL=https://invalid-registry.example.com/api/v1
```
2. Restart application  
3. Check agent dashboard
4. Verify graceful fallback to mock data

**Expected Behavior:**
- No application crashes
- Mock agents still display
- Console shows connection errors but app continues

## Phase 2: Real Registry Integration Testing

### Test 5: Live Registry Connection (When Available)
**Steps:**
1. Set real NANDA registry URL:
```bash
export NANDA_BASE_URL=https://nanda-registry.com/api/v1
```
2. Restart application
3. Run registration script again
4. Check agent dashboard

**Expected Results:**
- Real agents from registry appear
- GlobalSocial agent still highlighted in gold
- Network tab shows calls to real registry
- Response times logged in console

### Test 6: Agent Registration Verification
**Steps:**
1. After successful registration, verify with:
```bash
curl https://nanda-registry.com/api/v1/agents?owner=globalsocial.network
```

**Expected Response:**
```json
[
  {
    "id": "...",
    "name": "GlobalSocial Trust Network",
    "owner": "did:web:globalsocial.network",
    "status": "active"
  }
]
```

## Phase 3: Advanced Testing

### Test 7: Registry Performance Monitoring
**Steps:**
1. Open browser DevTools → Performance tab
2. Record page load with agent dashboard
3. Check for:
   - SWR cache hits/misses
   - Network request timing
   - Re-render frequency

**Performance Targets:**
- Initial load < 2 seconds
- Subsequent refreshes < 500ms (cache hits)
- No unnecessary re-renders

### Test 8: Error Recovery Testing
**Steps:**
1. Start with working registry
2. Disconnect network mid-session
3. Verify SWR shows stale data
4. Reconnect network
5. Verify automatic recovery

**Expected Behavior:**
- Graceful degradation during outage
- Automatic retry on reconnection
- No data loss or UI crashes

## Debugging Commands

### Check Current Configuration:
```bash
# View current environment
env | grep NANDA

# Test API endpoint directly
curl -X POST http://localhost:5000/api/nanda \
  -H "Content-Type: application/json" \
  -d '{"path": "/discover"}' | jq

# Check application logs
tail -f logs/app.log
```

### Common Issues & Solutions:

**Issue: No agents loading**
- Check console for network errors
- Verify NANDA_BASE_URL format
- Test endpoint directly with curl

**Issue: Our agent not highlighted**
- Check isOwnAgent property in response
- Verify owner field contains 'globalsocial'
- Check CSS classes applied

**Issue: Registration fails**
- Verify JSON format in registration script
- Check registry endpoint accessibility
- Review authentication requirements

## Success Criteria

**Phase 1 Complete When:**
- ✅ Mock registry returns GlobalSocial agent
- ✅ Agent dashboard highlights our agent in gold
- ✅ Registration script executes without errors
- ✅ SWR integration working with 15s refresh
- ✅ Error handling prevents crashes

**Ready for Phase 2 When:**
- ✅ All Phase 1 tests pass
- ✅ Real registry endpoint available
- ✅ Authentication method determined
- ✅ Registration payload finalized