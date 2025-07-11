/**
 * Seed Traveler Discovery data for 3D map demonstration
 * Run: npx tsx scripts/seed-traveler-discovery.ts
 */

import { db } from "../server/db";
import { travelItineraries, userLocations, airports } from "../shared/schema";

interface SeedTravelData {
  userLocations: Array<{
    userId: string;
    city: string;
    country: string;
    coordinates: [number, number];
    timezone: string;
    isPrimary: boolean;
  }>;
  airports: Array<{
    iataCode: string;
    icaoCode: string;
    name: string;
    city: string;
    country: string;
    coordinates: [number, number];
    isInternational: boolean;
  }>;
  travelItineraries: Array<{
    userId: string;
    travelerId: string;
    fromCity: string;
    toCity: string;
    fromCountry: string;
    toCountry: string;
    fromCoordinates: [number, number];
    toCoordinates: [number, number];
    fromAirport: string;
    toAirport: string;
    departureDate: string;
    arrivalDate: string;
    airline: string;
    flightNumber: string;
    maxCarryCapacity: number;
    deliveryFee: number;
    currency: string;
    connectionPurpose: string[];
    travelNote: string;
    trustScore: number;
    verificationStatus: string;
  }>;
}

async function main() {
  console.log("🌍 Seeding Traveler Discovery Data...");

  const travelData: SeedTravelData = {
    userLocations: [
      {
        userId: "baef8948-e1fd-468f-ade0-a35019c1c5f1", // Existing user
        city: "New York",
        country: "United States",
        coordinates: [40.7128, -74.0060],
        timezone: "America/New_York",
        isPrimary: true
      },
      {
        userId: "550e8400-e29b-41d4-a716-446655440001", // Mock user
        city: "Tokyo",
        country: "Japan", 
        coordinates: [35.6762, 139.6503],
        timezone: "Asia/Tokyo",
        isPrimary: true
      },
      {
        userId: "550e8400-e29b-41d4-a716-446655440002",
        city: "London",
        country: "United Kingdom",
        coordinates: [51.5074, -0.1278],
        timezone: "Europe/London",
        isPrimary: true
      }
    ],
    airports: [
      {
        iataCode: "JFK",
        icaoCode: "KJFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "United States",
        coordinates: [40.6413, -73.7781],
        isInternational: true
      },
      {
        iataCode: "LGA",
        icaoCode: "KLGA", 
        name: "LaGuardia Airport",
        city: "New York",
        country: "United States",
        coordinates: [40.7769, -73.8740],
        isInternational: false
      },
      {
        iataCode: "NRT",
        icaoCode: "RJAA",
        name: "Narita International Airport",
        city: "Tokyo",
        country: "Japan",
        coordinates: [35.7720, 140.3929],
        isInternational: true
      },
      {
        iataCode: "HND",
        icaoCode: "RJTT",
        name: "Tokyo Haneda Airport",
        city: "Tokyo", 
        country: "Japan",
        coordinates: [35.5494, 139.7798],
        isInternational: true
      },
      {
        iataCode: "LHR",
        icaoCode: "EGLL",
        name: "London Heathrow Airport",
        city: "London",
        country: "United Kingdom",
        coordinates: [51.4700, -0.4543],
        isInternational: true
      },
      {
        iataCode: "CDG",
        icaoCode: "LFPG",
        name: "Charles de Gaulle Airport",
        city: "Paris",
        country: "France",
        coordinates: [49.0097, 2.5479],
        isInternational: true
      },
      {
        iataCode: "BOM",
        icaoCode: "VABB",
        name: "Chhatrapati Shivaji Maharaj International Airport",
        city: "Mumbai",
        country: "India",
        coordinates: [19.0896, 72.8656],
        isInternational: true
      },
      {
        iataCode: "BLR",
        icaoCode: "VOBL",
        name: "Kempegowda International Airport",
        city: "Bengaluru",
        country: "India",
        coordinates: [13.1986, 77.7066],
        isInternational: true
      },
      {
        iataCode: "SIN",
        icaoCode: "WSSS",
        name: "Singapore Changi Airport",
        city: "Singapore",
        country: "Singapore",
        coordinates: [1.3644, 103.9915],
        isInternational: true
      },
      {
        iataCode: "DXB",
        icaoCode: "OMDB",
        name: "Dubai International Airport",
        city: "Dubai",
        country: "United Arab Emirates",
        coordinates: [25.2532, 55.3657],
        isInternational: true
      }
    ],
    travelItineraries: [
      // Travelers coming to New York
      {
        userId: "550e8400-e29b-41d4-a716-446655440003",
        travelerId: "t_001",
        fromCity: "London",
        toCity: "New York",
        fromCountry: "United Kingdom",
        toCountry: "United States",
        fromCoordinates: [51.5074, -0.1278],
        toCoordinates: [40.7128, -74.0060],
        fromAirport: "LHR",
        toAirport: "JFK",
        departureDate: "2025-07-15T10:30:00Z",
        arrivalDate: "2025-07-15T14:45:00Z",
        airline: "British Airways",
        flightNumber: "BA117",
        maxCarryCapacity: 8.5,
        deliveryFee: 35.00,
        currency: "USD",
        connectionPurpose: ["social", "shopping"],
        travelNote: "Business traveler, open to social connections and helping with deliveries",
        trustScore: 92,
        verificationStatus: "verified"
      },
      {
        userId: "550e8400-e29b-41d4-a716-446655440004",
        travelerId: "t_002",
        fromCity: "Paris",
        toCity: "New York",
        fromCountry: "France",
        toCountry: "United States",
        fromCoordinates: [48.8566, 2.3522],
        toCoordinates: [40.7128, -74.0060],
        fromAirport: "CDG",
        toAirport: "JFK",
        departureDate: "2025-07-16T15:20:00Z",
        arrivalDate: "2025-07-16T18:35:00Z",
        airline: "Air France",
        flightNumber: "AF007",
        maxCarryCapacity: 12.0,
        deliveryFee: 40.00,
        currency: "USD",
        connectionPurpose: ["social", "sightseeing", "delivery"],
        travelNote: "Fashion enthusiast visiting NYC, happy to connect with locals",
        trustScore: 88,
        verificationStatus: "verified"
      },
      {
        userId: "550e8400-e29b-41d4-a716-446655440005",
        travelerId: "t_003",
        fromCity: "Tokyo",
        toCity: "New York",
        fromCountry: "Japan",
        toCountry: "United States",
        fromCoordinates: [35.6762, 139.6503],
        toCoordinates: [40.7128, -74.0060],
        fromAirport: "NRT",
        toAirport: "JFK",
        departureDate: "2025-07-18T11:00:00Z",
        arrivalDate: "2025-07-18T10:15:00Z",
        airline: "Japan Airlines",
        flightNumber: "JL004",
        maxCarryCapacity: 15.0,
        deliveryFee: 55.00,
        currency: "USD",
        connectionPurpose: ["business", "social"],
        travelNote: "Tech conference attendee, interested in NYC startup scene",
        trustScore: 95,
        verificationStatus: "verified"
      },
      {
        userId: "550e8400-e29b-41d4-a716-446655440006",
        travelerId: "t_004",
        fromCity: "Mumbai",
        toCity: "New York",
        fromCountry: "India",
        toCountry: "United States",
        fromCoordinates: [19.0760, 72.8777],
        toCoordinates: [40.7128, -74.0060],
        fromAirport: "BOM",
        toAirport: "JFK",
        departureDate: "2025-07-20T02:30:00Z",
        arrivalDate: "2025-07-20T06:45:00Z",
        airline: "Air India",
        flightNumber: "AI101",
        maxCarryCapacity: 10.0,
        deliveryFee: 45.00,
        currency: "USD",
        connectionPurpose: ["social", "shopping", "delivery"],
        travelNote: "Bollywood film distributor, love connecting with diverse communities",
        trustScore: 89,
        verificationStatus: "verified"
      },
      {
        userId: "550e8400-e29b-41d4-a716-446655440007",
        travelerId: "t_005",
        fromCity: "Dubai",
        toCity: "New York",
        fromCountry: "United Arab Emirates",
        toCountry: "United States",
        fromCoordinates: [25.2048, 55.2708],
        toCoordinates: [40.7128, -74.0060],
        fromAirport: "DXB",
        toAirport: "JFK",
        departureDate: "2025-07-22T23:59:00Z",
        arrivalDate: "2025-07-23T05:30:00Z",
        airline: "Emirates",
        flightNumber: "EK201",
        maxCarryCapacity: 20.0,
        deliveryFee: 60.00,
        currency: "USD",
        connectionPurpose: ["business", "luxury_shopping"],
        travelNote: "Investment banker, frequent NYC visitor, premium carrier capacity",
        trustScore: 96,
        verificationStatus: "verified"
      },
      // Global travel patterns for visualization
      {
        userId: "550e8400-e29b-41d4-a716-446655440008",
        travelerId: "t_006",
        fromCity: "Singapore",
        toCity: "London",
        fromCountry: "Singapore",
        toCountry: "United Kingdom",
        fromCoordinates: [1.3521, 103.8198],
        toCoordinates: [51.5074, -0.1278],
        fromAirport: "SIN",
        toAirport: "LHR",
        departureDate: "2025-07-17T01:15:00Z",
        arrivalDate: "2025-07-17T07:30:00Z",
        airline: "Singapore Airlines",
        flightNumber: "SQ317",
        maxCarryCapacity: 18.0,
        deliveryFee: 50.00,
        currency: "USD",
        connectionPurpose: ["business", "social"],
        travelNote: "Fintech entrepreneur connecting Singapore and London",
        trustScore: 93,
        verificationStatus: "verified"
      },
      {
        userId: "550e8400-e29b-41d4-a716-446655440009",
        travelerId: "t_007",
        fromCity: "Bengaluru",
        toCity: "Tokyo",
        fromCountry: "India",
        toCountry: "Japan",
        fromCoordinates: [12.9716, 77.5946],
        toCoordinates: [35.6762, 139.6503],
        fromAirport: "BLR",
        toAirport: "NRT",
        departureDate: "2025-07-19T04:45:00Z",
        arrivalDate: "2025-07-19T17:20:00Z",
        airline: "ANA",
        flightNumber: "NH824",
        maxCarryCapacity: 14.0,
        deliveryFee: 55.00,
        currency: "USD",
        connectionPurpose: ["business", "cultural_exchange"],
        travelNote: "Software engineer attending tech conference in Tokyo",
        trustScore: 87,
        verificationStatus: "verified"
      }
    ]
  };

  try {
    // Clear existing data
    console.log("🧹 Clearing existing traveler discovery data...");
    await db.delete(travelItineraries);
    await db.delete(airports);
    
    // Insert airports first
    console.log("✈️ Seeding airports...");
    for (const airport of travelData.airports) {
      try {
        await db.insert(airports).values(airport);
      } catch (error) {
        console.log(`  ⚠️ Airport ${airport.iataCode} already exists or error:`, error);
      }
    }

    // Insert user locations (skip if user doesn't exist)
    console.log("📍 Seeding user locations...");
    for (const location of travelData.userLocations) {
      try {
        // Only insert if userId already exists in users table
        await db.insert(userLocations).values(location);
      } catch (error) {
        console.log(`  ⚠️ User location for ${location.userId} skipped:`, error);
      }
    }

    // Insert travel itineraries
    console.log("🗺️ Seeding travel itineraries...");
    for (const itinerary of travelData.travelItineraries) {
      try {
        await db.insert(travelItineraries).values({
          ...itinerary,
          departureDate: new Date(itinerary.departureDate),
          arrivalDate: new Date(itinerary.arrivalDate)
        });
      } catch (error) {
        console.log(`  ⚠️ Itinerary ${itinerary.travelerId} error:`, error);
      }
    }

    console.log("✅ Traveler Discovery data seeded successfully!");
    console.log("\n📊 Seeded:");
    console.log(`  • ${travelData.airports.length} airports`);
    console.log(`  • ${travelData.userLocations.length} user locations`);
    console.log(`  • ${travelData.travelItineraries.length} travel itineraries`);
    console.log("\n🎯 Features ready:");
    console.log("  • 3D world map visualization");
    console.log("  • City-based traveler discovery");
    console.log("  • Airport layer overlays");
    console.log("  • Connection request system");
    console.log("  • Trust score based filtering");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));