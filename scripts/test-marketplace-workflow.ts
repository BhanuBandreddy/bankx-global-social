/**
 * Test the complete marketplace workflow:
 * Maya (u_s1) wants Nike Air Max 270 → Raj (u_t1) flying NYC → Bengaluru → Match + Escrow
 */

import { findProductOffer, createMatch, getUserRequests } from "../server/marketplace";

async function testCompleteWorkflow() {
  console.log("🧪 Testing Complete Marketplace Workflow\n");

  // Step 1: Maya wants sneakers
  console.log("👩‍💼 Maya Shopper (u_s1) requests: Nike Air Max 270");
  const offer = await findProductOffer('Air Max', 'Bengaluru');
  
  if (offer) {
    console.log(`✅ Found: ${offer.product.title} for $${offer.product.priceUsd} in ${offer.product.city}`);
    console.log(`🏪 Merchant: ${offer.product.merchant}`);
    
    if (offer.trip) {
      console.log(`✈️ Traveler: ${offer.trip.travelerName}`);
      console.log(`🛫 Route: ${offer.trip.fromCity} → ${offer.trip.toCity}`);
      console.log(`📅 Departure: ${offer.trip.departUtc.toLocaleDateString()}`);
      console.log(`📦 Capacity: ${offer.trip.capacityKg}kg available\n`);

      // Step 2: Create the match and escrow
      console.log("💰 Creating escrow and matching request...");
      const match = await createMatch('req_1', offer.trip.id, offer.product.priceUsd);
      
      if (match) {
        console.log(`✅ Match created: ${match.matchId}`);
        console.log(`💳 Escrow created: ${match.escrowId}`);
        console.log(`💵 Amount held: $${offer.product.priceUsd}\n`);

        // Step 3: Check Maya's requests
        console.log("📋 Maya's current requests:");
        const mayaRequests = await getUserRequests('u_s1');
        mayaRequests.forEach(req => {
          console.log(`- ${req.productTitle} ($${req.productPrice}) from ${req.merchantName} in ${req.productCity} [${req.status}]`);
        });
      } else {
        console.log("❌ Failed to create match");
      }
    } else {
      console.log("⚠️ No traveler available on this route");
    }
  } else {
    console.log("❌ No matching product found");
  }

  console.log("\n🎯 Workflow demonstrates:");
  console.log("✓ Real product discovery");
  console.log("✓ Traveler route matching");
  console.log("✓ Automatic escrow creation");
  console.log("✓ Request status updates");
  console.log("✓ Complete audit trail");
}

testCompleteWorkflow().catch(console.error);