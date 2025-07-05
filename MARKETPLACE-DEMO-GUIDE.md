# Marketplace Demo Guide

## Complete Workflow Demonstration

The seed data creates a deterministic marketplace experience that mirrors real-world social commerce:

### 🧪 Test Scenarios

#### 1. **Sneaker Request → Traveler Match → Escrow**
```
User: "I want Nike Air Max sneakers"
System: "Raj can bring your Nike Air Max 270 for $150, arriving Bengaluru 7/7/2025 • escrow held 💰 • Accept?"
User: "Accept"
System: "Perfect! Escrow created and funds secured. I'll notify the traveler and merchant."
```
**Behind the scenes:**
- Maya Shopper (u_s1) has open request (req_1) for Nike Air Max 270
- Raj Traveler (u_t1) flying NYC → Bengaluru on 7/7/2025 with 8kg capacity
- System matches req_1 with trp_1, creates escrow, updates request status

#### 2. **Headphones to Tokyo**
```
User: "Looking for headphones in Tokyo"
System: "Emma can deliver Sony WH-1000XM5 for $349, arriving Tokyo 7/10/2025 • escrow ready 💰 • Accept?"
```

#### 3. **High-Value Camera from Paris**
```
User: "Do you have cameras from Paris?"
System: "Li Chen can carry Leica M6 Camera for $3,800, arriving Lagos 7/9/2025 • high-value escrow 💰 • Accept?"
```

### 📊 Seed Data Structure

**Users (10 total):**
- 3 Merchants: SneakerHub NYC, TokyoTech Gadgets, ParisVintage Atelier
- 3 Travelers: Raj, Emma, Li Chen (with specific routes and capacities)  
- 4 Shoppers: Maya, Andre, Sara, Alex (with trust scores and preferences)

**Products (6 total):**
- Nike Air Max 270 ($150, NYC) - SneakerHub NYC
- Sony WH-1000XM5 ($349, Tokyo) - TokyoTech Gadgets
- Leica M6 Film Camera ($3,800, Paris) - ParisVintage Atelier
- Brigadeiros 12-pack ($24, São Paulo)
- Adidas Ultraboost 22 ($180, NYC)
- Vintage Hermès Scarf ($280, Paris)

**Traveler Routes (4 active):**
- Raj: NYC → Bengaluru (7/7/2025, 8kg capacity)
- Emma: São Paulo → Tokyo (7/10/2025, 6kg capacity) 
- Li Chen: Paris → Lagos (7/9/2025, 5kg capacity)
- Raj: Tokyo → NYC (7/12/2025, 10kg capacity)

**Active Workflows:**
- 2 pre-matched requests (Leica camera, Brigadeiros)
- 2 open requests waiting for travelers
- 3 active escrows ($3,800, $48, $150)

### 🎯 Demo Value

This creates a **deterministic, realistic experience** where:

✅ **Every test drive is predictable** - Same inputs always produce same marketplace results
✅ **Authentic social commerce** - Real merchant names, cities, prices, traveler details  
✅ **Complete workflow demonstration** - Product discovery → Traveler matching → Escrow creation → Status updates
✅ **No external API dependencies** - Fully self-contained marketplace simulation
✅ **Credible user experience** - Users see genuine marketplace activity, not obvious mock data

### 🔄 Maintenance

**After database resets:**
```bash
npm run db:push
npx tsx scripts/seed.ts
```

**To test workflow:**
```bash
npx tsx scripts/test-marketplace-workflow.ts
```

**To expand:**
- Add more cities, products, or travelers to `scripts/seedData.json`
- Include reviews, trust events, delivery confirmations
- Simulate seasonal demand patterns or time-based availability

This mini-universe ensures every Blink conversation delivers authentic marketplace intelligence without requiring complex live integrations.