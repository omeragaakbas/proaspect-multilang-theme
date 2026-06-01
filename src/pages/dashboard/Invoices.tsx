import React, { useState } from 'react';
import { format } from 'date-fns';
import { nl, enUS, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Search,
  FileText,
  Download,
  Send,
  MoreHorizontal,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Euro,
  CalendarIcon,
  XCircle,
  ArrowUpRight,
  User,
  Trash2,
  CreditCard,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useInvoices, type InvoiceStatus } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const Invoices = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'tr' ? tr : i18n.language === 'en' ? enUS : nl;
  const {
    invoices,
    isLoading,
    isAdmin,
    createInvoiceWithLineItems,
    submitInvoice,
    approveInvoice,
    rejectInvoice,
    sendInvoice,
  updateInvoice,
    deleteInvoice,
    markAsPaid,
  } = useInvoices();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectingInvoiceId, setRejectingInvoiceId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<typeof invoices[0] | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<typeof invoices[0] | null>(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);
  const [editClientId, setEditClientId] = useState('');
  const [editVatRate, setEditVatRate] = useState('21');
  const [editNotes, setEditNotes] = useState('');

  const [selectedClient, setSelectedClient] = useState('');
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [vatRate, setVatRate] = useState('21');
  const [grouping, setGrouping] = useState<'day' | 'week'>('day');
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<string[]>([]);

  const approvedTimeEntries = timeEntries.filter(
    entry => entry.status === 'APPROVED' &&
    entry.project?.client &&
    selectedClient &&
    entry.project_id
  );

  const handleCreateInvoice = () => {
    if (!selectedClient) {
      toast({ title: t('common.error'), description: t('invoices.selectClientError'), variant: 'destructive' });
      return;
    }
    if (selectedTimeEntries.length === 0) {
      toast({ title: t('common.error'), description: t('invoices.selectTimeEntriesError'), variant: 'destructive' });
      return;
    }

    createInvoiceWithLineItems({
      client_id: selectedClient,
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      vat_rate: parseFloat(vatRate),
      time_entry_ids: selectedTimeEntries,
      grouping,
    });

    setShowNewInvoiceDialog(false);
    setSelectedClient('');
    setIssueDate(new Date());
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
    setVatRate('21');
    setSelectedTimeEntries([]);
  };

  const handleSubmit = (invoiceId: string) => {
    submitInvoice(invoiceId);
    toast({ title: t('invoices.submitSuccess'), description: t('invoices.submitSuccessDesc') });
  };

  const handleApprove = (invoiceId: string) => {
    approveInvoice(invoiceId);
    toast({ title: t('invoices.approveSuccess'), description: t('invoices.approveSuccessDesc') });
  };

  const handleReject = () => {
    if (rejectingInvoiceId && rejectionReason.trim()) {
      rejectInvoice({ invoiceId: rejectingInvoiceId, reason: rejectionReason });
      toast({ title: t('invoices.rejectSuccess'), description: t('invoices.rejectSuccessDesc') });
      setShowRejectDialog(false);
      setRejectingInvoiceId(null);
      setRejectionReason('');
    }
  };

  const handleSend = (invoiceId: string) => {
    sendInvoice(invoiceId);
    toast({ title: t('invoices.sendSuccess'), description: t('invoices.sendSuccessDesc') });
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT': return 'secondary';
      case 'SUBMITTED': return 'outline';
      case 'APPROVED': return 'default';
      case 'REJECTED': return 'destructive';
      case 'SENT': return 'default';
      case 'VIEWED': return 'outline';
      case 'PAID': return 'outline';
      case 'OVERDUE': return 'destructive';
      case 'CANCELLED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: InvoiceStatus) => {
    const key = status.toLowerCase();
    return t(`invoices.${key}`, status);
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT': return <Edit className="h-3 w-3" />;
      case 'SUBMITTED': return <Clock className="h-3 w-3" />;
      case 'APPROVED': return <CheckCircle className="h-3 w-3" />;
      case 'REJECTED': return <XCircle className="h-3 w-3" />;
      case 'SENT': return <Send className="h-3 w-3" />;
      case 'VIEWED': return <Eye className="h-3 w-3" />;
      case 'PAID': return <CheckCircle className="h-3 w-3" />;
      case 'OVERDUE': return <AlertCircle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  const getClientName = (nameI18n: any) => {
    if (!nameI18n || typeof nameI18n !== 'object') return '';
    const lang = i18n.language as 'nl' | 'en' | 'tr';
    return nameI18n[lang] || nameI18n.nl || nameI18n.en || nameI18n.tr || '';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const clientName = invoice.client ? getClientName(invoice.client.name_i18n) : '';
    const contractorName = invoice.contractor?.name || '';

    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = invoices.filter(i => i.status === 'SUBMITTED').length;

  const totalStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'DRAFT').length,
    submitted: invoices.filter(i => i.status === 'SUBMITTED').length,
    sent: invoices.filter(i => i.status === 'SENT').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.total_cents || 0), 0),
    paidAmount: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.total_cents || 0), 0),
    outstandingAmount: invoices.filter(i => ['SENT', 'VIEWED', 'OVERDUE'].includes(i.status)).reduce((sum, i) => sum + (i.total_cents || 0), 0)
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
                  <h1 className="text-2xl font-semibold">{t('invoices.title')}</h1>
                  <p className="text-muted-foreground">
                    {isAdmin ? t('invoices.adminDescription') : t('invoices.contractorDescription')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && pendingCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {pendingCount} {t('invoices.pendingApproval')}
                    </Badge>
                  )}
                  {!isAdmin && (
                    <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
                      <DialogTrigger asChild>
                        <Button variant="hero" className="gap-2">
                          <Plus className="h-4 w-4" />
                          {t('invoices.createInvoice')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>{t('invoices.createInvoice')}</DialogTitle>
                          <DialogDescription>
                            {t('invoices.createInvoice')}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="client">{t('invoices.client')}</Label>
                            <Select value={selectedClient} onValueChange={setSelectedClient}>
                              <SelectTrigger id="client">
                                <SelectValue placeholder={t('invoices.selectClient')} />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {getClientName(client.name_i18n)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t('invoices.issueDate')}</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !issueDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {issueDate ? format(issueDate, "PPP", { locale: dateLocale }) : <span>{t('common.selectDate')}</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={issueDate} onSelect={(date) => date && setIssueDate(date)} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="space-y-2">
                              <Label>{t('invoices.dueDate')}</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? format(dueDate, "PPP", { locale: dateLocale }) : <span>{t('common.selectDate')}</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={dueDate} onSelect={(date) => date && setDueDate(date)} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="vat">{t('invoices.vatRate')}</Label>
                              <Select value={vatRate} onValueChange={setVatRate}>
                                <SelectTrigger id="vat"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="9">9%</SelectItem>
                                  <SelectItem value="21">21%</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="grouping">{t('invoices.groupBy')}</Label>
                              <Select value={grouping} onValueChange={(v: 'day' | 'week') => setGrouping(v)}>
                                <SelectTrigger id="grouping"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="day">{t('invoices.perDay')}</SelectItem>
                                  <SelectItem value="week">{t('invoices.perWeek')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {selectedClient && (
                            <div className="space-y-2">
                              <Label>{t('invoices.approvedTimeEntries')}</Label>
                              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                                {approvedTimeEntries.length === 0 ? (
                                  <div className="p-4 text-center text-muted-foreground text-sm">
                                    {t('invoices.noApprovedTimeEntries')}
                                  </div>
                                ) : (
                                  <div className="divide-y">
                                    {approvedTimeEntries.map((entry) => {
                                      const projectName = entry.project ? getClientName(entry.project.name_i18n) : '';
                                      return (
                                        <div key={entry.id} className="p-3 flex items-start gap-3 hover:bg-muted/50">
                                          <Checkbox
                                            checked={selectedTimeEntries.includes(entry.id)}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                setSelectedTimeEntries([...selectedTimeEntries, entry.id]);
                                              } else {
                                                setSelectedTimeEntries(selectedTimeEntries.filter(id => id !== entry.id));
                                              }
                                            }}
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium">{projectName}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {format(new Date(entry.date), 'dd MMM yyyy', { locale: dateLocale })} • {entry.hours}u
                                            </div>
                                            {entry.description && (
                                              <div className="text-xs text-muted-foreground mt-1 truncate">{entry.description}</div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              {selectedTimeEntries.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  {t('invoices.timeEntriesSelected', { count: selectedTimeEntries.length })}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowNewInvoiceDialog(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={handleCreateInvoice}>
                            {t('invoices.createInvoice')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </header>

            <div className="flex-1 space-y-6 p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="DRAFT">{t('invoices.draft')}</SelectItem>
                    <SelectItem value="SUBMITTED">{t('invoices.submitted')}</SelectItem>
                    <SelectItem value="APPROVED">{t('invoices.approved')}</SelectItem>
                    <SelectItem value="REJECTED">{t('invoices.rejected')}</SelectItem>
                    <SelectItem value="SENT">{t('invoices.sent')}</SelectItem>
                    <SelectItem value="PAID">{t('invoices.paid')}</SelectItem>
                    <SelectItem value="OVERDUE">{t('invoices.overdue')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      {t('common.total')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalStats.totalAmount)}</div>
                    <p className="text-xs text-muted-foreground">{totalStats.total} {t('invoices.title').toLowerCase()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {t('invoices.paid')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalStats.paidAmount)}</div>
                    <p className="text-xs text-muted-foreground">{totalStats.paid} {t('invoices.title').toLowerCase()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {isAdmin ? t('invoices.pendingApproval') : t('invoices.sent')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {isAdmin ? totalStats.submitted : formatCurrency(totalStats.outstandingAmount)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? t('invoices.invoicesWaiting') : `${totalStats.sent + totalStats.overdue} ${t('invoices.title').toLowerCase()}`}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {t('invoices.overdue')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{totalStats.overdue}</div>
                    <p className="text-xs text-muted-foreground">{t('common.actionRequired')}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('invoices.title')}</CardTitle>
                  <CardDescription>
                    {isAdmin ? t('invoices.allInvoicesFromContractors') : t('invoices.yourInvoicesAndStatus')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredInvoices.map((invoice) => {
                      const clientName = invoice.client ? getClientName(invoice.client.name_i18n) : '';

                      return (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-lg">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{invoice.invoice_number}</div>
                              <div className="text-sm text-muted-foreground">{clientName}</div>
                              {isAdmin && invoice.contractor && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <User className="h-3 w-3" />
                                  {invoice.contractor.name}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(invoice.total_cents)}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(invoice.due_date), 'd MMM yyyy', { locale: dateLocale })}
                              </div>
                            </div>

                            <Badge variant={getStatusColor(invoice.status)} className="gap-1 min-w-[100px] justify-center">
                              {getStatusIcon(invoice.status)}
                              {getStatusText(invoice.status)}
                            </Badge>

                            {invoice.status === 'REJECTED' && invoice.rejection_reason && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">{t('invoices.rejectionReason')}</h4>
                                    <p className="text-sm text-muted-foreground">{invoice.rejection_reason}</p>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewingInvoice(invoice)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t('common.view')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const printWindow = window.open('', '_blank');
                                  if (!printWindow) return;
                                  printWindow.document.write(`
                                    <html><head><title>${invoice.invoice_number}</title>
                                    <style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px}
                                    h1{color:#333}table{width:100%;border-collapse:collapse;margin-top:20px}
                                    th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}
                                    .total{font-weight:bold;font-size:1.2em}.header{display:flex;justify-content:space-between}
                                    @media print{body{margin:0}}</style></head><body>
                                    <div class="header"><div><h1>${invoice.invoice_number}</h1>
                                    <p>${clientName}</p></div>
                                    <div><p>${t('invoices.issueDate')}: ${format(new Date(invoice.issue_date), 'd MMM yyyy', { locale: dateLocale })}</p>
                                    <p>${t('invoices.dueDate')}: ${format(new Date(invoice.due_date), 'd MMM yyyy', { locale: dateLocale })}</p></div></div>
                                    <hr/><p class="total">${t('common.total')}: ${formatCurrency(invoice.total_cents)}</p>
                                    <p>BTW ${invoice.vat_rate}%: ${formatCurrency(invoice.vat_amount_cents)}</p>
                                    <p>${t('invoices.subtotal')}: ${formatCurrency(invoice.subtotal_cents)}</p>
                                    ${invoice.notes ? `<p><strong>${t('invoices.notes')}:</strong> ${invoice.notes}</p>` : ''}
                                    </body></html>
                                  `);
                                  printWindow.document.close();
                                  printWindow.print();
                                }}>
                                  <Download className="mr-2 h-4 w-4" />
                                  {t('common.downloadPdf')}
                                </DropdownMenuItem>

                                {!isAdmin && invoice.status === 'DRAFT' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleSubmit(invoice.id)}>
                                      <ArrowUpRight className="mr-2 h-4 w-4" />
                                      {t('invoices.submit')}
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {!isAdmin && (invoice.status === 'DRAFT' || invoice.status === 'REJECTED') && (
                                  <DropdownMenuItem onClick={() => {
                                    setEditingInvoice(invoice);
                                    setEditClientId(invoice.client_id);
                                    setEditVatRate(String(invoice.vat_rate));
                                    setEditNotes(invoice.notes || '');
                                  }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                  </DropdownMenuItem>
                                )}

                                {isAdmin && invoice.status === 'SUBMITTED' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleApprove(invoice.id)}
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      {t('invoices.approve')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setRejectingInvoiceId(invoice.id);
                                        setShowRejectDialog(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      {t('invoices.reject')}
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {isAdmin && invoice.status === 'APPROVED' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleSend(invoice.id)}>
                                      <Send className="mr-2 h-4 w-4" />
                                      {t('invoices.send')}
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {isAdmin && (invoice.status === 'DRAFT' || invoice.status === 'REJECTED') && (
                                  <DropdownMenuItem onClick={() => {
                                    setEditingInvoice(invoice);
                                    setEditClientId(invoice.client_id);
                                    setEditVatRate(String(invoice.vat_rate));
                                    setEditNotes(invoice.notes || '');
                                  }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                  </DropdownMenuItem>
                                )}

                                {isAdmin && ['SENT', 'VIEWED'].includes(invoice.status) && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => markAsPaid(invoice.id)} className="text-green-600">
                                      <CreditCard className="mr-2 h-4 w-4" />
                                      {t('invoices.markAsPaid')}
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {invoice.status === 'DRAFT' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setDeletingInvoiceId(invoice.id)} className="text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t('common.delete')}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredInvoices.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t('invoices.noInvoices')}</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== 'all' ? t('common.noResults') : t('invoices.noInvoices')}
                      </p>
                      {!isAdmin && !searchTerm && statusFilter === 'all' && (
                        <Button variant="hero" onClick={() => setShowNewInvoiceDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          {t('invoices.createInvoice')}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('invoices.reject')}</DialogTitle>
            <DialogDescription>{t('invoices.rejectReason')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('invoices.rejectReasonPlaceholder')}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>{t('common.cancel')}</Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
                <XCircle className="h-4 w-4 mr-2" />
                {t('invoices.reject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingInvoice} onOpenChange={(open) => !open && setViewingInvoice(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{viewingInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>{viewingInvoice?.client ? getClientName(viewingInvoice.client.name_i18n) : ''}</DialogDescription>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">{t('invoices.status')}</div>
                  <Badge variant={getStatusColor(viewingInvoice.status)} className="gap-1 mt-1">
                    {getStatusIcon(viewingInvoice.status)}
                    {getStatusText(viewingInvoice.status)}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('common.total')}</div>
                  <div className="text-xl font-bold">{formatCurrency(viewingInvoice.total_cents)}</div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">{t('invoices.issueDate')}</div>
                  <div>{format(new Date(viewingInvoice.issue_date), 'd MMM yyyy', { locale: dateLocale })}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t('invoices.dueDate')}</div>
                  <div>{format(new Date(viewingInvoice.due_date), 'd MMM yyyy', { locale: dateLocale })}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t('invoices.subtotal')}</div>
                  <div>{formatCurrency(viewingInvoice.subtotal_cents)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">BTW ({viewingInvoice.vat_rate}%)</div>
                  <div>{formatCurrency(viewingInvoice.vat_amount_cents)}</div>
                </div>
              </div>
              {viewingInvoice.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('invoices.notes')}</div>
                    <p className="text-sm">{viewingInvoice.notes}</p>
                  </div>
                </>
              )}
              {viewingInvoice.rejection_reason && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('invoices.rejectionReason')}</div>
                    <p className="text-sm text-destructive">{viewingInvoice.rejection_reason}</p>
                  </div>
                </>
              )}
              {viewingInvoice.contractor && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <div className="text-muted-foreground">{t('invoices.contractor')}</div>
                    <div>{viewingInvoice.contractor.name} ({viewingInvoice.contractor.email})</div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('invoices.editInvoice')}</DialogTitle>
            <DialogDescription>{editingInvoice?.invoice_number}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('invoices.client')}</Label>
              <Select value={editClientId} onValueChange={setEditClientId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{getClientName(client.name_i18n)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('invoices.vatRate')}</Label>
              <Select value={editVatRate} onValueChange={setEditVatRate}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="9">9%</SelectItem>
                  <SelectItem value="21">21%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('invoices.notes')}</Label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInvoice(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              if (!editingInvoice) return;
              updateInvoice({
                id: editingInvoice.id,
                client_id: editClientId,
                vat_rate: parseFloat(editVatRate),
                notes: editNotes,
              });
              setEditingInvoice(null);
            }}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingInvoiceId} onOpenChange={(open) => !open && setDeletingInvoiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('invoices.deleteInvoice')}</AlertDialogTitle>
            <AlertDialogDescription>{t('invoices.deleteInvoiceConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deletingInvoiceId) {
                deleteInvoice(deletingInvoiceId);
                setDeletingInvoiceId(null);
              }
            }}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Invoices;
