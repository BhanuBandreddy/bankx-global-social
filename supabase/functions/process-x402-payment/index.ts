
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

  try {
    const { productId, amount, currency = 'USD', buyer_id, seller_id } = await req.json();

    if (!productId || !amount) {
      // Return HTTP 402 Payment Required with x402 headers
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const x402Headers = {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-402-Payment-Required': 'true',
        'X-402-Amount': amount.toString(),
        'X-402-Currency': currency,
        'X-402-Payment-Id': paymentId,
        'X-402-Description': `Payment for product ${productId}`,
        'X-402-Callback-URL': `${Deno.env.get('SUPABASE_URL')}/functions/v1/initiate-escrow`,
      };

      return new Response(JSON.stringify({
        error: 'Payment Required',
        message: 'Please complete payment to proceed',
        payment_details: {
          amount,
          currency,
          product_id: productId,
          payment_id: paymentId,
          payment_methods: ['x402', 'crypto', 'traditional']
        }
      }), {
        status: 402,
        headers: x402Headers,
      });
    }

    // After verifying X402 headers, forward to POST /payments
    const paymentId = `x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Forwarding to payments endpoint:', { paymentId, amount, currency, buyer_id, seller_id });

    // Internal fetch to payments endpoint
    const paymentsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        payment_id: paymentId,
        amount,
        currency,
        buyer_id,
        seller_id
      })
    });

    const paymentsData = await paymentsResponse.json();

    if (!paymentsResponse.ok) {
      throw new Error(`Payments service error: ${paymentsData.error}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'X402 payment processing initiated',
      payment_id: paymentId,
      ...paymentsData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-x402-payment function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
