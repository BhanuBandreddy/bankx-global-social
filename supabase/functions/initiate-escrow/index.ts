
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { productId, amount, currency = 'USD', x402PaymentId } = await req.json();

    if (!productId || !amount) {
      throw new Error('Missing required fields: productId, amount');
    }

    console.log('Initiating escrow for user:', user.id, 'product:', productId, 'amount:', amount);

    // Create escrow transaction
    const { data: transaction, error: insertError } = await supabaseClient
      .from('escrow_transactions')
      .insert({
        user_id: user.id,
        product_id: productId,
        amount: parseFloat(amount),
        currency,
        status: 'escrowed',
        payment_method: 'x402',
        x402_payment_id: x402PaymentId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        release_conditions: {
          requires_delivery_confirmation: true,
          auto_release_days: 7,
          dispute_window_hours: 24
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating escrow transaction:', insertError);
      throw insertError;
    }

    // Log the escrow initiation event
    await supabaseClient
      .from('payment_events')
      .insert({
        transaction_id: transaction.id,
        event_type: 'escrow_initiated',
        event_data: {
          amount,
          currency,
          x402_payment_id: x402PaymentId,
          product_id: productId
        }
      });

    // Get current user trust points and update them
    const { data: currentProfile } = await supabaseClient
      .from('profiles')
      .select('trust_points')
      .eq('id', user.id)
      .single();

    const currentTrustPoints = currentProfile?.trust_points || 0;
    const newTrustPoints = currentTrustPoints + 10;

    // Update user trust score for successful escrow creation
    await supabaseClient
      .from('profiles')
      .update({
        trust_points: newTrustPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      transaction,
      message: 'Escrow initiated successfully'
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
