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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Receipt, CalendarIcon, Euro, TrendingDown, FileText, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExpenses, Expense } from '@/hooks/useExpenses';
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
  const { t, i18n } = useTranslation();
  const { expenses, createExpense, updateExpense, deleteExpense, isLoading } = useExpenses();
  const { projects } = useProjects();
  const dateLocale = i18n.language === 'tr' ? tr : i18n.language === 'en' ? enUS : nl;

  const getLocalizedName = (nameI18n: any) => {
    if (!nameI18n || typeof nameI18n !== 'object') return '';
    const lang = i18n.language as 'nl' | 'en' | 'tr';
    return nameI18n[lang] || nameI18n.nl || nameI18n.en || nameI18n.tr || '';
  };

  const [showNewExpenseDialog, setShowNewExpenseDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [vatDeductible, setVatDeductible] = useState(true);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVatDeductible, setEditVatDeductible] = useState(true);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100);
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

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setEditAmount((expense.amount_cents / 100).toString());
    setEditCategory(expense.category);
    setEditProjectId(expense.project_id || '');
    setEditDescription(expense.description || '');
    setEditVatDeductible(expense.vat_deductible);
  };

  const handleEdit = () => {
    if (!editingExpense) return;
    updateExpense({
      id: editingExpense.id,
      amount: parseFloat(editAmount),
      category: editCategory,
      project_id: editProjectId || undefined,
      description: editDescription || undefined,
      vat_deductible: editVatDeductible,
    });
    setEditingExpense(null);
  };

  const handleDelete = () => {
    if (!deletingExpenseId) return;
    deleteExpense(deletingExpenseId);
    setDeletingExpenseId(null);
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
                  <h1 className="text-2xl font-semibold">{t('expenses.title')}</h1>
                  <p className="text-muted-foreground">{t('expenses.subtitle')}</p>
                </div>
                <Dialog open={showNewExpenseDialog} onOpenChange={setShowNewExpenseDialog}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t('expenses.newExpense')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{t('expenses.addExpense')}</DialogTitle>
                      <DialogDescription>{t('expenses.addExpenseDesc')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('expenses.date')}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP", { locale: dateLocale }) : <span>{t('common.selectDate')}</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">{t('expenses.amountRequired')}</Label>
                        <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="125.00" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">{t('expenses.categoryRequired')}</Label>
                        <Select value={category} onValueChange={setCategory} required>
                          <SelectTrigger><SelectValue placeholder={t('expenses.selectCategory')} /></SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project">{t('expenses.projectOptional')}</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                          <SelectTrigger><SelectValue placeholder={t('expenses.selectProject')} /></SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>{getLocalizedName(project.name_i18n)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">{t('expenses.description')}</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('expenses.describeExpense')} rows={3} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vat" checked={vatDeductible} onCheckedChange={(checked) => setVatDeductible(checked as boolean)} />
                        <Label htmlFor="vat" className="cursor-pointer">{t('expenses.vatDeductible21')}</Label>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowNewExpenseDialog(false)} className="flex-1">{t('common.cancel')}</Button>
                        <Button type="submit" variant="hero" className="flex-1">{t('common.save')}</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            <div className="flex-1 space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />{t('expenses.totalExpenses')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                    <p className="text-xs text-muted-foreground">{t('expenses.expenseCount', { count: expenses.length })}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Euro className="h-4 w-4" />{t('expenses.vatToReclaim')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalVat)}</div>
                    <p className="text-xs text-muted-foreground">{t('expenses.deductibleVat')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />{t('dashboard.thisMonth')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).reduce((sum, e) => sum + e.amount_cents, 0))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('expenses.expenseCount', { count: expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('expenses.overview')}</CardTitle>
                  <CardDescription>{t('expenses.allRegistered')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
                  ) : expenses.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t('expenses.noExpensesFound')}</h3>
                      <p className="text-muted-foreground mb-4">{t('expenses.startRegistering')}</p>
                      <Button variant="hero" onClick={() => setShowNewExpenseDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />{t('expenses.addFirst')}
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
                                {format(new Date(expense.date), 'd MMM yyyy', { locale: dateLocale })}
                                {expense.project && ` • ${getLocalizedName(expense.project.name_i18n)}`}
                              </div>
                              {expense.description && (
                                <div className="text-sm text-muted-foreground mt-1">{expense.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(expense.amount_cents)}</div>
                              {expense.vat_deductible && expense.vat_amount_cents && (
                                <div className="text-sm text-green-600">BTW: {formatCurrency(expense.vat_amount_cents)}</div>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(expense)}>
                                  <Edit className="mr-2 h-4 w-4" />{t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeletingExpenseId(expense.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />{t('common.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('expenses.editExpense')}</DialogTitle>
              <DialogDescription>{t('expenses.editExpenseDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('expenses.amountRequired')}</Label>
                <Input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('expenses.categoryRequired')}</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('expenses.projectOptional')}</Label>
                <Select value={editProjectId} onValueChange={setEditProjectId}>
                  <SelectTrigger><SelectValue placeholder={t('expenses.selectProject')} /></SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{getLocalizedName(project.name_i18n)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('expenses.description')}</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="editVat" checked={editVatDeductible} onCheckedChange={(checked) => setEditVatDeductible(checked as boolean)} />
                <Label htmlFor="editVat" className="cursor-pointer">{t('expenses.vatDeductible21')}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingExpense(null)}>{t('common.cancel')}</Button>
              <Button onClick={handleEdit}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingExpenseId} onOpenChange={(open) => !open && setDeletingExpenseId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('expenses.deleteExpense')}</AlertDialogTitle>
              <AlertDialogDescription>{t('expenses.deleteExpenseConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>{t('common.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Expenses;
