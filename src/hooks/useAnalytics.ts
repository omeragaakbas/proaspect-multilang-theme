import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AnalyticsData {
  totalHours: number;
  totalRevenue: number;
  totalInvoices: number;
  averageHourlyRate: number;
  paidInvoices: number;
  outstandingAmount: number;
  topClient?: string;
  topProject?: string;
}

export interface TimeAnalytics {
  dailyHours: Array<{ date: string; hours: number; revenue: number }>;
  weeklyHours: Array<{ week: string; hours: number; revenue: number }>;
  monthlyHours: Array<{ month: string; hours: number; revenue: number }>;
}

export interface ClientAnalytics {
  name: string;
  hours: number;
  revenue: number;
  percentage: number;
  projectsCount: number;
}

export const useAnalytics = (startDate?: Date, endDate?: Date) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics | null>(null);
  const [clientAnalytics, setClientAnalytics] = useState<ClientAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    fetchAnalytics();
  }, [user, startDate, endDate]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Build date filter conditions
      const dateFilter = startDate && endDate 
        ? `and created_at >= '${startDate.toISOString()}' and created_at <= '${endDate.toISOString()}'`
        : '';

      // Fetch time entries with project and client data
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select(`
          *,
          projects:project_id (
            name_i18n,
            hourly_rate,
            clients:client_id (
              name_i18n
            )
          )
        `)
        .eq('contractor_id', user.id)
        .gte('created_at', startDate?.toISOString() || '2000-01-01')
        .lte('created_at', endDate?.toISOString() || '2100-01-01');

      if (timeError) throw timeError;

      // Fetch invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('contractor_id', user.id)
        .gte('created_at', startDate?.toISOString() || '2000-01-01')
        .lte('created_at', endDate?.toISOString() || '2100-01-01');

      if (invoicesError) throw invoicesError;

      // Process analytics data
      const processedAnalytics = processAnalyticsData(timeEntries || [], invoices || []);
      const processedTimeAnalytics = processTimeAnalytics(timeEntries || []);
      const processedClientAnalytics = processClientAnalytics(timeEntries || []);

      setAnalytics(processedAnalytics);
      setTimeAnalytics(processedTimeAnalytics);
      setClientAnalytics(processedClientAnalytics);
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (timeEntries: any[], invoices: any[]): AnalyticsData => {
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
    
    // Calculate revenue from approved time entries and invoices
    const approvedEntries = timeEntries.filter(entry => entry.status === 'APPROVED');
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total_cents / 100), 0);
    
    const paidInvoices = invoices.filter(invoice => invoice.status === 'PAID').length;
    const outstandingAmount = invoices
      .filter(invoice => invoice.status !== 'PAID' && invoice.status !== 'CANCELLED')
      .reduce((sum, invoice) => sum + (invoice.total_cents / 100), 0);
    
    const averageHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;

    // Find top client and project
    const clientHours: Record<string, number> = {};
    const projectHours: Record<string, number> = {};
    
    timeEntries.forEach(entry => {
      if (entry.projects?.clients?.name_i18n?.nl) {
        const clientName = entry.projects.clients.name_i18n.nl;
        clientHours[clientName] = (clientHours[clientName] || 0) + (entry.hours || 0);
      }
      
      if (entry.projects?.name_i18n?.nl) {
        const projectName = entry.projects.name_i18n.nl;
        projectHours[projectName] = (projectHours[projectName] || 0) + (entry.hours || 0);
      }
    });

    const topClient = Object.entries(clientHours).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topProject = Object.entries(projectHours).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      totalHours,
      totalRevenue,
      totalInvoices: invoices.length,
      averageHourlyRate,
      paidInvoices,
      outstandingAmount,
      topClient,
      topProject
    };
  };

  const processTimeAnalytics = (timeEntries: any[]): TimeAnalytics => {
    // Group by day
    const dailyData: Record<string, { hours: number; revenue: number }> = {};
    
    timeEntries.forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { hours: 0, revenue: 0 };
      }
      dailyData[date].hours += entry.hours || 0;
      // Calculate revenue based on project hourly rate
      const hourlyRate = entry.projects?.hourly_rate || 5000; // Default rate in cents
      dailyData[date].revenue += (entry.hours || 0) * (hourlyRate / 100);
    });

    const dailyHours = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    }));

    // For now, return empty weekly and monthly (can be implemented later)
    return {
      dailyHours,
      weeklyHours: [],
      monthlyHours: []
    };
  };

  const processClientAnalytics = (timeEntries: any[]): ClientAnalytics[] => {
    const clientData: Record<string, { hours: number; revenue: number; projectsCount: number }> = {};
    
    timeEntries.forEach(entry => {
      if (entry.projects?.clients?.name_i18n?.nl) {
        const clientName = entry.projects.clients.name_i18n.nl;
        if (!clientData[clientName]) {
          clientData[clientName] = { hours: 0, revenue: 0, projectsCount: 0 };
        }
        
        clientData[clientName].hours += entry.hours || 0;
        const hourlyRate = entry.projects?.hourly_rate || 5000;
        clientData[clientName].revenue += (entry.hours || 0) * (hourlyRate / 100);
      }
    });

    const totalRevenue = Object.values(clientData).reduce((sum, client) => sum + client.revenue, 0);
    
    return Object.entries(clientData).map(([name, data]) => ({
      name,
      ...data,
      percentage: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue);
  };

  return {
    analytics,
    timeAnalytics,
    clientAnalytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};