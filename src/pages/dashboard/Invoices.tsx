import React, { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  CalendarIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

const Invoices = () => {
  const { invoices, isLoading, createInvoiceWithLineItems } = useInvoices();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  
  // Form state
  const [selectedClient, setSelectedClient] = useState('');
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [vatRate, setVatRate] = useState('21');
  const [grouping, setGrouping] = useState<'day' | 'week'>('day');
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<string[]>([]);

  // Get approved time entries for selected client
  const approvedTimeEntries = timeEntries.filter(
    entry => entry.status === 'APPROVED' && 
    entry.project?.client && 
    selectedClient && 
    entry.project_id // We'll need to check client via project
  );

  const handleCreateInvoice = () => {
    if (!selectedClient) {
      toast({
        title: 'Validatiefout',
        description: 'Selecteer een klant',
        variant: 'destructive',
      });
      return;
    }

    if (selectedTimeEntries.length === 0) {
      toast({
        title: 'Validatiefout',
        description: 'Selecteer minimaal één tijdsregistratie',
        variant: 'destructive',
      });
      return;
    }

    createInvoiceWithLineItems({
      client_id: selectedClient,
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      vat_rate: parseFloat(vatRate),
      time_entry_ids: selectedTimeEntries,
      grouping: grouping,
    });

    // Reset form
    setShowNewInvoiceDialog(false);
    setSelectedClient('');
    setIssueDate(new Date());
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
    setVatRate('21');
    setSelectedTimeEntries([]);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT': return 'secondary';
      case 'SENT': return 'default';
      case 'VIEWED': return 'outline';
      case 'PAID': return 'outline';
      case 'OVERDUE': return 'destructive';
      case 'CANCELLED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT': return 'Concept';
      case 'SENT': return 'Verzonden';
      case 'VIEWED': return 'Bekeken';
      case 'PAID': return 'Betaald';
      case 'OVERDUE': return 'Vervallen';
      case 'CANCELLED': return 'Geannuleerd';
      default: return 'Onbekend';
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'DRAFT': return <Edit className="h-3 w-3" />;
      case 'SENT': return <Send className="h-3 w-3" />;
      case 'VIEWED': return <Eye className="h-3 w-3" />;
      case 'PAID': return <CheckCircle className="h-3 w-3" />;
      case 'OVERDUE': return <AlertCircle className="h-3 w-3" />;
      case 'CANCELLED': return <Clock className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  const filteredInvoices = invoices.filter(invoice => {
    // Get client name from client object
    const clientName = invoice.client && typeof invoice.client.name_i18n === 'object'
      ? invoice.client.name_i18n.nl || invoice.client.name_i18n.en || invoice.client.name_i18n.tr
      : '';
    
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'DRAFT').length,
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
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold">Facturen</h1>
                  <p className="text-muted-foreground">
                    Beheer en verstuur je facturen
                  </p>
                </div>
                <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nieuwe factuur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Nieuwe factuur maken</DialogTitle>
                      <DialogDescription>
                        Maak een nieuwe factuur concept aan
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="client">Klant</Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                          <SelectTrigger id="client">
                            <SelectValue placeholder="Selecteer een klant" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => {
                              const clientName = typeof client.name_i18n === 'object'
                                ? client.name_i18n.nl || client.name_i18n.en || client.name_i18n.tr
                                : String(client.name_i18n || '');
                              
                              return (
                                <SelectItem key={client.id} value={client.id}>
                                  {clientName}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Factuurdatum</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !issueDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {issueDate ? format(issueDate, "PPP", { locale: nl }) : <span>Selecteer datum</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={issueDate}
                                onSelect={(date) => date && setIssueDate(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>Vervaldatum</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dueDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dueDate ? format(dueDate, "PPP", { locale: nl }) : <span>Selecteer datum</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={dueDate}
                                onSelect={(date) => date && setDueDate(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vat">BTW percentage</Label>
                          <Select value={vatRate} onValueChange={setVatRate}>
                            <SelectTrigger id="vat">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="9">9%</SelectItem>
                              <SelectItem value="21">21%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grouping">Groeperen op</Label>
                          <Select value={grouping} onValueChange={(v: 'day' | 'week') => setGrouping(v)}>
                            <SelectTrigger id="grouping">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Per dag</SelectItem>
                              <SelectItem value="week">Per week</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {selectedClient && (
                        <div className="space-y-2">
                          <Label>Goedgekeurde tijdsregistraties</Label>
                          <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                            {approvedTimeEntries.length === 0 ? (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                Geen goedgekeurde tijdsregistraties voor deze klant
                              </div>
                            ) : (
                              <div className="divide-y">
                                {approvedTimeEntries.map((entry) => {
                                  const projectName = entry.project && typeof entry.project.name_i18n === 'object'
                                    ? entry.project.name_i18n.nl || entry.project.name_i18n.en || entry.project.name_i18n.tr
                                    : '';
                                  
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
                                          {format(new Date(entry.date), 'dd MMM yyyy', { locale: nl })} • {entry.hours}u
                                        </div>
                                        {entry.description && (
                                          <div className="text-xs text-muted-foreground mt-1 truncate">
                                            {entry.description}
                                          </div>
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
                              {selectedTimeEntries.length} tijdsregistratie(s) geselecteerd
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewInvoiceDialog(false)}>
                        Annuleren
                      </Button>
                      <Button onClick={handleCreateInvoice}>
                        Factuur aanmaken
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 space-y-6 p-6">
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek facturen..."
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
                    <SelectItem value="all">Alle statussen</SelectItem>
                    <SelectItem value="DRAFT">Concept</SelectItem>
                    <SelectItem value="SENT">Verzonden</SelectItem>
                    <SelectItem value="VIEWED">Bekeken</SelectItem>
                    <SelectItem value="PAID">Betaald</SelectItem>
                    <SelectItem value="OVERDUE">Vervallen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      Totaal omzet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalStats.totalAmount)}</div>
                    <p className="text-xs text-muted-foreground">{totalStats.total} facturen</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Betaald
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalStats.paidAmount)}</div>
                    <p className="text-xs text-muted-foreground">{totalStats.paid} facturen</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Openstaand
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalStats.outstandingAmount)}</div>
                    <p className="text-xs text-muted-foreground">{totalStats.sent + totalStats.overdue} facturen</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Vervallen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{totalStats.overdue}</div>
                    <p className="text-xs text-muted-foreground">Actie vereist</p>
                  </CardContent>
                </Card>
              </div>

              {/* Invoices List */}
              <Card>
                <CardHeader>
                  <CardTitle>Factuuroverzicht</CardTitle>
                  <CardDescription>
                    Alle facturen en hun status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredInvoices.map((invoice) => {
                      const clientName = invoice.client && typeof invoice.client.name_i18n === 'object'
                        ? invoice.client.name_i18n.nl || invoice.client.name_i18n.en || invoice.client.name_i18n.tr
                        : '';
                      
                      return (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-lg">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{invoice.invoice_number}</div>
                              <div className="text-sm text-muted-foreground">{clientName}</div>
                            </div>
                          </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(invoice.total_cents)}</div>
                            <div className="text-sm text-muted-foreground">
                              Vervaldatum: {format(new Date(invoice.due_date), 'd MMM yyyy', { locale: nl })}
                            </div>
                          </div>
                          
                          <Badge variant={getStatusColor(invoice.status)} className="gap-1">
                            {getStatusIcon(invoice.status)}
                            {getStatusText(invoice.status)}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Bekijken
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Bewerken
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                PDF downloaden
                              </DropdownMenuItem>
                              {invoice.status === 'DRAFT' && (
                                <DropdownMenuItem>
                                  <Send className="mr-2 h-4 w-4" />
                                  Versturen
                                </DropdownMenuItem>
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
                      <h3 className="text-lg font-medium mb-2">Geen facturen gevonden</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== 'all' ? 'Probeer je zoekopdracht aan te passen' : 'Begin door je eerste factuur te maken'}
                      </p>
                      {!searchTerm && statusFilter === 'all' && (
                        <Button variant="hero" onClick={() => setShowNewInvoiceDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Eerste factuur maken
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
    </DashboardLayout>
  );
};

export default Invoices;