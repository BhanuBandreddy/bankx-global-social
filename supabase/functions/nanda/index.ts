
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

      // For now, return mock data since the actual Nanda registry may not be available
      // This will help us test the integration
      const mockAgents = [
        {
          id: "agent-001",
          name: "Travel Optimizer",
          description: "AI agent specialized in finding optimal travel routes and deals",
          capabilities: ["flight_booking", "hotel_search", "route_optimization"],
          status: "active",
          version: "1.2.0",
          endpoint: "https://travel-agent.nanda.ai/api/v1"
        },
        {
          id: "agent-002", 
          name: "Commerce Assistant",
          description: "Smart shopping and payment processing agent",
          capabilities: ["payment_processing", "price_comparison", "inventory_check"],
          status: "active",
          version: "2.1.3",
          endpoint: "https://commerce-agent.nanda.ai/api/v1"
        },
        {
          id: "agent-003",
          name: "Logistics Coordinator",
          description: "Supply chain and delivery optimization specialist",
          capabilities: ["shipping_optimization", "inventory_management", "delivery_tracking"],
          status: "active", 
          version: "1.8.2",
          endpoint: "https://logistics-agent.nanda.ai/api/v1"
        },
        {
          id: "agent-004",
          name: "Discovery Engine",
          description: "Content and experience recommendation system",
          capabilities: ["content_discovery", "personalization", "recommendation"],
          status: "active",
          version: "3.0.1",
          endpoint: "https://discovery-agent.nanda.ai/api/v1"
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
