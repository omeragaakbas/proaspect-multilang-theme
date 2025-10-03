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

  return {
    invoices,
    isLoading,
    createInvoice: createInvoice.mutate,
  };
}
