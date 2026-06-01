import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { useInvoices } from '@/hooks/useInvoices';
import {
  Clock,
  Euro,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  ArrowUpRight,
  Loader2,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  User
} from 'lucide-react';

function AdminDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { invoices, approveInvoice, rejectInvoice, sendInvoice } = useInvoices();
  const [rejectingInvoiceId, setRejectingInvoiceId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { analytics, loading } = useAnalytics();

  const submittedInvoices = invoices.filter(i => i.status === 'SUBMITTED');
  const approvedInvoices = invoices.filter(i => i.status === 'APPROVED');
  const recentInvoices = invoices.slice(0, 10);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  const getClientName = (nameI18n: any) => {
    if (!nameI18n || typeof nameI18n !== 'object') return '';
    const lang = i18n.language as 'nl' | 'en' | 'tr';
    return nameI18n[lang] || nameI18n.nl || nameI18n.en || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.adminTitle')}</h1>
          <p className="text-muted-foreground">{t('dashboard.adminSubtitle')}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.pendingApproval')}</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{submittedInvoices.length}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.submittedInvoices')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.readyToSend')}</CardTitle>
              <Send className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedInvoices.length}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.approvedInvoices')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalRevenue')}</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(analytics.totalRevenue) : '€0'}
              </div>
              <p className="text-xs text-muted-foreground">{t('dashboard.allContractors')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalInvoices')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">
                {invoices.filter(i => i.status === 'PAID').length} {t('dashboard.paid')}
              </p>
            </CardContent>
          </Card>
        </div>

        {submittedInvoices.length > 0 && (
          <Card className="mb-8 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                {t('dashboard.invoicesForApproval')} ({submittedInvoices.length})
              </CardTitle>
              <CardDescription>{t('dashboard.invoicesForApprovalDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {submittedInvoices.map((invoice) => {
                  const clientName = invoice.client ? getClientName(invoice.client.name_i18n) : '';

                  return (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg bg-amber-50/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <FileText className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium">{invoice.invoice_number}</div>
                          <div className="text-sm text-muted-foreground">{clientName}</div>
                          {invoice.contractor && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <User className="h-3 w-3" />
                              {invoice.contractor.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                          <div className="font-semibold">{formatCurrency(invoice.total_cents)}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => approveInvoice(invoice.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('invoices.approve')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            setRejectingInvoiceId(invoice.id);
                            setRejectionReason('');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t('invoices.reject')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {approvedInvoices.length > 0 && (
          <Card className="mb-8 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                {t('dashboard.readyToSend')} ({approvedInvoices.length})
              </CardTitle>
              <CardDescription>{t('dashboard.readyToSendDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedInvoices.map((invoice) => {
                  const clientName = invoice.client ? getClientName(invoice.client.name_i18n) : '';

                  return (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{invoice.invoice_number}</div>
                          <div className="text-sm text-muted-foreground">{clientName}</div>
                          {invoice.contractor && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <User className="h-3 w-3" />
                              {invoice.contractor.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                          <div className="font-semibold">{formatCurrency(invoice.total_cents)}</div>
                        </div>
                        <Button size="sm" onClick={() => sendInvoice(invoice.id)}>
                          <Send className="h-4 w-4 mr-1" />
                          {t('invoices.send')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('dashboard.recentInvoices')}
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/invoices')}>
                {t('common.viewAll')}
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.map((invoice) => {
                const clientName = invoice.client ? getClientName(invoice.client.name_i18n) : '';

                return (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{invoice.invoice_number}</div>
                        <div className="text-sm text-muted-foreground">{clientName}</div>
                        {invoice.contractor && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {invoice.contractor.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(invoice.total_cents)}</div>
                      <Badge variant={invoice.status === 'PAID' ? 'outline' : invoice.status === 'SUBMITTED' ? 'default' : 'secondary'} className="text-xs">
                        {t(`invoices.${invoice.status.toLowerCase()}`, invoice.status)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {recentInvoices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('dashboard.noInvoicesYet')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!rejectingInvoiceId} onOpenChange={(open) => { if (!open) setRejectingInvoiceId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('invoices.reject')}</DialogTitle>
            <DialogDescription>{t('invoices.rejectDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('invoices.rejectionReason')}</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('invoices.rejectionReasonPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingInvoiceId(null)}>{t('common.cancel')}</Button>
            <Button
              variant="destructive"
              disabled={!rejectionReason.trim()}
              onClick={() => {
                if (rejectingInvoiceId && rejectionReason.trim()) {
                  rejectInvoice({ invoiceId: rejectingInvoiceId, reason: rejectionReason.trim() });
                  setRejectingInvoiceId(null);
                  setRejectionReason('');
                }
              }}
            >
              {t('invoices.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContractorDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { analytics, timeAnalytics, loading } = useAnalytics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}u ${m}m` : `${h}u`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.welcomeBack')}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button variant="hero" className="h-auto p-4" size="lg" onClick={() => navigate('/dashboard/time')}>
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{t('dashboard.newTimeEntry')}</div>
              </div>
            </div>
          </Button>

          <Button variant="outline" className="h-auto p-4" size="lg" onClick={() => navigate('/dashboard/invoices')}>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{t('dashboard.newInvoice')}</div>
              </div>
            </div>
          </Button>

          <Button variant="outline" className="h-auto p-4" size="lg" onClick={() => navigate('/dashboard/clients')}>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{t('dashboard.newClient')}</div>
              </div>
            </div>
          </Button>

          <Button variant="outline" className="h-auto p-4" size="lg" onClick={() => navigate('/dashboard/reports')}>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{t('reports.title')}</div>
              </div>
            </div>
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalHours')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics ? formatHours(analytics.totalHours) : '0u'}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</p>
              <Progress value={analytics ? Math.min((analytics.totalHours / 160) * 100, 100) : 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalRevenue')}</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics ? formatCurrency(analytics.totalRevenue) : '€0'}</div>
              <p className="text-xs text-success">{analytics ? formatCurrency(analytics.averageHourlyRate) : '€0'}{t('common.perHour')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.openInvoices')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics ? analytics.totalInvoices - analytics.paidInvoices : 0}</div>
              <p className="text-xs text-warning">{analytics ? formatCurrency(analytics.outstandingAmount) : '€0'} {t('common.total').toLowerCase()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('invoices.paid')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics ? analytics.paidInvoices : 0}</div>
              <p className="text-xs text-muted-foreground">{t('common.of')} {analytics ? analytics.totalInvoices : 0} {t('common.total').toLowerCase()}</p>
            </CardContent>
          </Card>
        </div>

        {timeAnalytics && timeAnalytics.dailyHours.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.totalHours')}</CardTitle>
                <CardDescription>{t('dashboard.thisMonth')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ hours: { label: t('time.hours'), color: "hsl(var(--primary))" } }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeAnalytics.dailyHours}>
                      <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.totalRevenue')}</CardTitle>
                <CardDescription>{t('dashboard.thisMonth')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ revenue: { label: t('reports.revenue'), color: "hsl(var(--success))" } }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeAnalytics.dailyHours}>
                      <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

const Dashboard = () => {
  const { userRole } = useAuth();
  const isAdmin = userRole?.role === 'ADMIN';

  return isAdmin ? <AdminDashboard /> : <ContractorDashboard />;
};

export default Dashboard;
