import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name_i18n: {
    nl: string;
    en: string;
    tr: string;
  };
  contact_name?: string;
  contact_email?: string;
  billing_email?: string;
}

export function useClients() {
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
      })) as Client[];
    },
  });

  return {
    clients,
    isLoading,
  };
}
