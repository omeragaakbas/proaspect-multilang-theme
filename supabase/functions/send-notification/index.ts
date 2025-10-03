import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const systemSecret = Deno.env.get("SYSTEM_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NotificationSchema = z.object({
  type: z.enum(['invoice_sent', 'invoice_viewed', 'invoice_paid', 'invoice_overdue', 'payment_reminder', 'time_entry_approved', 'time_entry_rejected', 'team_invitation']),
  recipientEmail: z.string().email().max(255),
  recipientName: z.string().trim().min(1).max(100),
  data: z.record(z.any())
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify request is from authorized system (MANDATORY)
    const authHeader = req.headers.get('authorization');
    
    if (!systemSecret) {
      console.error('SYSTEM_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    if (!authHeader || authHeader !== `Bearer ${systemSecret}`) {
      console.error('Unauthorized access attempt to send-notification');
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validate input with Zod
    const body = await req.json();
    const validated = NotificationSchema.parse(body);
    const { type, recipientEmail, recipientName, data } = validated;

    console.log(`Sending ${type} notification to ${recipientEmail}`);

    let subject = "";
    let html = "";

    switch (type) {
      case 'invoice_sent':
        subject = `Nieuwe factuur: ${data.invoiceNumber}`;
        html = `
          <h2>Beste ${recipientName},</h2>
          <p>Je hebt een nieuwe factuur ontvangen van ${data.contractorName}.</p>
          <p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>
          <p><strong>Bedrag:</strong> €${(data.totalCents / 100).toFixed(2)}</p>
          <p><strong>Vervaldatum:</strong> ${new Date(data.dueDate).toLocaleDateString('nl-NL')}</p>
          <p><a href="${data.invoiceUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Bekijk factuur</a></p>
          <p>Met vriendelijke groet,<br>${data.contractorName}</p>
        `;
        break;

      case 'payment_reminder':
        subject = `Herinnering: Factuur ${data.invoiceNumber} vervalt binnenkort`;
        html = `
          <h2>Beste ${recipientName},</h2>
          <p>Dit is een vriendelijke herinnering dat factuur ${data.invoiceNumber} over ${data.daysUntilDue} dagen vervalt.</p>
          <p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>
          <p><strong>Bedrag:</strong> €${(data.totalCents / 100).toFixed(2)}</p>
          <p><strong>Vervaldatum:</strong> ${new Date(data.dueDate).toLocaleDateString('nl-NL')}</p>
          <p><a href="${data.invoiceUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Bekijk factuur</a></p>
          <p>Met vriendelijke groet,<br>${data.contractorName}</p>
        `;
        break;

      case 'invoice_overdue':
        subject = `Actie vereist: Factuur ${data.invoiceNumber} is vervallen`;
        html = `
          <h2>Beste ${recipientName},</h2>
          <p>Factuur ${data.invoiceNumber} is vervallen. Graag zo spoedig mogelijk betalen.</p>
          <p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>
          <p><strong>Bedrag:</strong> €${(data.totalCents / 100).toFixed(2)}</p>
          <p><strong>Vervaldatum was:</strong> ${new Date(data.dueDate).toLocaleDateString('nl-NL')}</p>
          <p><a href="${data.invoiceUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Bekijk factuur</a></p>
          <p>Bij vragen kunt u contact met ons opnemen.</p>
          <p>Met vriendelijke groet,<br>${data.contractorName}</p>
        `;
        break;

      case 'invoice_paid':
        subject = `Betaling ontvangen voor factuur ${data.invoiceNumber}`;
        html = `
          <h2>Beste ${recipientName},</h2>
          <p>We hebben je betaling voor factuur ${data.invoiceNumber} ontvangen. Hartelijk dank!</p>
          <p><strong>Factuurnummer:</strong> ${data.invoiceNumber}</p>
          <p><strong>Bedrag:</strong> €${(data.totalCents / 100).toFixed(2)}</p>
          <p><strong>Betaald op:</strong> ${new Date(data.paidAt).toLocaleDateString('nl-NL')}</p>
          <p>Met vriendelijke groet,<br>${data.contractorName}</p>
        `;
        break;

      case 'time_entry_approved':
        subject = `Tijdsregistratie goedgekeurd`;
        html = `
          <h2>Beste ${recipientName},</h2>
          <p>Je tijdsregistratie voor ${data.projectName} op ${new Date(data.date).toLocaleDateString('nl-NL')} is goedgekeurd.</p>
          <p><strong>Uren:</strong> ${data.hours}</p>
          <p><strong>Project:</strong> ${data.projectName}</p>
          <p>Deze uren worden meegenomen in de volgende factuur.</p>
          <p>Met vriendelijke groet,<br>ProAspect</p>
        `;
        break;

      case 'time_entry_rejected':
        subject = `Tijdsregistratie afgekeurd`;
        html = `
          <h2>Beste ${recipientName},</h2>
          <p>Je tijdsregistratie voor ${data.projectName} op ${new Date(data.date).toLocaleDateString('nl-NL')} is helaas afgekeurd.</p>
          <p><strong>Uren:</strong> ${data.hours}</p>
          <p><strong>Project:</strong> ${data.projectName}</p>
          <p><strong>Reden:</strong> ${data.rejectionReason || 'Geen reden opgegeven'}</p>
          <p>Neem contact op voor meer informatie.</p>
          <p>Met vriendelijke groet,<br>ProAspect</p>
        `;
        break;

      case 'team_invitation':
        subject = `Je bent uitgenodigd voor het team`;
        html = `
          <h2>Beste ${recipientName},</h2>
          <p>${data.inviterName} heeft je uitgenodigd om deel te nemen aan hun team op ProAspect.</p>
          <p><strong>Rol:</strong> ${data.role}</p>
          <p><a href="${data.acceptUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Uitnodiging accepteren</a></p>
          <p>Deze uitnodiging verloopt op ${new Date(data.expiresAt).toLocaleDateString('nl-NL')}.</p>
          <p>Met vriendelijke groet,<br>ProAspect Team</p>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "ProAspect <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    
    // Sanitize error message for client
    let userMessage = 'Failed to send notification';
    if (error instanceof z.ZodError) {
      userMessage = 'Invalid input provided';
    } else if (error.message?.includes('email')) {
      userMessage = 'Email delivery failed';
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
