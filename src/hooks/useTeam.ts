import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export function useTeam() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['team-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamInvitation[];
    },
  });

  const inviteMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('team_invitations')
        .insert({ 
          email, 
          role: role as any,
          contractor_id: user.id 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      toast({
        title: 'Uitnodiging verstuurd',
        description: 'De teamuitnodiging is succesvol verstuurd.',
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

  const revokeInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      toast({
        title: 'Uitnodiging ingetrokken',
        description: 'De uitnodiging is succesvol ingetrokken.',
      });
    },
  });

  return {
    invitations,
    isLoading,
    inviteMember,
    revokeInvitation,
  };
}
