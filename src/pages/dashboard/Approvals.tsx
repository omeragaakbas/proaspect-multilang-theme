import React, { useState } from 'react';
import { format } from 'date-fns';
import { nl, enUS, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Euro,
  Send
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useInvoices } from '@/hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';

const Approvals = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'tr' ? tr : i18n.language === 'en' ? enUS : nl;
  const { timeEntries, isLoading: timeLoading, updateTimeEntry } = useTimeEntries();
  const { invoices, isLoading: invoiceLoading, approveInvoice, rejectInvoice, sendInvoice } = useInvoices();
  const { toast } = useToast();

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectType, setRejectType] = useState<'time' | 'invoice'>('time');
  const [rejectId, setRejectId] = useState<string | null>(null);

  const pendingTimeEntries = timeEntries.filter(s => s.status === 'SUBMITTED');
  const processedTimeEntries = timeEntries.filter(s => ['APPROVED', 'REJECTED'].includes(s.status));

  const pendingInvoices = invoices.filter(i => i.status === 'SUBMITTED');
  const approvedInvoices = invoices.filter(i => i.status === 'APPROVED');

  const totalPending = pendingTimeEntries.length + pendingInvoices.length;

  const handleApproveTime = (entryId: string) => {
    updateTimeEntry({ id: entryId, status: 'APPROVED' });
    toast({ title: t('time.approve'), description: t('approvals.timeApproved') });
  };

  const handleApproveInvoice = (invoiceId: string) => {
    approveInvoice(invoiceId);
    toast({ title: t('invoices.approveSuccess'), description: t('invoices.approveSuccessDesc') });
  };

  const handleSendInvoice = (invoiceId: string) => {
    sendInvoice(invoiceId);
    toast({ title: t('invoices.sendSuccess'), description: t('invoices.sendSuccessDesc') });
  };

  const openRejectDialog = (type: 'time' | 'invoice', id: string) => {
    setRejectType(type);
    setRejectId(id);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectId || !rejectionReason.trim()) return;

    if (rejectType === 'time') {
      updateTimeEntry({ id: rejectId, status: 'REJECTED', rejection_reason: rejectionReason });
      toast({ title: t('time.reject'), description: t('approvals.timeRejected') });
    } else {
      rejectInvoice({ invoiceId: rejectId, reason: rejectionReason });
      toast({ title: t('invoices.rejectSuccess'), description: t('invoices.rejectSuccessDesc') });
    }

    setShowRejectDialog(false);
    setRejectId(null);
    setRejectionReason('');
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}u ${m}m` : `${h}u`;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  const getClientName = (nameI18n: any) => {
    if (!nameI18n || typeof nameI18n !== 'object') return '';
    const lang = i18n.language as 'nl' | 'en' | 'tr';
    return nameI18n[lang] || nameI18n.nl || nameI18n.en || '';
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
                  <h1 className="text-2xl font-semibold">{t('nav.approvals')}</h1>
                  <p className="text-muted-foreground">
                    {t('approvals.subtitle')}
                  </p>
                </div>
                {totalPending > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {totalPending} {t('approvals.pending')}
                  </Badge>
                )}
              </div>
            </header>

            <div className="flex-1 space-y-6 p-6">
              {totalPending > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t('approvals.pendingAlert', { invoices: pendingInvoices.length, timeEntries: pendingTimeEntries.length })}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="invoices">
                <TabsList>
                  <TabsTrigger value="invoices" className="gap-2">
                    <FileText className="h-4 w-4" />
                    {t('approvals.invoicesTab')}
                    {pendingInvoices.length > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">{pendingInvoices.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="time" className="gap-2">
                    <Clock className="h-4 w-4" />
                    {t('approvals.timeTab')}
                    {pendingTimeEntries.length > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">{pendingTimeEntries.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="invoices" className="space-y-6">
                  {pendingInvoices.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-amber-500" />
                          {t('approvals.invoicesForApproval')} ({pendingInvoices.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {pendingInvoices.map((invoice) => {
                          const clientName = invoice.client ? getClientName(invoice.client.name_i18n) : '';

                          return (
                            <div key={invoice.id} className="border rounded-lg p-4 space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-amber-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-amber-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{invoice.invoice_number}</div>
                                    <div className="text-sm text-muted-foreground">{clientName}</div>
                                    {invoice.contractor && (
                                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <User className="h-3 w-3" />
                                        {invoice.contractor.name} ({invoice.contractor.email})
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">{formatCurrency(invoice.total_cents)}</div>
                                  <Badge variant="outline" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    {t('approvals.pending')}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="font-medium text-muted-foreground">{t('invoices.issueDate')}</div>
                                  <div>{format(new Date(invoice.issue_date), 'dd MMM yyyy', { locale: dateLocale })}</div>
                                </div>
                                <div>
                                  <div className="font-medium text-muted-foreground">{t('invoices.dueDate')}</div>
                                  <div>{format(new Date(invoice.due_date), 'dd MMM yyyy', { locale: dateLocale })}</div>
                                </div>
                                <div>
                                  <div className="font-medium text-muted-foreground">{t('invoices.vatRate')}</div>
                                  <div>{invoice.vat_rate}%</div>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleApproveInvoice(invoice.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {t('invoices.approve')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => openRejectDialog('invoice', invoice.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {t('invoices.reject')}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {approvedInvoices.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          {t('approvals.readyToSend')} ({approvedInvoices.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {approvedInvoices.map((invoice) => {
                          const clientName = invoice.client ? getClientName(invoice.client.name_i18n) : '';

                          return (
                            <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{invoice.invoice_number} - {clientName}</div>
                                  {invoice.contractor && (
                                    <div className="text-xs text-muted-foreground">{invoice.contractor.name}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="font-semibold">{formatCurrency(invoice.total_cents)}</div>
                                <Button size="sm" onClick={() => handleSendInvoice(invoice.id)}>
                                  <Send className="h-4 w-4 mr-1" />
                                  {t('invoices.send')}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {pendingInvoices.length === 0 && approvedInvoices.length === 0 && (
                    <Card>
                      <CardContent className="py-12">
                        <div className="text-center">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">{t('approvals.noOpenInvoices')}</h3>
                          <p className="text-muted-foreground">{t('approvals.allReviewedAndSent')}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="time" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t('approvals.pendingTimeEntries')} ({pendingTimeEntries.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pendingTimeEntries.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">{t('approvals.noPendingSubmissions')}</h3>
                          <p className="text-muted-foreground">{t('approvals.allTimeEntriesReviewed')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {pendingTimeEntries.map((submission) => {
                            const projectName = submission.project && typeof submission.project.name_i18n === 'object'
                              ? getClientName(submission.project.name_i18n)
                              : '';
                            const clientName = submission.project?.client && typeof submission.project.client.name_i18n === 'object'
                              ? getClientName(submission.project.client.name_i18n)
                              : '';

                            return (
                              <div key={submission.id} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                      <User className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{projectName}</div>
                                      <div className="text-sm text-muted-foreground">{clientName}</div>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    {t('approvals.pending')}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <div className="font-medium text-muted-foreground">{t('time.date')}</div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(submission.date), 'dd MMM yyyy', { locale: dateLocale })}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-muted-foreground">{t('time.hours')}</div>
                                    <div className="font-semibold">{formatDuration(Number(submission.hours))}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-muted-foreground">{t('time.submitted')}</div>
                                    <div>{submission.submitted_at ? format(new Date(submission.submitted_at), 'dd MMM', { locale: dateLocale }) : '-'}</div>
                                  </div>
                                </div>

                                {submission.description && (
                                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{submission.description}</p>
                                )}

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => handleApproveTime(submission.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {t('time.approve')}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => openRejectDialog('time', submission.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    {t('time.reject')}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {processedTimeEntries.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('approvals.recentlyReviewed')} ({processedTimeEntries.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {processedTimeEntries.slice(0, 10).map((submission) => {
                            const projectName = submission.project && typeof submission.project.name_i18n === 'object'
                              ? getClientName(submission.project.name_i18n)
                              : '';

                            return (
                              <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${submission.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {submission.status === 'APPROVED' ?
                                      <CheckCircle className="h-4 w-4 text-green-600" /> :
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    }
                                  </div>
                                  <div>
                                    <div className="font-medium">{projectName}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDuration(Number(submission.hours))} • {format(new Date(submission.date), 'dd MMM', { locale: dateLocale })}
                                    </div>
                                  </div>
                                </div>
                                <Badge variant={submission.status === 'APPROVED' ? 'outline' : 'destructive'}>
                                  {submission.status === 'APPROVED' ? t('time.approved') : t('time.rejected')}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </SidebarProvider>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('approvals.rejectDialogTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('approvals.rejectDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('invoices.rejectReasonPlaceholder')}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('time.reject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Approvals;
