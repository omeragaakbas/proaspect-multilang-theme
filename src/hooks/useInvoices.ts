import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client?: {
    name_i18n: {
      nl: string;
      en: string;
      tr: string;
    };
  };
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal_cents: number;
  vat_rate: number;
  vat_amount_cents: number;
  total_cents: number;
  sent_at?: string;
  viewed_at?: string;
  paid_at?: string;
  contractor_id: string;
}

export function useInvoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(name_i18n)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(invoice => ({
        ...invoice,
        client: invoice.client ? {
          name_i18n: invoice.client.name_i18n as { nl: string; en: string; tr: string },
        } : undefined,
      })) as Invoice[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (newInvoice: {
      client_id: string;
      issue_date: string;
      due_date: string;
      vat_rate?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate invoice number
      const { data: invoiceNumber, error: fnError } = await supabase
        .rpc('generate_invoice_number', { contractor_uuid: user.id });

      if (fnError) throw fnError;

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          client_id: newInvoice.client_id,
          issue_date: newInvoice.issue_date,
          due_date: newInvoice.due_date,
          vat_rate: newInvoice.vat_rate || 21,
          contractor_id: user.id,
          status: 'DRAFT',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Factuur aangemaakt',
        description: 'De factuur is succesvol aangemaakt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fout',
        description: `Er is een fout opgetreden: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const createInvoiceWithLineItems = useMutation({
    mutationFn: async (params: {
      client_id: string;
      issue_date: string;
      due_date: string;
      vat_rate: number;
      time_entry_ids: string[];
      grouping: 'day' | 'week';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate invoice number
      const { data: invoiceNumber, error: fnError } = await supabase
        .rpc('generate_invoice_number', { contractor_uuid: user.id });

      if (fnError) throw fnError;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          client_id: params.client_id,
          issue_date: params.issue_date,
          due_date: params.due_date,
          vat_rate: params.vat_rate,
          contractor_id: user.id,
          status: 'DRAFT',
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Fetch time entries with project details
      const { data: timeEntries, error: entriesError } = await supabase
        .from('time_entries')
        .select('*, project:projects(hourly_rate)')
        .in('id', params.time_entry_ids);

      if (entriesError) throw entriesError;

      // Group and create line items
      const lineItems = [];
      
      if (params.grouping === 'day') {
        // Group by date
        const grouped = timeEntries.reduce((acc: any, entry: any) => {
          const date = entry.date;
          if (!acc[date]) acc[date] = [];
          acc[date].push(entry);
          return acc;
        }, {});

        for (const [date, entries] of Object.entries(grouped)) {
          const totalHours = (entries as any[]).reduce((sum, e) => sum + Number(e.hours), 0);
          const rate = (entries as any[])[0].project?.hourly_rate || 5000;
          
          lineItems.push({
            invoice_id: invoice.id,
            description: `Werkzaamheden op ${new Date(date).toLocaleDateString('nl-NL')}`,
            quantity: totalHours,
            unit_price_cents: rate,
            total_cents: Math.round(totalHours * rate),
          });
        }
      } else {
        // Group by week
        const grouped = timeEntries.reduce((acc: any, entry: any) => {
          const date = new Date(entry.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay() + 1);
          const weekKey = weekStart.toISOString().split('T')[0];
          
          if (!acc[weekKey]) acc[weekKey] = [];
          acc[weekKey].push(entry);
          return acc;
        }, {});

        for (const [weekStart, entries] of Object.entries(grouped)) {
          const totalHours = (entries as any[]).reduce((sum, e) => sum + Number(e.hours), 0);
          const rate = (entries as any[])[0].project?.hourly_rate || 5000;
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          lineItems.push({
            invoice_id: invoice.id,
            description: `Werkzaamheden week van ${new Date(weekStart).toLocaleDateString('nl-NL')} t/m ${weekEnd.toLocaleDateString('nl-NL')}`,
            quantity: totalHours,
            unit_price_cents: rate,
            total_cents: Math.round(totalHours * rate),
          });
        }
      }

      // Insert line items
      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItems);

      if (lineItemsError) throw lineItemsError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Factuur aangemaakt',
        description: 'De factuur met regelitems is succesvol aangemaakt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fout',
        description: `Er is een fout opgetreden: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    invoices,
    isLoading,
    createInvoice: createInvoice.mutate,
    createInvoiceWithLineItems: createInvoiceWithLineItems.mutate,
  };
}
