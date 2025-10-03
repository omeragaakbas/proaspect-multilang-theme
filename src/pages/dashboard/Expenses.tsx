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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Receipt, CalendarIcon, Euro, TrendingDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExpenses } from '@/hooks/useExpenses';
import { useProjects } from '@/hooks/useProjects';

const EXPENSE_CATEGORIES = [
  'Reiskosten',
  'Materialen',
  'Software',
  'Kantoorbenodigdheden',
  'Marketing',
  'Opleiding',
  'Overig'
];

const Expenses = () => {
  const { expenses, createExpense, isLoading } = useExpenses();
  const { projects } = useProjects();
  const [showNewExpenseDialog, setShowNewExpenseDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [vatDeductible, setVatDeductible] = useState(true);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount_cents, 0);
  const totalVat = expenses.reduce((sum, exp) => sum + (exp.vat_amount_cents || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createExpense({
      project_id: projectId || undefined,
      date: selectedDate,
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      vat_deductible: vatDeductible,
    });

    setShowNewExpenseDialog(false);
    setAmount('');
    setCategory('');
    setProjectId('');
    setDescription('');
    setVatDeductible(true);
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
                  <h1 className="text-2xl font-semibold">Onkosten</h1>
                  <p className="text-muted-foreground">
                    Registreer en beheer je zakelijke uitgaven
                  </p>
                </div>
                <Dialog open={showNewExpenseDialog} onOpenChange={setShowNewExpenseDialog}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nieuwe onkosten
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Onkosten toevoegen</DialogTitle>
                      <DialogDescription>
                        Registreer een nieuwe zakelijke uitgave
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Datum</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP", { locale: nl }) : <span>Selecteer datum</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => date && setSelectedDate(date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Bedrag (€) *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="125.00"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Categorie *</Label>
                        <Select value={category} onValueChange={setCategory} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer categorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project">Project (optioneel)</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name_i18n.nl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Beschrijving</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Beschrijf de uitgave..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vat"
                          checked={vatDeductible}
                          onCheckedChange={(checked) => setVatDeductible(checked as boolean)}
                        />
                        <Label htmlFor="vat" className="cursor-pointer">
                          BTW aftrekbaar (21%)
                        </Label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowNewExpenseDialog(false)} className="flex-1">
                          Annuleren
                        </Button>
                        <Button type="submit" variant="hero" className="flex-1">
                          Opslaan
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 space-y-6 p-6">
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Totale onkosten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                    <p className="text-xs text-muted-foreground">{expenses.length} uitgaven</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      BTW terug te vorderen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalVat)}</div>
                    <p className="text-xs text-muted-foreground">Aftrekbaar BTW</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Deze maand
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        expenses
                          .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
                          .reduce((sum, e) => sum + e.amount_cents, 0)
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length} uitgaven
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Expenses List */}
              <Card>
                <CardHeader>
                  <CardTitle>Onkostenoverzicht</CardTitle>
                  <CardDescription>
                    Alle geregistreerde uitgaven
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Onkosten laden...</div>
                  ) : expenses.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Geen onkosten gevonden</h3>
                      <p className="text-muted-foreground mb-4">
                        Begin met het registreren van je eerste uitgave
                      </p>
                      <Button variant="hero" onClick={() => setShowNewExpenseDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Eerste onkosten toevoegen
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {expenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-lg">
                              <Receipt className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{expense.category}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(expense.date), 'd MMM yyyy', { locale: nl })}
                                {expense.project && ` • ${expense.project.name_i18n.nl}`}
                              </div>
                              {expense.description && (
                                <div className="text-sm text-muted-foreground mt-1">{expense.description}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(expense.amount_cents)}</div>
                            {expense.vat_deductible && expense.vat_amount_cents && (
                              <div className="text-sm text-green-600">
                                BTW: {formatCurrency(expense.vat_amount_cents)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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

export default Expenses;
