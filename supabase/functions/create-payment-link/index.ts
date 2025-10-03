import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PaymentLinkSchema = z.object({
  invoiceId: z.string().uuid()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token for auth
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!stripeKey) {
      throw new Error('Stripe is not configured');
    }

    // Validate input
    const body = await req.json();
    const { invoiceId } = PaymentLinkSchema.parse(body);

    // Use service role to fetch invoice and verify ownership
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get invoice details and verify ownership
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw new Error('Invoice not found');
    
    // Verify user owns this invoice
    if (invoice.contractor_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    
    // Sanitize error message
    let userMessage = 'Failed to create payment link';
    if (error instanceof z.ZodError) {
      userMessage = 'Invalid invoice ID provided';
    } else if (error.message?.includes('Stripe')) {
      userMessage = 'Payment provider error';
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});