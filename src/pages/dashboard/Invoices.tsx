import React, { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
  Euro
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  total_cents: number;
  sent_at?: string;
  paid_at?: string;
}

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);

  // Mock data - will be replaced with real data from Supabase
  const invoices: Invoice[] = [
    {
      id: '1',
      invoice_number: 'INV-2024-001',
      client_name: 'ACME Corporation',
      status: 'PAID',
      issue_date: '2024-01-15',
      due_date: '2024-01-29',
      total_cents: 125000, // €1,250
      sent_at: '2024-01-15T10:00:00Z',
      paid_at: '2024-01-25T14:30:00Z'
    },
    {
      id: '2',
      invoice_number: 'INV-2024-002',
      client_name: 'TechStart BV',
      status: 'SENT',
      issue_date: '2024-01-20',
      due_date: '2024-02-03',
      total_cents: 89000, // €890
      sent_at: '2024-01-20T09:15:00Z'
    },
    {
      id: '3',
      invoice_number: 'INV-2024-003',
      client_name: 'Digital Solutions',
      status: 'OVERDUE',
      issue_date: '2024-01-10',
      due_date: '2024-01-24',
      total_cents: 156500, // €1,565
      sent_at: '2024-01-10T11:45:00Z'
    },
    {
      id: '4',
      invoice_number: 'INV-2024-004',
      client_name: 'StartupXYZ',
      status: 'DRAFT',
      issue_date: '2024-01-25',
      due_date: '2024-02-08',
      total_cents: 75000 // €750
    }
  ];

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
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'DRAFT').length,
    sent: invoices.filter(i => i.status === 'SENT').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total_cents, 0),
    paidAmount: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total_cents, 0),
    outstandingAmount: invoices.filter(i => ['SENT', 'VIEWED', 'OVERDUE'].includes(i.status)).reduce((sum, i) => sum + i.total_cents, 0)
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
                        Maak een nieuwe factuur van goedgekeurde tijdsregistraties
                      </DialogDescription>
                    </DialogHeader>
                    {/* Invoice creation form will go here */}
                    <div className="text-center py-8 text-muted-foreground">
                      Factuurformulier komt hier...
                    </div>
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
                    {filteredInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-muted rounded-lg">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{invoice.invoice_number}</div>
                            <div className="text-sm text-muted-foreground">{invoice.client_name}</div>
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
                    ))}
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