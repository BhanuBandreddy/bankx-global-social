
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`Nanda API called: ${req.method} ${req.url}`);
    
    // Parse the request body to get the path
    const body = await req.json();
    console.log('Request body:', body);
    
    const path = body.path || '';
    console.log('Extracted path:', path);

    // Health check endpoint
    if (path === '/health') {
      return new Response(
        JSON.stringify({ ok: true, timestamp: new Date().toISOString() }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Discover agents endpoint
    if (path.startsWith('/discover')) {
      const url = new URL(`https://example.com${path}`);
      const capability = url.searchParams.get('cap');
      
      console.log(`Discovering agents for capability: ${capability}`);

      if (!capability) {
        console.error('Missing capability parameter');
        return new Response(
          JSON.stringify({ error: 'Missing capability parameter' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Global Socials agents with neo-brutalist design alignment
      const mockAgents = [
        {
          id: "agent-001",
          name: "GlobeGuides™ Concierge",
          tagline: "Turns every trip into home-turf.",
          description: "Builds & syncs your itinerary, auto-books locals' picks, nudges you on visas, weather, and last-mile tips—all via NANDA agents.",
          capabilities: ["itinerary_building", "local_booking", "visa_alerts", "weather_tracking", "travel_concierge"],
          status: "active",
          version: "1.2.0",
          endpoint: "https://globeguides-concierge.nanda.ai/api/v1",
          region: "Singapore",
          performance_score: 98.5,
          last_updated: "2024-01-15T10:30:00Z",
          icon: "globe-2"
        },
        {
          id: "agent-002", 
          name: "TrustPay Orchestrator",
          tagline: "Payments that release themselves.",
          description: "Runs conversational escrow, FX, SLA timers and merchant chats; funds unlock only when both sides thumbs-up.",
          capabilities: ["conversational_escrow", "fx_handling", "sla_timers", "merchant_chat", "payment_orchestration"],
          status: "active",
          version: "2.1.3",
          endpoint: "https://trustpay-orchestrator.nanda.ai/api/v1",
          region: "Tokyo",
          performance_score: 96.2,
          last_updated: "2024-01-14T15:45:00Z",
          icon: "lock-keyhole"
        },
        {
          id: "agent-003",
          name: "LocaleLens AI",
          tagline: "Search like you grew up here.",
          description: "Curates hyper-local shops, food, and experiences en-route, blending quilt data with your past likes—zero tourist traps.",
          capabilities: ["hyper_local_curation", "experience_discovery", "preference_learning", "route_optimization", "anti_tourist_trap"],
          status: "active", 
          version: "1.8.2",
          endpoint: "https://localelens-ai.nanda.ai/api/v1",
          region: "London",
          performance_score: 94.8,
          last_updated: "2024-01-13T09:20:00Z",
          icon: "search-check"
        },
        {
          id: "agent-004",
          name: "PathSync Social Logistics",
          tagline: "Your crowd-sourced courier crew.",
          description: "Finds fellow travellers for pick-ups, tracks parcels, pushes live gate & baggage updates—keeps commerce flowing in real time.",
          capabilities: ["crowd_sourced_delivery", "parcel_tracking", "gate_updates", "baggage_tracking", "social_logistics"],
          status: "active",
          version: "3.0.1",
          endpoint: "https://pathsync-social.nanda.ai/api/v1",
          region: "New York",
          performance_score: 97.1,
          last_updated: "2024-01-12T14:10:00Z",
          icon: "navigation-2"
        }
      ];

      console.log('Returning mock agents:', mockAgents.length);
      
      return new Response(JSON.stringify(mockAgents), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Route not found
    console.error('Route not found:', path);
    return new Response(
      JSON.stringify({ error: 'Route not found', path }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in nanda function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString() 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
