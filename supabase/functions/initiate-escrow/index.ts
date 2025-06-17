
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const { productId, amount, currency = 'USD', x402PaymentId, buyer_id, seller_id } = await req.json();
    const idempotencyKey = req.headers.get('Idempotency-Key');

    if (!productId || !amount) {
      throw new Error('Missing required fields: productId, amount');
    }

    console.log('Initiating escrow with transaction lock:', {
      user: user.id,
      productId,
      amount,
      x402PaymentId,
      idempotencyKey
    });

    // Use a transaction with exclusive lock for atomic upsert
    const { data: transaction, error: transactionError } = await supabaseClient.rpc('begin_exclusive_escrow', {
      p_user_id: user.id,
      p_buyer_id: buyer_id || user.id,
      p_seller_id: seller_id,
      p_product_id: productId,
      p_amount: parseFloat(amount),
      p_currency: currency,
      p_payment_id: x402PaymentId,
      p_idempotency_key: idempotencyKey
    });

    if (transactionError) {
      console.error('Error in exclusive escrow transaction:', transactionError);
      
      // Fallback to regular upsert if RPC doesn't exist
      const { data: escrow, error: fallbackError } = await supabaseClient
        .from('escrow_transactions')
        .upsert({
          user_id: user.id,
          buyer_id: buyer_id || user.id,
          seller_id: seller_id,
          product_id: productId,
          amount: parseFloat(amount),
          currency,
          status: 'escrowed',
          payment_method: 'x402',
          x402_payment_id: x402PaymentId,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          release_conditions: {
            requires_delivery_confirmation: true,
            auto_release_days: 7,
            dispute_window_hours: 24,
            idempotency_key: idempotencyKey
          }
        }, {
          onConflict: 'x402_payment_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (fallbackError) {
        console.error('Error creating escrow transaction:', fallbackError);
        throw fallbackError;
      }

      // Log the escrow initiation event
      await supabaseClient
        .from('payment_events')
        .insert({
          transaction_id: escrow.id,
          payment_id: x402PaymentId,
          event_type: 'escrow_initiated',
          event_data: {
            amount,
            currency,
            x402_payment_id: x402PaymentId,
            product_id: productId,
            buyer_id: buyer_id || user.id,
            seller_id: seller_id,
            idempotency_key: idempotencyKey
          }
        });

      // Update user trust points
      await supabaseClient
        .from('profiles')
        .update({
          trust_points: supabaseClient.raw('trust_points + 10'),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      return new Response(JSON.stringify({
        success: true,
        transaction: escrow,
        message: 'Escrow initiated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      transaction,
      message: 'Escrow initiated successfully with exclusive lock'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in initiate-escrow function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
