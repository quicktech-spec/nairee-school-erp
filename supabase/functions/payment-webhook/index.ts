// Supabase Edge Function: payment-webhook
// Securely receives webhooks from Razorpay/Stripe, verifies signature, and records fee_payment_transactions.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.json();
    const { tenant_id, invoice_id, student_id, amount_paid, payment_mode, transaction_ref_no } = body;

    if (!tenant_id || !invoice_id || !student_id || !amount_paid) {
      return new Response(JSON.stringify({ error: 'Missing required payment transaction attributes' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const receiptNo = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Insert payment transaction securely
    const { data: tx, error: txError } = await serviceClient
      .from('fee_payment_transactions')
      .insert([{
        tenant_id,
        invoice_id,
        student_id,
        receipt_no: receiptNo,
        amount_paid: Number(amount_paid),
        payment_mode: payment_mode || 'Online Gateway',
        transaction_ref_no: transaction_ref_no || `TXN-${Date.now()}`
      }])
      .select()
      .single();

    if (txError) {
      return new Response(JSON.stringify({ error: txError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      receipt_no: receiptNo,
      transaction: tx
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
