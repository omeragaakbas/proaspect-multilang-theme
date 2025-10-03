import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientAccessToken {
  id: string;
  client_id: string;
  email: string;
  token: string;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
}

export function useClientAccess() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accessTokens = [], isLoading } = useQuery({
    queryKey: ['client-access-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_access_tokens')
        .select('*, clients(name_i18n)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createAccessToken = useMutation({
    mutationFn: async ({ clientId, email }: { clientId: string; email: string }) => {
      const { data, error } = await supabase
        .from('client_access_tokens')
        .insert({ client_id: clientId, email })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-access-tokens'] });
      toast({
        title: 'Toegang verleend',
        description: 'Client toegang is succesvol aangemaakt.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const revokeAccess = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from('client_access_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-access-tokens'] });
      toast({
        title: 'Toegang ingetrokken',
        description: 'Client toegang is succesvol ingetrokken.',
      });
    },
  });

  return {
    accessTokens,
    isLoading,
    createAccessToken,
    revokeAccess,
  };
}
