import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const cronSecret = Deno.env.get("CRON_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify request is from authorized cron job (MANDATORY)
    const authHeader = req.headers.get('authorization');
    
    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized access attempt to check-overdue-invoices');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    console.log("Checking for invoices that need reminders or are overdue...");

    // Get invoices that need reminders (3 days before due date)
    const { data: reminderInvoices, error: reminderError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(name_i18n, billing_email, contact_email),
        contractor:contractor_profiles!invoices_contractor_id_fkey(company_name, notification_preferences)
      `)
      .in('status', ['SENT', 'VIEWED'])
      .lte('due_date', threeDaysFromNow.toISOString().split('T')[0])
      .gte('due_date', today.toISOString().split('T')[0])
      .is('reminder_sent_at', null);

    if (reminderError) {
      console.error("Error fetching reminder invoices:", reminderError);
    } else {
      console.log(`Found ${reminderInvoices?.length || 0} invoices needing reminders`);
      
      for (const invoice of reminderInvoices || []) {
        const dueDate = new Date(invoice.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if contractor wants payment reminders
        const notifPrefs = invoice.contractor?.notification_preferences || {};
        if (notifPrefs.payment_reminder === false) {
          console.log(`Skipping reminder for invoice ${invoice.invoice_number} - disabled by contractor`);
          continue;
        }

        const clientEmail = invoice.client?.billing_email || invoice.client?.contact_email;
        if (!clientEmail) {
          console.log(`No email found for invoice ${invoice.invoice_number}`);
          continue;
        }

        try {
          // Send reminder email
          const notificationResponse = await supabase.functions.invoke('send-notification', {
            body: {
              type: 'payment_reminder',
              recipientEmail: clientEmail,
              recipientName: invoice.client?.name_i18n?.nl || 'Client',
              data: {
                invoiceNumber: invoice.invoice_number,
                totalCents: invoice.total_cents,
                dueDate: invoice.due_date,
                daysUntilDue,
                contractorName: invoice.contractor?.company_name || 'ProAspect',
                invoiceUrl: `https://dhuldgnqxistajvuwgao.supabase.co/client-portal?invoice=${invoice.id}`,
              },
            },
          });

          if (notificationResponse.error) {
            console.error(`Failed to send reminder for ${invoice.invoice_number}:`, notificationResponse.error);
          } else {
            // Mark reminder as sent
            await supabase
              .from('invoices')
              .update({ 
                reminder_sent_at: new Date().toISOString(),
                last_reminder_at: new Date().toISOString()
              })
              .eq('id', invoice.id);
            
            console.log(`Reminder sent for invoice ${invoice.invoice_number}`);
          }
        } catch (error) {
          console.error(`Error processing reminder for ${invoice.invoice_number}:`, error);
        }
      }
    }

    // Get overdue invoices (past due date)
    const { data: overdueInvoices, error: overdueError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(name_i18n, billing_email, contact_email),
        contractor:contractor_profiles!invoices_contractor_id_fkey(company_name, notification_preferences)
      `)
      .in('status', ['SENT', 'VIEWED'])
      .lt('due_date', today.toISOString().split('T')[0]);

    if (overdueError) {
      console.error("Error fetching overdue invoices:", overdueError);
    } else {
      console.log(`Found ${overdueInvoices?.length || 0} overdue invoices`);
      
      for (const invoice of overdueInvoices || []) {
        // Check if contractor wants overdue notifications
        const notifPrefs = invoice.contractor?.notification_preferences || {};
        if (notifPrefs.invoice_overdue === false) {
          console.log(`Skipping overdue notification for invoice ${invoice.invoice_number} - disabled by contractor`);
          continue;
        }

        const clientEmail = invoice.client?.billing_email || invoice.client?.contact_email;
        
        try {
          // Update status to OVERDUE
          await supabase
            .from('invoices')
            .update({ status: 'OVERDUE' })
            .eq('id', invoice.id);

          // Send overdue notification if email exists
          if (clientEmail) {
            await supabase.functions.invoke('send-notification', {
              body: {
                type: 'invoice_overdue',
                recipientEmail: clientEmail,
                recipientName: invoice.client?.name_i18n?.nl || 'Client',
                data: {
                  invoiceNumber: invoice.invoice_number,
                  totalCents: invoice.total_cents,
                  dueDate: invoice.due_date,
                  contractorName: invoice.contractor?.company_name || 'ProAspect',
                  invoiceUrl: `https://dhuldgnqxistajvuwgao.supabase.co/client-portal?invoice=${invoice.id}`,
                },
              },
            });
          }
          
          console.log(`Marked invoice ${invoice.invoice_number} as OVERDUE`);
        } catch (error) {
          console.error(`Error processing overdue invoice ${invoice.invoice_number}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersProcessed: reminderInvoices?.length || 0,
        overdueProcessed: overdueInvoices?.length || 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-overdue-invoices:", error);
    return new Response(
      JSON.stringify({ error: 'Failed to process overdue invoices' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
