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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { invoiceId } = await req.json();

    // Get invoice with all details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        contractor:contractor_profiles(*),
        line_items:invoice_line_items(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;

    // Generate HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .company-info { font-size: 14px; }
          .invoice-info { text-align: right; }
          .invoice-title { font-size: 32px; font-weight: bold; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { display: flex; justify-content: flex-end; margin: 5px 0; }
          .total-label { width: 200px; font-weight: bold; }
          .total-value { width: 150px; text-align: right; }
          .notes { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h2>${invoice.contractor?.company_name || 'Company'}</h2>
            ${invoice.contractor?.kvk ? `<p>KvK: ${invoice.contractor.kvk}</p>` : ''}
            ${invoice.contractor?.vat_number ? `<p>BTW: ${invoice.contractor.vat_number}</p>` : ''}
          </div>
          <div class="invoice-info">
            <div class="invoice-title">FACTUUR</div>
            <p><strong>Nummer:</strong> ${invoice.invoice_number}</p>
            <p><strong>Datum:</strong> ${new Date(invoice.issue_date).toLocaleDateString('nl-NL')}</p>
            <p><strong>Vervaldatum:</strong> ${new Date(invoice.due_date).toLocaleDateString('nl-NL')}</p>
          </div>
        </div>

        <div>
          <h3>Klant</h3>
          <p>${invoice.client?.name_i18n?.nl || invoice.client?.name_i18n?.en || ''}</p>
          ${invoice.client?.contact_name ? `<p>${invoice.client.contact_name}</p>` : ''}
          ${invoice.client?.contact_email ? `<p>${invoice.client.contact_email}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Omschrijving</th>
              <th>Aantal</th>
              <th>Prijs per eenheid</th>
              <th>Totaal</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.line_items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>€${(item.unit_price_cents / 100).toFixed(2)}</td>
                <td>€${(item.total_cents / 100).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <div class="total-label">Subtotaal:</div>
            <div class="total-value">€${(invoice.subtotal_cents / 100).toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">BTW (${invoice.vat_rate}%):</div>
            <div class="total-value">€${(invoice.vat_amount_cents / 100).toFixed(2)}</div>
          </div>
          <div class="total-row" style="font-size: 18px; margin-top: 10px;">
            <div class="total-label">Totaal:</div>
            <div class="total-value">€${(invoice.total_cents / 100).toFixed(2)}</div>
          </div>
        </div>

        ${invoice.notes ? `
          <div class="notes">
            <h4>Opmerkingen</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <div class="notes">
          <p>Betaaltermijn: ${invoice.payment_terms}</p>
          ${invoice.contractor?.iban ? `<p>IBAN: ${invoice.contractor.iban}</p>` : ''}
        </div>
      </body>
      </html>
    `;

    // For now, return the HTML (in production, use a PDF generation service)
    // You can integrate with services like PDFMonkey, DocRaptor, or use Deno's PDF libraries
    console.log(`PDF generated for invoice ${invoice.invoice_number}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'PDF generation ready',
        html: html 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});