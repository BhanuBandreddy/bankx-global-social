# Multi-Agent Demo Use Cases

Since we don't have live user data, here are specific demo scenarios that showcase the multi-agent orchestration system. These use cases demonstrate how TrustPay, LocaleLens, PathSync, and GlobeGuides coordinate seamlessly.

## 🏟️ **Working Demo Scenarios**

### **1. Marketplace Coordination**
**Try saying**: "I want Nike sneakers delivered to Bengaluru"
**Expected Response**: "🤖 TrustPay & PathSync coordinated: Raj can bring your Nike Air Max 270 for $150, arriving Bengaluru 7/7/2025 • escrow held 💰 • Accept?"
- **Agents Used**: LocaleLens (product discovery) + TrustPay (escrow) + PathSync (logistics)
- **Real Data**: Uses seeded marketplace data with Raj's actual NYC→Bengaluru flight

### **2. High-Value Transaction**
**Try saying**: "I need a camera from Paris"
**Expected Response**: "🤖 High-value coordination: Li Chen can carry Leica M6 Camera for $3,800, arriving Lagos 7/9/2025 • TrustPay premium escrow 💰 • Accept?"
- **Agents Used**: TrustPay (premium escrow) + PathSync (high-value logistics)
- **Real Data**: Uses Li Chen's actual Paris→Lagos route from seed data

### **3. Transaction Acceptance**
**Try saying**: "Accept the offer" or "Yes, accept the deal"
**Expected Response**: Multi-agent confirmation with escrow creation and logistics coordination
- **Agents Used**: TrustPay (escrow processing) + PathSync (delivery coordination) + GlobeGuides (tracking)

### **4. Local Discovery**
**Try saying**: "Find products in Tokyo"
**Expected Response**: LocaleLens-powered local market discovery with cultural insights
- **Agents Used**: LocaleLens (local discovery) + TrustPay (payment options)

### **5. Travel Planning**
**Try saying**: "Plan trip to Seoul"
**Expected Response**: GlobeGuides coordination with travel insights and logistics
- **Agents Used**: GlobeGuides (travel planning) + PathSync (route optimization)

## 🔧 **Technical Framework**

### **Multi-Agent Architecture**
- **Conductor**: GPT-4o analyzes user intent and coordinates agent workflows
- **TrustPay**: Payment escrow, fraud detection, transaction security
- **LocaleLens**: Local discovery, cultural insights, venue recommendations
- **PathSync**: Logistics coordination, route optimization, delivery tracking
- **GlobeGuides**: Travel planning, itinerary management, visa information

### **Real Data Sources**
- **Marketplace Database**: 10 users, 6 products, 4 traveler routes, active escrows
- **Seeded Scenarios**: Maya/Raj Nike workflow, Li Chen camera deal
- **AgentTorch**: Crowd intelligence simulation across 8 global cities

### **Agent Coordination Patterns**
1. **Product Request** → LocaleLens + TrustPay + PathSync
2. **Transaction Acceptance** → TrustPay + PathSync + GlobeGuides
3. **Local Discovery** → LocaleLens + TrustPay
4. **Travel Planning** → GlobeGuides + PathSync
5. **High-Value Items** → TrustPay (premium) + PathSync (secure)

## 🎯 **Demo Success Indicators**

### **✅ Working Responses**
- Multi-agent coordination messages like "🤖 TrustPay & PathSync coordinated"
- Real marketplace data integration (Raj, Li Chen, Maya)
- Specific price points and arrival dates from seed data
- Agent arrays showing 2-3 coordinated agents: `["TrustPay","PathSync","LocaleLens"]`

### **❌ Fallback Responses**
- Generic "I understand your request" without agent coordination
- Empty agent arrays: `[]`
- No specific marketplace data or pricing

## 🚀 **Extended Use Cases**

### **Complex Scenarios**
**Try saying**: "I want expensive electronics delivered safely"
**Expected**: Premium TrustPay escrow + PathSync secure logistics + LocaleLens verification

**Try saying**: "Find local food in Bengaluru and arrange delivery"
**Expected**: LocaleLens cultural discovery + TrustPay payments + PathSync local delivery

**Try saying**: "Plan shopping trip to Tokyo with peer delivery"
**Expected**: GlobeGuides travel planning + LocaleLens local insights + PathSync peer coordination

### **Conversation Flow**
1. **Initial Request**: User states intent (product, location, travel)
2. **Agent Analysis**: Conductor coordinates 2-4 relevant agents
3. **Marketplace Match**: Real data integration from seeded database
4. **Coordinated Response**: Multi-agent solution with specific details
5. **Transaction Flow**: Accept/decline with escrow and logistics handling

## 📝 **Testing Commands**

```bash
# Test specific scenarios
curl -X POST http://localhost:5000/api/blink/conversation \
  -H "Content-Type: application/json" \
  -d '{"message": "I want Nike sneakers to Bengaluru"}'

curl -X POST http://localhost:5000/api/blink/conversation \
  -H "Content-Type: application/json" \
  -d '{"message": "Accept the sneaker offer"}'
```

## 🎭 **User Personas for Testing**

### **Maya (Shopper)**
- Wants products delivered internationally
- Values trust and security
- Uses phrases like "I want [product] delivered to [city]"

### **Raj (Traveler)**
- Flying routes between major cities
- Offers peer delivery services
- Appears in agent responses as actual delivery option

### **Li Chen (Premium Traveler)**
- Handles high-value items
- International routes (Paris→Lagos)
- Premium escrow and security features

This framework provides a comprehensive testing environment for the multi-agent orchestration system without requiring live user data.