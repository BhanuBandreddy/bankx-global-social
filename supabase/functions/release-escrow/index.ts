
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

    const { transactionId, confirmationCode, deliveryProof } = await req.json();

    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    console.log('Releasing escrow for transaction:', transactionId);

    // Get the transaction and verify ownership
    const { data: transaction, error: fetchError } = await supabaseClient
      .from('escrow_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !transaction) {
      throw new Error('Transaction not found or access denied');
    }

    if (transaction.status !== 'escrowed') {
      throw new Error(`Cannot release escrow with status: ${transaction.status}`);
    }

    // Update transaction status to released
    const { error: updateError } = await supabaseClient
      .from('escrow_transactions')
      .update({
        status: 'released',
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction status:', updateError);
      throw updateError;
    }

    // Log the escrow release event
    await supabaseClient
      .from('payment_events')
      .insert({
        transaction_id: transactionId,
        event_type: 'escrow_released',
        event_data: {
          confirmation_code: confirmationCode,
          delivery_proof: deliveryProof,
          released_at: new Date().toISOString(),
          released_by: user.id
        }
      });

    // Update user trust score for successful transaction completion
    await supabaseClient
      .from('profiles')
      .update({
        trust_points: supabaseClient.raw('trust_points + 25'),
        trust_score: supabaseClient.raw('LEAST(trust_score + 5, 100)'),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Escrow released successfully',
      transaction_id: transactionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in release-escrow function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
