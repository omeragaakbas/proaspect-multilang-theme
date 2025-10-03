import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useRecurringInvoices } from '@/hooks/useRecurringInvoices';
import { useClients } from '@/hooks/useClients';
import { useInvoiceTemplates } from '@/hooks/useInvoiceTemplates';
import { Plus, RefreshCw, Pause, Play, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const RecurringInvoices = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { recurringInvoices, createRecurring, updateRecurring, deleteRecurring } = useRecurringInvoices();
  const { clients } = useClients();
  const { templates } = useInvoiceTemplates();

  const form = useForm({
    defaultValues: {
      client_id: '',
      template_id: '',
      frequency: 'MONTHLY',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      payment_terms: '14 dagen',
      vat_rate: '21.00',
      notes: '',
    },
  });

  const onSubmit = (data: any) => {
    const nextInvoiceDate = data.start_date;
    createRecurring({
      ...data,
      next_invoice_date: nextInvoiceDate,
      vat_rate: parseFloat(data.vat_rate),
      end_date: data.end_date || null,
    });
    setIsDialogOpen(false);
    form.reset();
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateRecurring({ id, updates: { is_active: !isActive } });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: any = {
      'WEEKLY': 'Wekelijks',
      'MONTHLY': 'Maandelijks',
      'QUARTERLY': 'Per kwartaal',
      'YEARLY': 'Jaarlijks',
    };
    return labels[frequency] || frequency;
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
                  <h1 className="text-2xl font-semibold">Terugkerende Facturen</h1>
                  <p className="text-muted-foreground">
                    Beheer automatische facturatie
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nieuwe Terugkerende Factuur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Terugkerende Factuur Aanmaken</DialogTitle>
                      <DialogDescription>
                        Stel een automatische facturatie in voor regelmatige klanten
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="client_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Klant</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecteer klant" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                      {client.name_i18n.nl || client.name_i18n.en}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="template_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Template (optioneel)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecteer template" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequentie</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="WEEKLY">Wekelijks</SelectItem>
                                  <SelectItem value="MONTHLY">Maandelijks</SelectItem>
                                  <SelectItem value="QUARTERLY">Per kwartaal</SelectItem>
                                  <SelectItem value="YEARLY">Jaarlijks</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Startdatum</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="end_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Einddatum (optioneel)</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="payment_terms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Betaaltermijn</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="14 dagen" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="vat_rate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>BTW %</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opmerkingen</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Annuleren
                          </Button>
                          <Button type="submit">Aanmaken</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Actieve Terugkerende Facturen
                  </CardTitle>
                  <CardDescription>
                    Automatische facturatie voor regelmatige diensten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Klant</TableHead>
                        <TableHead>Frequentie</TableHead>
                        <TableHead>Volgende Factuur</TableHead>
                        <TableHead>Laatste Gegenereerd</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recurringInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            Geen terugkerende facturen gevonden
                          </TableCell>
                        </TableRow>
                      ) : (
                        recurringInvoices.map((recurring: any) => (
                          <TableRow key={recurring.id}>
                            <TableCell className="font-medium">
                              {recurring.client?.name_i18n?.nl || recurring.client?.name_i18n?.en || 'Onbekend'}
                            </TableCell>
                            <TableCell>{getFrequencyLabel(recurring.frequency)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(recurring.next_invoice_date), 'dd MMM yyyy', { locale: nl })}
                              </div>
                            </TableCell>
                            <TableCell>
                              {recurring.last_generated_at 
                                ? format(new Date(recurring.last_generated_at), 'dd MMM yyyy', { locale: nl })
                                : 'Nog niet gegenereerd'
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant={recurring.is_active ? 'default' : 'secondary'}>
                                {recurring.is_active ? 'Actief' : 'Gepauzeerd'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleActive(recurring.id, recurring.is_active)}
                                >
                                  {recurring.is_active ? (
                                    <><Pause className="h-4 w-4" /></>
                                  ) : (
                                    <><Play className="h-4 w-4" /></>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteRecurring(recurring.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default RecurringInvoices;