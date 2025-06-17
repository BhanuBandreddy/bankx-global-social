
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Extract escrow ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const escrowId = pathParts[pathParts.length - 1];

    if (!escrowId || escrowId === 'escrow-status') {
      return new Response(JSON.stringify({ error: 'Escrow ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Getting escrow status for:', escrowId, 'user:', user.id);

    // Get escrow transaction - RLS will ensure user can only see their own
    const { data: escrow, error: escrowError } = await supabaseClient
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (escrowError) {
      console.error('Error fetching escrow:', escrowError);
      if (escrowError.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Escrow not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw escrowError;
    }

    // Get related payment events
    const { data: events, error: eventsError } = await supabaseClient
      .from('payment_events')
      .select('*')
      .eq('transaction_id', escrowId)
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('Error fetching payment events:', eventsError);
    }

    return new Response(JSON.stringify({
      success: true,
      escrow,
      events: events || [],
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in escrow-status function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
