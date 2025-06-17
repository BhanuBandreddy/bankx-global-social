
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { payment_id, amount, currency, buyer_id, seller_id } = await req.json();

    if (!payment_id || !amount || !buyer_id) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: payment_id, amount, buyer_id'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing payment:', { payment_id, amount, currency, buyer_id, seller_id });

    // Upsert payment event for idempotency
    const { data: paymentEvent, error: paymentError } = await supabaseClient
      .from('payment_events')
      .upsert({
        payment_id,
        event_type: 'payment_initiated',
        event_data: {
          amount: parseFloat(amount),
          currency: currency || 'USD',
          buyer_id,
          seller_id,
          timestamp: new Date().toISOString()
        }
      }, {
        onConflict: 'payment_id',
        ignoreDuplicates: true
      })
      .select()
      .single();

    if (paymentError && paymentError.code !== '23505') { // Ignore duplicate key errors
      console.error('Error creating payment event:', paymentError);
      throw paymentError;
    }

    // Return 202 Accepted with same JSON for idempotent retries
    const responseBody = {
      payment_id,
      amount,
      currency: currency || 'USD',
      buyer_id,
      seller_id,
      status: 'accepted',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(responseBody), {
      status: 202,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in payments function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
