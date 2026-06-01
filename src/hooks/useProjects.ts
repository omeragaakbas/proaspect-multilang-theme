import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
          name_i18n: { nl: newProject.name, en: newProject.name, tr: newProject.name },
          code: newProject.code,
          description_i18n: newProject.description
            ? { nl: newProject.description, en: newProject.description, tr: newProject.description }
            : undefined,
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
      toast({ title: t('projects.created'), description: t('projects.createdDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const updateProject = useMutation({
    mutationFn: async (params: {
      id: string;
      name?: string;
      code?: string;
      description?: string;
      client_id?: string;
      hourly_rate?: number;
    }) => {
      const updates: any = {};
      if (params.name !== undefined) {
        updates.name_i18n = { nl: params.name, en: params.name, tr: params.name };
      }
      if (params.description !== undefined) {
        updates.description_i18n = { nl: params.description, en: params.description, tr: params.description };
      }
      if (params.code !== undefined) updates.code = params.code;
      if (params.client_id !== undefined) updates.client_id = params.client_id;
      if (params.hourly_rate !== undefined) updates.hourly_rate = Math.round(params.hourly_rate * 100);

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: t('projects.updated'), description: t('projects.updatedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const archiveProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .update({ archived: true })
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: t('projects.archived'), description: t('projects.archivedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  return {
    projects,
    isLoading,
    createProject: createProject.mutate,
    updateProject: updateProject.mutate,
    archiveProject: archiveProject.mutate,
  };
}
