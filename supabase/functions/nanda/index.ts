
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

      // Mock agents with original names and Nanda metadata structure
      const mockAgents = [
        {
          id: "agent-001",
          name: "Travel Agent",
          description: "Specialized in travel and commerce optimization",
          capabilities: ["flight_booking", "hotel_search", "route_optimization", "travel_commerce"],
          status: "active",
          version: "1.2.0",
          endpoint: "https://travel-agent.nanda.ai/api/v1",
          region: "Singapore",
          performance_score: 98.5,
          last_updated: "2024-01-15T10:30:00Z"
        },
        {
          id: "agent-002", 
          name: "Commerce Bot",
          description: "Smart shopping and payment processing specialist",
          capabilities: ["payment_processing", "price_comparison", "inventory_check", "commerce_optimization"],
          status: "active",
          version: "2.1.3",
          endpoint: "https://commerce-agent.nanda.ai/api/v1",
          region: "Tokyo",
          performance_score: 96.2,
          last_updated: "2024-01-14T15:45:00Z"
        },
        {
          id: "agent-003",
          name: "Discovery AI",
          description: "Content and experience recommendation engine",
          capabilities: ["content_discovery", "personalization", "recommendation", "experience_optimization"],
          status: "active", 
          version: "1.8.2",
          endpoint: "https://discovery-agent.nanda.ai/api/v1",
          region: "London",
          performance_score: 94.8,
          last_updated: "2024-01-13T09:20:00Z"
        },
        {
          id: "agent-004",
          name: "Logistics AI",
          description: "Supply chain and delivery coordination system",
          capabilities: ["shipping_optimization", "inventory_management", "delivery_tracking", "logistics_coordination"],
          status: "active",
          version: "3.0.1",
          endpoint: "https://logistics-agent.nanda.ai/api/v1",
          region: "New York",
          performance_score: 97.1,
          last_updated: "2024-01-12T14:10:00Z"
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
