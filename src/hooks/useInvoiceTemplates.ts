import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InvoiceTemplate {
  id: string;
  contractor_id: string;
  name: string;
  description: string | null;
  line_items: any[];
  vat_rate: number;
  payment_terms: string;
  notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useInvoiceTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['invoice-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InvoiceTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: {
      name: string;
      description?: string;
      line_items: any[];
      vat_rate?: number;
      payment_terms?: string;
      notes?: string;
      is_default?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('invoice_templates')
        .insert({
          contractor_id: user.id,
          ...template,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
      toast({
        title: 'Template aangemaakt',
        description: 'Je factuurtemplate is succesvol opgeslagen.',
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

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InvoiceTemplate> & { id: string }) => {
      const { error } = await supabase
        .from('invoice_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
      toast({
        title: 'Template bijgewerkt',
        description: 'De wijzigingen zijn opgeslagen.',
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoice_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
      toast({
        title: 'Template verwijderd',
        description: 'Het template is succesvol verwijderd.',
      });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
  };
}
