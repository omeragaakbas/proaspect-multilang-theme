import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!stripeKey) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY.');
    }

    const { invoiceId } = await req.json();

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;

    // Create Stripe checkout session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'success_url': `${supabaseUrl}/client-portal?token={CHECKOUT_SESSION_ID}&success=true`,
        'cancel_url': `${supabaseUrl}/client-portal?token={CHECKOUT_SESSION_ID}&cancelled=true`,
        'customer_email': invoice.client?.billing_email || invoice.client?.contact_email || '',
        'line_items[0][price_data][currency]': invoice.currency.toLowerCase(),
        'line_items[0][price_data][product_data][name]': `Factuur ${invoice.invoice_number}`,
        'line_items[0][price_data][unit_amount]': invoice.total_cents.toString(),
        'line_items[0][quantity]': '1',
        'metadata[invoice_id]': invoice.id,
        'metadata[invoice_number]': invoice.invoice_number,
      }).toString(),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error('Stripe error:', error);
      throw new Error('Failed to create payment link with Stripe');
    }

    const session = await stripeResponse.json();

    // Update invoice with Stripe session ID
    await supabase
      .from('invoices')
      .update({
        stripe_checkout_session_id: session.id,
        payment_link: session.url,
      })
      .eq('id', invoiceId);

    console.log(`Payment link created for invoice ${invoice.invoice_number}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentLink: session.url,
        sessionId: session.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Payment link creation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});