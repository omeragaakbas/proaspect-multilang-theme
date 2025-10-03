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
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    // Verify request is from authorized cron job
    const authHeader = req.headers.get('authorization');
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized access attempt to generate-recurring-invoices');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active recurring invoices that need to be generated
    const { data: recurringInvoices, error: fetchError } = await supabase
      .from('recurring_invoices')
      .select('*, template:invoice_templates(*), client:clients(*)')
      .eq('is_active', true)
      .lte('next_invoice_date', new Date().toISOString().split('T')[0]);

    if (fetchError) throw fetchError;

    console.log(`Found ${recurringInvoices?.length || 0} recurring invoices to generate`);

    const results = [];
    for (const recurring of recurringInvoices || []) {
      try {
        // Generate invoice number
        const { data: invoiceNumber } = await supabase
          .rpc('generate_invoice_number', { contractor_uuid: recurring.contractor_id });

        // Calculate next invoice date
        const nextDate = new Date(recurring.next_invoice_date);
        let newNextDate = new Date(nextDate);
        
        switch (recurring.frequency) {
          case 'WEEKLY':
            newNextDate.setDate(newNextDate.getDate() + 7);
            break;
          case 'MONTHLY':
            newNextDate.setMonth(newNextDate.getMonth() + 1);
            break;
          case 'QUARTERLY':
            newNextDate.setMonth(newNextDate.getMonth() + 3);
            break;
          case 'YEARLY':
            newNextDate.setFullYear(newNextDate.getFullYear() + 1);
            break;
        }

        // Calculate due date
        const dueDate = new Date(nextDate);
        dueDate.setDate(dueDate.getDate() + 14); // Default 14 days

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            contractor_id: recurring.contractor_id,
            client_id: recurring.client_id,
            invoice_number: invoiceNumber,
            issue_date: nextDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            payment_terms: recurring.payment_terms,
            vat_rate: recurring.vat_rate,
            notes: recurring.notes,
            status: 'DRAFT',
            recurring_invoice_id: recurring.id,
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Copy line items from template if exists
        if (recurring.template) {
          const lineItems = recurring.template.line_items || [];
          for (const item of lineItems as any[]) {
            await supabase
              .from('invoice_line_items')
              .insert({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price_cents: item.unit_price_cents,
                total_cents: item.quantity * item.unit_price_cents,
              });
          }
        }

        // Update recurring invoice
        await supabase
          .from('recurring_invoices')
          .update({
            last_generated_at: new Date().toISOString(),
            next_invoice_date: newNextDate.toISOString().split('T')[0],
            is_active: recurring.end_date ? new Date(recurring.end_date) >= newNextDate : true,
          })
          .eq('id', recurring.id);

        results.push({
          recurring_id: recurring.id,
          invoice_id: invoice.id,
          invoice_number: invoiceNumber,
          success: true,
        });

        console.log(`Generated invoice ${invoiceNumber} for recurring invoice ${recurring.id}`);
      } catch (error: any) {
        console.error(`Error generating invoice for recurring ${recurring.id}:`, error);
        results.push({
          recurring_id: recurring.id,
          error: error.message,
          success: false,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        generated: results.length,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Recurring invoices generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate recurring invoices' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});