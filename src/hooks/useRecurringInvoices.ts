import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecurringInvoice {
  id: string;
  contractor_id: string;
  client_id: string;
  template_id?: string;
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  start_date: string;
  end_date?: string;
  next_invoice_date: string;
  is_active: boolean;
  last_generated_at?: string;
  payment_terms?: string;
  vat_rate: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useRecurringInvoices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recurringInvoices = [], isLoading, error } = useQuery({
    queryKey: ['recurring-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_invoices')
        .select('*, client:clients(*), template:invoice_templates(*)')
        .order('next_invoice_date', { ascending: true });

      if (error) throw error;
      return data as RecurringInvoice[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newRecurring: Partial<RecurringInvoice>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const recurringData: any = {
        ...newRecurring,
        contractor_id: user.id,
      };

      const { data, error } = await supabase
        .from('recurring_invoices')
        .insert(recurringData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-invoices'] });
      toast({
        title: 'Recurring invoice aangemaakt',
        description: 'De terugkerende factuur is succesvol aangemaakt.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RecurringInvoice> }) => {
      const { data, error } = await supabase
        .from('recurring_invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-invoices'] });
      toast({
        title: 'Recurring invoice bijgewerkt',
        description: 'De terugkerende factuur is succesvol bijgewerkt.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-invoices'] });
      toast({
        title: 'Recurring invoice verwijderd',
        description: 'De terugkerende factuur is succesvol verwijderd.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    recurringInvoices,
    isLoading,
    error,
    createRecurring: createMutation.mutate,
    updateRecurring: updateMutation.mutate,
    deleteRecurring: deleteMutation.mutate,
  };
};