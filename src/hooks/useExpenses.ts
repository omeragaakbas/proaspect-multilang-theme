import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface Expense {
  id: string;
  contractor_id: string;
  project_id?: string;
  project?: {
    name_i18n: {
      nl: string;
      en: string;
      tr: string;
    };
  };
  date: string;
  amount_cents: number;
  currency: string;
  category: string;
  description?: string;
  receipt_url?: string;
  vat_deductible: boolean;
  vat_amount_cents?: number;
}

export function useExpenses() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          project:projects(name_i18n)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      return data.map(expense => ({
        ...expense,
        project: expense.project ? {
          name_i18n: expense.project.name_i18n as { nl: string; en: string; tr: string },
        } : undefined,
      })) as Expense[];
    },
  });

  const createExpense = useMutation({
    mutationFn: async (newExpense: {
      project_id?: string;
      date: Date;
      amount: number;
      category: string;
      description?: string;
      vat_deductible: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const amount_cents = Math.round(newExpense.amount * 100);
      const vat_amount_cents = newExpense.vat_deductible
        ? Math.round(amount_cents * 0.21)
        : null;

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          contractor_id: user.id,
          project_id: newExpense.project_id,
          date: newExpense.date.toISOString().split('T')[0],
          amount_cents,
          category: newExpense.category,
          description: newExpense.description,
          vat_deductible: newExpense.vat_deductible,
          vat_amount_cents,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: t('expenses.created'), description: t('expenses.createdDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async (params: {
      id: string;
      project_id?: string;
      date?: string;
      amount?: number;
      category?: string;
      description?: string;
      vat_deductible?: boolean;
    }) => {
      const updates: any = {};
      if (params.project_id !== undefined) updates.project_id = params.project_id;
      if (params.date !== undefined) updates.date = params.date;
      if (params.category !== undefined) updates.category = params.category;
      if (params.description !== undefined) updates.description = params.description;
      if (params.vat_deductible !== undefined) updates.vat_deductible = params.vat_deductible;
      if (params.amount !== undefined) {
        updates.amount_cents = Math.round(params.amount * 100);
        updates.vat_amount_cents = (params.vat_deductible ?? false)
          ? Math.round(updates.amount_cents * 0.21)
          : null;
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: t('expenses.updated'), description: t('expenses.updatedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: t('expenses.deleted'), description: t('expenses.deletedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  return {
    expenses,
    isLoading,
    createExpense: createExpense.mutate,
    updateExpense: updateExpense.mutate,
    deleteExpense: deleteExpense.mutate,
  };
}
