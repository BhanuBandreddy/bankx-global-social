/**
 * Marketplace lookup functions for realistic AI coordination
 * Used by Conductor to find real product/trip matches
 */

import { db } from "./db";
import { marketplaceProducts, marketplaceTrips, marketplaceUsers, marketplaceEscrows, marketplaceMatches, marketplaceRequests } from "../shared/schema";
import { eq, like, and, sql } from "drizzle-orm";

export interface ProductMatch {
  product: {
    id: string;
    title: string;
    priceUsd: number;
    city: string;
    stock: number;
    merchant: string;
  };
  trip?: {
    id: string;
    travelerId: string;
    travelerName: string;
    fromCity: string;
    toCity: string;
    departUtc: Date;
    capacityKg: number;
  };
}

/**
 * Find product offers with available trips
 */
export async function findProductOffer(query: string, homeCity?: string): Promise<ProductMatch | null> {
  try {
    // Search for products matching the query
    const productResults = await db
      .select({
        id: marketplaceProducts.id,
        title: marketplaceProducts.title,
        priceUsd: marketplaceProducts.priceUsd,
        city: marketplaceProducts.city,
        stock: marketplaceProducts.stock,
        merchantName: marketplaceUsers.name,
      })
      .from(marketplaceProducts)
      .innerJoin(marketplaceUsers, eq(marketplaceProducts.merchantId, marketplaceUsers.id))
      .where(
        and(
          sql`${marketplaceProducts.title} ILIKE ${`%${query}%`}`,
          sql`${marketplaceProducts.stock} > 0`
        )
      )
      .limit(1);

    if (productResults.length === 0) {
      return null;
    }

    const product = productResults[0];
    const productMatch: ProductMatch = {
      product: {
        id: product.id,
        title: product.title,
        priceUsd: product.priceUsd,
        city: product.city,
        stock: product.stock,
        merchant: product.merchantName,
      }
    };

    // If homeCity specified, find matching trips
    if (homeCity) {
      const tripResults = await db
        .select({
          id: marketplaceTrips.id,
          travelerId: marketplaceTrips.travelerId,
          travelerName: marketplaceUsers.name,
          fromCity: marketplaceTrips.fromCity,
          toCity: marketplaceTrips.toCity,
          departUtc: marketplaceTrips.departUtc,
          capacityKg: marketplaceTrips.capacityKg,
        })
        .from(marketplaceTrips)
        .innerJoin(marketplaceUsers, eq(marketplaceTrips.travelerId, marketplaceUsers.id))
        .where(
          and(
            eq(marketplaceTrips.fromCity, product.city),
            eq(marketplaceTrips.toCity, homeCity),
            sql`${marketplaceTrips.departUtc} > NOW()` // Future trips only
          )
        )
        .limit(1);

      if (tripResults.length > 0) {
        const trip = tripResults[0];
        productMatch.trip = {
          id: trip.id,
          travelerId: trip.travelerId,
          travelerName: trip.travelerName,
          fromCity: trip.fromCity,
          toCity: trip.toCity,
          departUtc: trip.departUtc,
          capacityKg: trip.capacityKg,
        };
      }
    }

    return productMatch;
  } catch (error) {
    console.error('Error finding product offer:', error);
    return null;
  }
}

/**
 * Find available trips between cities
 */
export async function findTrips(fromCity?: string, toCity?: string): Promise<any[]> {
  try {
    let query = db
      .select({
        id: trips.id,
        travelerName: users.name,
        fromCity: trips.fromCity,
        toCity: trips.toCity,
        departUtc: trips.departUtc,
        capacityKg: trips.capacityKg,
      })
      .from(trips)
      .innerJoin(users, eq(trips.travelerId, users.id))
      .where(sql`${trips.departUtc} > NOW()`);

    if (fromCity) {
      query = query.where(eq(trips.fromCity, fromCity));
    }
    if (toCity) {
      query = query.where(eq(trips.toCity, toCity));
    }

    return await query.limit(5);
  } catch (error) {
    console.error('Error finding trips:', error);
    return [];
  }
}

/**
 * Get marketplace statistics for dashboard
 */
export async function getMarketplaceStats() {
  try {
    const [productCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(sql`${products.stock} > 0`);

    const [tripCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trips)
      .where(sql`${trips.departUtc} > NOW()`);

    const [activeEscrows] = await db
      .select({ count: sql<number>`count(*)` })
      .from(escrows)
      .where(eq(escrows.state, 'held'));

    return {
      availableProducts: productCount.count,
      upcomingTrips: tripCount.count,
      activeEscrows: activeEscrows.count,
    };
  } catch (error) {
    console.error('Error getting marketplace stats:', error);
    return {
      availableProducts: 0,
      upcomingTrips: 0,
      activeEscrows: 0,
    };
  }
}

/**
 * Create a new escrow for product purchase
 */
export async function createEscrow(productId: string, amount: number, currency: string = 'USD'): Promise<string> {
  try {
    const escrowId = `esc_${Date.now()}`;
    
    await db.insert(marketplaceEscrows).values({
      id: escrowId,
      amount,
      currency,
      state: 'held',
    });

    return escrowId;
  } catch (error) {
    console.error('Error creating escrow:', error);
    throw new Error('Failed to create escrow');
  }
}

/**
 * Create a match between request and trip with escrow
 */
export async function createMatch(requestId: string, tripId: string, amount: number): Promise<{ matchId: string; escrowId: string } | null> {
  try {
    const escrowId = `esc_${Date.now()}`;
    const matchId = `match_${Date.now()}`;

    await db.transaction(async (tx) => {
      // Create escrow
      await tx.insert(marketplaceEscrows).values({
        id: escrowId,
        amount,
        currency: 'USD',
        state: 'held',
      });

      // Create match
      await tx.insert(marketplaceMatches).values({
        id: matchId,
        requestId,
        tripId,
        escrowId,
      });

      // Update request status
      await tx.update(marketplaceRequests)
        .set({ status: 'matched' })
        .where(eq(marketplaceRequests.id, requestId));
    });

    return { matchId, escrowId };
  } catch (error) {
    console.error('Error creating match:', error);
    return null;
  }
}

/**
 * Get user's open requests
 */
export async function getUserRequests(userId: string): Promise<any[]> {
  try {
    const requests = await db
      .select({
        id: marketplaceRequests.id,
        productTitle: marketplaceProducts.title,
        productPrice: marketplaceProducts.priceUsd,
        productCity: marketplaceProducts.city,
        merchantName: marketplaceUsers.name,
        qty: marketplaceRequests.qty,
        status: marketplaceRequests.status,
      })
      .from(marketplaceRequests)
      .innerJoin(marketplaceProducts, eq(marketplaceRequests.productId, marketplaceProducts.id))
      .innerJoin(marketplaceUsers, eq(marketplaceProducts.merchantId, marketplaceUsers.id))
      .where(eq(marketplaceRequests.shopperId, userId))
      .orderBy(marketplaceRequests.createdAt);

    return requests;
  } catch (error) {
    console.error('Error getting user requests:', error);
    return [];
  }
}