import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GetInvoicesSchema = z.object({
  token: z.string().min(1),
  action: z.literal('get_invoices'),
});

const ApproveInvoiceSchema = z.object({
  token: z.string().min(1),
  action: z.literal('approve_invoice'),
  invoice_id: z.string().uuid(),
  approved_by: z.string().min(1).max(200),
});

const RequestSchema = z.discriminatedUnion('action', [
  GetInvoicesSchema,
  ApproveInvoiceSchema,
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const validated = RequestSchema.parse(body);

    // Verify token and get client_id
    const { data: tokenData, error: tokenError } = await supabase
      .from('client_access_tokens')
      .select('client_id, email, expires_at, last_used_at')
      .eq('token', validated.token)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check token expiry
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Token has expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last_used_at
    await supabase
      .from('client_access_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token', validated.token);

    if (validated.action === 'get_invoices') {
      // Fetch invoices for this client
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients:client_id (
            name_i18n,
            contact_name,
            contact_email
          ),
          invoice_line_items (*)
        `)
        .eq('client_id', tokenData.client_id)
        .order('created_at', { ascending: false });

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch invoices' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ invoices }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (validated.action === 'approve_invoice') {
      // Verify invoice belongs to this client
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('client_id')
        .eq('id', validated.invoice_id)
        .single();

      if (invoiceError || !invoice || invoice.client_id !== tokenData.client_id) {
        return new Response(
          JSON.stringify({ error: 'Invoice not found or unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Approve invoice
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          client_approved_at: new Date().toISOString(),
          client_approved_by: validated.approved_by,
        })
        .eq('id', validated.invoice_id);

      if (updateError) {
        console.error('Error approving invoice:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to approve invoice' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in client-portal function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
