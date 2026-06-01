import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface TimeEntry {
  id: string;
  date: string;
  project_id: string;
  project?: {
    name_i18n: {
      nl: string;
      en: string;
      tr: string;
    };
    client: {
      name_i18n: {
        nl: string;
        en: string;
        tr: string;
      };
    };
  };
  start_time?: string;
  end_time?: string;
  hours: number;
  description?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  contractor_id: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

export function useTimeEntries() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['time_entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          project:projects(
            name_i18n,
            client:clients(name_i18n)
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      return data.map(entry => ({
        ...entry,
        project: entry.project ? {
          name_i18n: entry.project.name_i18n as { nl: string; en: string; tr: string },
          client: {
            name_i18n: entry.project.client.name_i18n as { nl: string; en: string; tr: string },
          },
        } : undefined,
      })) as TimeEntry[];
    },
  });

  const createTimeEntry = useMutation({
    mutationFn: async (newEntry: {
      date: Date;
      project_id: string;
      start_time?: string;
      end_time?: string;
      hours: number;
      description?: string;
      status: 'DRAFT' | 'SUBMITTED';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          date: newEntry.date.toISOString().split('T')[0],
          project_id: newEntry.project_id,
          start_time: newEntry.start_time,
          end_time: newEntry.end_time,
          hours: newEntry.hours,
          description: newEntry.description,
          status: newEntry.status,
          contractor_id: user.id,
          submitted_at: newEntry.status === 'SUBMITTED' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      toast({ title: t('time.entrySaved'), description: t('time.entrySavedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const updateTimeEntryStatus = useMutation({
    mutationFn: async ({ id, status, rejection_reason }: { id: string; status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'; rejection_reason?: string }) => {
      const updates: any = { status };

      if (status === 'SUBMITTED') {
        updates.submitted_at = new Date().toISOString();
      } else if (status === 'APPROVED') {
        updates.approved_at = new Date().toISOString();
      } else if (status === 'REJECTED') {
        updates.rejected_at = new Date().toISOString();
        if (rejection_reason) {
          updates.rejection_reason = rejection_reason;
        }
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
    },
  });

  const editTimeEntry = useMutation({
    mutationFn: async (params: {
      id: string;
      date?: string;
      project_id?: string;
      start_time?: string;
      end_time?: string;
      hours?: number;
      description?: string;
    }) => {
      const updates: any = {};
      if (params.date !== undefined) updates.date = params.date;
      if (params.project_id !== undefined) updates.project_id = params.project_id;
      if (params.start_time !== undefined) updates.start_time = params.start_time;
      if (params.end_time !== undefined) updates.end_time = params.end_time;
      if (params.hours !== undefined) updates.hours = params.hours;
      if (params.description !== undefined) updates.description = params.description;

      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      toast({ title: t('time.entryUpdated'), description: t('time.entryUpdatedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteTimeEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      toast({ title: t('time.entryDeleted'), description: t('time.entryDeletedDesc') });
    },
    onError: (error) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  return {
    timeEntries,
    isLoading,
    createTimeEntry: createTimeEntry.mutate,
    updateTimeEntry: updateTimeEntryStatus.mutate,
    editTimeEntry: editTimeEntry.mutate,
    deleteTimeEntry: deleteTimeEntry.mutate,
  };
}
