import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export type InvoiceStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

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
  contractor_id: string;
  contractor?: {
    name: string;
    email: string;
  };
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal_cents: number;
  vat_rate: number;
  vat_amount_cents: number;
  total_cents: number;
  notes?: string;
  sent_at?: string;
  viewed_at?: string;
  paid_at?: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export function useInvoices() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRole } = useAuth();
  const isAdmin = userRole?.role === 'ADMIN';

  const { data: profilesMap = {} } = useQuery({
    queryKey: ['all_profiles'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email');

      if (error) throw error;
      const map: Record<string, { name: string; email: string }> = {};
      for (const p of data) {
        map[p.user_id] = { name: p.name, email: p.email };
      }
      return map;
    },
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', isAdmin],
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

  const enrichedInvoices = isAdmin
    ? invoices.map(inv => ({
        ...inv,
        contractor: profilesMap[inv.contractor_id] || undefined,
      }))
    : invoices;

  const createInvoice = useMutation({
    mutationFn: async (newInvoice: {
      client_id: string;
      issue_date: string;
      due_date: string;
      vat_rate?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
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

      const { data: invoiceNumber, error: fnError } = await supabase
        .rpc('generate_invoice_number', { contractor_uuid: user.id });

      if (fnError) throw fnError;

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

      const { data: timeEntries, error: entriesError } = await supabase
        .from('time_entries')
        .select('*, project:projects(hourly_rate)')
        .in('id', params.time_entry_ids);

      if (entriesError) throw entriesError;

      const lineItems = [];

      if (params.grouping === 'day') {
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

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItems);

      if (lineItemsError) throw lineItemsError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const submitInvoice = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      const invoice = data;
      await supabase.from('notifications').insert({
        user_id: invoice.contractor_id,
        title: 'Factuur ingediend',
        message: `Factuur ${invoice.invoice_number} is ingediend ter goedkeuring.`,
        type: 'INVOICE_SUBMITTED',
        action_url: `/dashboard/approvals`,
        metadata: { invoice_id: invoiceId },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const approveInvoice = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: data.contractor_id,
        title: 'Factuur goedgekeurd',
        message: `Factuur ${data.invoice_number} is goedgekeurd door ProAspect.`,
        type: 'INVOICE_APPROVED',
        action_url: `/dashboard/invoices`,
        metadata: { invoice_id: invoiceId },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const rejectInvoice = useMutation({
    mutationFn: async ({ invoiceId, reason }: { invoiceId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'REJECTED',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: data.contractor_id,
        title: 'Factuur afgewezen',
        message: `Factuur ${data.invoice_number} is afgewezen. Reden: ${reason}`,
        type: 'INVOICE_REJECTED',
        action_url: `/dashboard/invoices`,
        metadata: { invoice_id: invoiceId, reason },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const sendInvoice = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'SENT',
          sent_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: data.contractor_id,
        title: 'Factuur verzonden',
        message: `Factuur ${data.invoice_number} is verzonden door ProAspect.`,
        type: 'INVOICE_SENT',
        action_url: `/dashboard/invoices`,
        metadata: { invoice_id: invoiceId },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async (params: {
      id: string;
      client_id?: string;
      issue_date?: string;
      due_date?: string;
      vat_rate?: number;
      notes?: string;
    }) => {
      const updates: any = {};
      if (params.client_id !== undefined) updates.client_id = params.client_id;
      if (params.issue_date !== undefined) updates.issue_date = params.issue_date;
      if (params.due_date !== undefined) updates.due_date = params.due_date;
      if (params.vat_rate !== undefined) updates.vat_rate = params.vat_rate;
      if (params.notes !== undefined) updates.notes = params.notes;

      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: t('invoices.updated'), description: t('invoices.updatedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (lineItemsError) throw lineItemsError;

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: t('invoices.deleted'), description: t('invoices.deletedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: data.contractor_id,
        title: 'Factuur betaald',
        message: `Factuur ${data.invoice_number} is als betaald gemarkeerd.`,
        type: 'INVOICE_PAID',
        action_url: `/dashboard/invoices`,
        metadata: { invoice_id: invoiceId },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: t('invoices.markedAsPaid'), description: t('invoices.markedAsPaidDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  return {
    invoices: enrichedInvoices,
    isLoading,
    isAdmin,
    createInvoice: createInvoice.mutate,
    createInvoiceWithLineItems: createInvoiceWithLineItems.mutate,
    submitInvoice: submitInvoice.mutate,
    approveInvoice: approveInvoice.mutate,
    rejectInvoice: rejectInvoice.mutate,
    sendInvoice: sendInvoice.mutate,
    updateInvoice: updateInvoice.mutate,
    deleteInvoice: deleteInvoice.mutate,
    markAsPaid: markAsPaid.mutate,
  };
}
