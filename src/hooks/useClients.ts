import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface Client {
  id: string;
  contractor_id: string;
  name_i18n: {
    nl: string;
    en: string;
    tr: string;
  };
  contact_name?: string;
  contact_email?: string;
  billing_email?: string;
  address_json?: {
    street?: string;
    postal_code?: string;
    city?: string;
    country?: string;
  };
  kvk?: string;
  vat_number?: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(client => ({
        ...client,
        name_i18n: client.name_i18n as { nl: string; en: string; tr: string },
        address_json: client.address_json as Client['address_json'],
      })) as Client[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (newClient: {
      name: string;
      contact_name?: string;
      contact_email?: string;
      billing_email?: string;
      address_json?: Client['address_json'];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .insert({
          contractor_id: user.id,
          name_i18n: { nl: newClient.name, en: newClient.name, tr: newClient.name },
          contact_name: newClient.contact_name,
          contact_email: newClient.contact_email,
          billing_email: newClient.billing_email,
          address_json: newClient.address_json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: t('clients.created'), description: t('clients.createdDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const updateClient = useMutation({
    mutationFn: async (params: {
      id: string;
      name?: string;
      contact_name?: string;
      contact_email?: string;
      billing_email?: string;
      address_json?: Client['address_json'];
    }) => {
      const updates: any = {};
      if (params.name !== undefined) {
        updates.name_i18n = { nl: params.name, en: params.name, tr: params.name };
      }
      if (params.contact_name !== undefined) updates.contact_name = params.contact_name;
      if (params.contact_email !== undefined) updates.contact_email = params.contact_email;
      if (params.billing_email !== undefined) updates.billing_email = params.billing_email;
      if (params.address_json !== undefined) updates.address_json = params.address_json;

      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: t('clients.updated'), description: t('clients.updatedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const archiveClient = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .update({ archived: true })
        .eq('id', clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: t('clients.archived'), description: t('clients.archivedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  return {
    clients,
    isLoading,
    createClient: createClient.mutate,
    updateClient: updateClient.mutate,
    archiveClient: archiveClient.mutate,
  };
}
