
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

  const url = new URL(req.url);
  const path = url.pathname.replace('/functions/v1/nanda', '');

  console.log(`Nanda API called: ${req.method} ${path}`);

  try {
    // Health check endpoint
    if (req.method === 'GET' && path === '/health') {
      return new Response(
        JSON.stringify({ ok: true }),
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
    if (req.method === 'GET' && path === '/discover') {
      const capability = url.searchParams.get('cap');
      
      if (!capability) {
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

      console.log(`Discovering agents for capability: ${capability}`);

      // Proxy request to Nanda Registry
      const registryUrl = `https://nanda-registry.com/api/v1/agents?capability=${encodeURIComponent(capability)}`;
      
      const registryResponse = await fetch(registryUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const registryData = await registryResponse.text();

      return new Response(registryData, {
        status: registryResponse.status,
        headers: {
          'Content-Type': registryResponse.headers.get('Content-Type') || 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
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
      JSON.stringify({ error: error.message }),
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
