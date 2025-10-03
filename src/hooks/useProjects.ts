import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name_i18n: {
    nl: string;
    en: string;
    tr: string;
  };
  code?: string;
  description_i18n?: {
    nl: string;
    en: string;
    tr: string;
  };
  client_id: string;
  client?: {
    name_i18n: {
      nl: string;
      en: string;
      tr: string;
    };
  };
  hourly_rate?: number;
  archived: boolean;
  contractor_id: string;
}

export function useProjects() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(name_i18n)
        `)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(project => ({
        ...project,
        name_i18n: project.name_i18n as { nl: string; en: string; tr: string },
        description_i18n: project.description_i18n as { nl: string; en: string; tr: string } | undefined,
        client: project.client ? {
          name_i18n: project.client.name_i18n as { nl: string; en: string; tr: string },
        } : undefined,
      })) as Project[];
    },
  });

  const createProject = useMutation({
    mutationFn: async (newProject: {
      name: string;
      code?: string;
      description?: string;
      client_id: string;
      hourly_rate?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name_i18n: { nl: newProject.name, en: '', tr: '' },
          code: newProject.code,
          description_i18n: newProject.description ? { nl: newProject.description, en: '', tr: '' } : undefined,
          client_id: newProject.client_id,
          hourly_rate: newProject.hourly_rate ? Math.round(newProject.hourly_rate * 100) : null,
          contractor_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project aangemaakt',
        description: 'Het project is succesvol toegevoegd.',
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
    projects,
    isLoading,
    createProject: createProject.mutate,
  };
}
