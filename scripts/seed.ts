/**
 * Seed Global Social demo data for realistic workflow demonstration
 * Run: npx tsx scripts/seed.ts
 */

import { db } from "../server/db";
import { marketplaceUsers, marketplaceProducts, marketplaceTrips, marketplaceRequests, marketplaceMatches, marketplaceEscrows } from "../shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

interface SeedData {
  users: Array<{
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'merchant' | 'traveler' | 'shopper';
    trustScore: number;
  }>;
  products: Array<{
    id: string;
    merchantId: string;
    title: string;
    priceUsd: number;
    city: string;
    stock: number;
  }>;
  trips: Array<{
    id: string;
    travelerId: string;
    fromCity: string;
    toCity: string;
    departUtc: string;
    capacityKg: number;
  }>;
  requests: Array<{
    id: string;
    shopperId: string;
    productId: string;
    qty: number;
    status: 'open' | 'matched' | 'delivered';
  }>;
  matches: Array<{
    id: string;
    requestId: string;
    tripId: string;
    escrowId: string;
  }>;
  escrows: Array<{
    id: string;
    amount: number;
    currency: string;
    state: 'held' | 'released' | 'disputed';
  }>;
}

async function main() {
  console.log("🌱 Starting seed process...");

  try {
    // Read seed data
    const seedDataPath = join(__dirname, 'seedData.json');
    const seedDataRaw = readFileSync(seedDataPath, 'utf-8');
    const seed: SeedData = JSON.parse(seedDataRaw);

    // Clear existing data first
    console.log("🧹 Clearing existing data...");
    await db.delete(marketplaceMatches);
    await db.delete(marketplaceEscrows);
    await db.delete(marketplaceRequests);
    await db.delete(marketplaceTrips);
    await db.delete(marketplaceProducts);
    await db.delete(marketplaceUsers);

    // Insert seed data in transaction
    await db.transaction(async (tx) => {
      console.log("👥 Inserting users...");
      await tx.insert(marketplaceUsers).values(seed.users);

      console.log("🛍️ Inserting products...");
      await tx.insert(marketplaceProducts).values(seed.products);

      console.log("✈️ Inserting trips...");
      await tx.insert(marketplaceTrips).values(seed.trips.map(trip => ({
        ...trip,
        departUtc: new Date(trip.departUtc)
      })));

      console.log("📋 Inserting requests...");
      await tx.insert(marketplaceRequests).values(seed.requests);

      console.log("💰 Inserting escrows...");
      await tx.insert(marketplaceEscrows).values(seed.escrows);

      console.log("🔗 Inserting matches...");
      await tx.insert(marketplaceMatches).values(seed.matches);
    });

    console.log("✅ Demo data seeded successfully!");
    console.log(`
📊 Summary:
- ${seed.users.length} users (merchants, travelers, shoppers)
- ${seed.products.length} products across multiple cities
- ${seed.trips.length} traveler routes
- ${seed.requests.length} shopping requests
- ${seed.matches.length} matched trips
- ${seed.escrows.length} active escrows

🎯 Test scenarios ready:
- Ask for "sneakers" → Should find Nike Air Max 270 in NYC
- Ask for "headphones" → Should find Sony WH-1000XM5 in Tokyo
- Ask about trips from "Paris to Lagos" → Should find Li Chen's trip
`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});