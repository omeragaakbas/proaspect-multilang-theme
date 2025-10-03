import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      toast({
        title: 'Onkosten toegevoegd',
        description: 'De onkosten zijn succesvol geregistreerd.',
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
    expenses,
    isLoading,
    createExpense: createExpense.mutate,
  };
}
