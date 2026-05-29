import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Mail, Euro, FileText, Clock } from 'lucide-react';

interface ContractorData {
  user_id: string;
  company_name: string;
  kvk: string | null;
  vat_number: string | null;
  default_hourly_rate: number;
  profile: {
    name: string;
    email: string;
  } | null;
  invoiceCount: number;
  pendingCount: number;
}

const Contractors = () => {
  const { t } = useTranslation();

  const { data: contractors = [], isLoading } = useQuery({
    queryKey: ['admin_contractors'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('contractor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: userProfiles, error: upError } = await supabase
        .from('profiles')
        .select('user_id, name, email');

      if (upError) throw upError;

      const profileMap: Record<string, { name: string; email: string }> = {};
      for (const p of userProfiles) {
        profileMap[p.user_id] = { name: p.name, email: p.email };
      }

      const { data: invoices, error: invError } = await supabase
        .from('invoices')
        .select('contractor_id, status');

      if (invError) throw invError;

      const invoiceCounts: Record<string, { total: number; pending: number }> = {};
      for (const inv of invoices) {
        if (!invoiceCounts[inv.contractor_id]) {
          invoiceCounts[inv.contractor_id] = { total: 0, pending: 0 };
        }
        invoiceCounts[inv.contractor_id].total++;
        if (inv.status === 'SUBMITTED') {
          invoiceCounts[inv.contractor_id].pending++;
        }
      }

      return profiles.map(cp => ({
        user_id: cp.user_id,
        company_name: cp.company_name,
        kvk: cp.kvk,
        vat_number: cp.vat_number,
        default_hourly_rate: cp.default_hourly_rate,
        profile: profileMap[cp.user_id] || null,
        invoiceCount: invoiceCounts[cp.user_id]?.total || 0,
        pendingCount: invoiceCounts[cp.user_id]?.pending || 0,
      })) as ContractorData[];
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  return (
    <DashboardLayout>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />

          <main className="flex-1">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold">{t('nav.contractors')}</h1>
                  <p className="text-muted-foreground">
                    {t('contractors.subtitle')}
                  </p>
                </div>
                <Badge variant="outline">{contractors.length} {t('nav.contractors')}</Badge>
              </div>
            </header>

            <div className="flex-1 space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('contractors.totalContractors')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contractors.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('contractors.totalInvoices')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {contractors.reduce((sum, c) => sum + c.invoiceCount, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('contractors.pendingApproval')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {contractors.reduce((sum, c) => sum + c.pendingCount, 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('nav.contractors')}</CardTitle>
                  <CardDescription>{t('contractors.allContractorsAndStatus')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contractors.map((contractor) => (
                      <div key={contractor.user_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{contractor.profile?.name || t('common.unknown')}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {contractor.company_name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contractor.profile?.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Euro className="h-3 w-3" />
                              {t('contractors.hourlyRate')}
                            </div>
                            <div className="font-medium">{formatCurrency(contractor.default_hourly_rate)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {t('contractors.invoices')}
                            </div>
                            <div className="font-medium">{contractor.invoiceCount}</div>
                          </div>
                          {contractor.pendingCount > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {contractor.pendingCount} {t('approvals.pending')}
                            </Badge>
                          )}
                          {contractor.kvk && (
                            <Badge variant="outline" className="text-xs">
                              KvK: {contractor.kvk}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}

                    {contractors.length === 0 && (
                      <div className="text-center py-12">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">{t('contractors.noContractors')}</h3>
                        <p className="text-muted-foreground">
                          {t('contractors.inviteContractors')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Contractors;
