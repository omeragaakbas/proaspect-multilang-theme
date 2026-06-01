import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { nl, enUS, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Euro, Clock, FileText, Download } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useInvoices } from '@/hooks/useInvoices';
import { useExpenses } from '@/hooks/useExpenses';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'tr' ? tr : i18n.language === 'en' ? enUS : nl;
  const { projects } = useProjects();
  const { timeEntries } = useTimeEntries();
  const { invoices } = useInvoices();
  const { expenses } = useExpenses();

  const getLocalizedName = (nameI18n: any) => {
    if (!nameI18n || typeof nameI18n !== 'object') return '';
    const lang = i18n.language as 'nl' | 'en' | 'tr';
    return nameI18n[lang] || nameI18n.nl || nameI18n.en || nameI18n.tr || '';
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  const monthlyData = useMemo(() => {
    const last6Months = eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() });
    return last6Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const revenue = invoices
        .filter(inv => { const date = new Date(inv.issue_date); return date >= monthStart && date <= monthEnd && inv.status === 'PAID'; })
        .reduce((sum, inv) => sum + inv.total_cents, 0);
      const expensesTotal = expenses
        .filter(exp => { const date = new Date(exp.date); return date >= monthStart && date <= monthEnd; })
        .reduce((sum, exp) => sum + exp.amount_cents, 0);
      const hours = timeEntries
        .filter(entry => { const date = new Date(entry.date); return date >= monthStart && date <= monthEnd && entry.status === 'APPROVED'; })
        .reduce((sum, entry) => sum + entry.hours, 0);
      return {
        month: format(month, 'MMM', { locale: dateLocale }),
        [t('reports.revenue')]: revenue / 100,
        [t('reports.costs')]: expensesTotal / 100,
        [t('reports.profit')]: (revenue - expensesTotal) / 100,
        [t('reports.hours')]: hours,
      };
    });
  }, [invoices, expenses, timeEntries, dateLocale, t]);

  const projectData = useMemo(() => {
    return projects.map(project => {
      const projectEntries = timeEntries.filter(e => e.project_id === project.id && e.status === 'APPROVED');
      const totalHours = projectEntries.reduce((sum, e) => sum + e.hours, 0);
      const revenue = totalHours * (project.hourly_rate || 0) / 100;
      const projectExpenses = expenses
        .filter(e => e.project_id === project.id)
        .reduce((sum, e) => sum + e.amount_cents, 0) / 100;
      return {
        name: getLocalizedName(project.name_i18n),
        [t('reports.hours')]: totalHours,
        [t('reports.revenue')]: revenue,
        [t('reports.costs')]: projectExpenses,
      };
    }).filter(p => p[t('reports.hours')] > 0);
  }, [projects, timeEntries, expenses, t]);

  const expensesByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount_cents / 100;
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const stats = useMemo(() => {
    const totalRevenue = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.total_cents, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount_cents, 0);
    const totalHours = timeEntries.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + e.hours, 0);
    const avgHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;
    return { totalRevenue, totalExpenses, totalProfit: totalRevenue - totalExpenses, totalHours, avgHourlyRate };
  }, [invoices, expenses, timeEntries]);

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />

          <main className="flex-1">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold">{t('reports.title')}</h1>
                  <p className="text-muted-foreground">{t('reports.subtitle')}</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={handleExportPdf}>
                  <Download className="h-4 w-4" />
                  {t('reports.exportPdf')}
                </Button>
              </div>
            </header>

            <div className="flex-1 space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-5">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Euro className="h-4 w-4" />{t('reports.totalRevenue')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />{t('reports.totalCosts')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />{t('reports.totalProfit')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalProfit)}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />{t('reports.totalHours')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}u</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />{t('reports.avgHourlyRate')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{formatCurrency(stats.avgHourlyRate)}</div></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.revenueAndCosts')}</CardTitle>
                  <CardDescription>{t('reports.revenueAndCostsDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `€${value}`} />
                      <Legend />
                      <Bar dataKey={t('reports.revenue')} fill="#00C49F" />
                      <Bar dataKey={t('reports.costs')} fill="#FF8042" />
                      <Bar dataKey={t('reports.profit')} fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('reports.projectProfitability')}</CardTitle>
                    <CardDescription>{t('reports.projectProfitabilityDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={projectData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value) => `€${value}`} />
                        <Legend />
                        <Bar dataKey={t('reports.revenue')} fill="#00C49F" />
                        <Bar dataKey={t('reports.costs')} fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('reports.expensesByCategory')}</CardTitle>
                    <CardDescription>{t('reports.expensesByCategoryDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: €${entry.value.toFixed(0)}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensesByCategory.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `€${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.hoursTrend')}</CardTitle>
                  <CardDescription>{t('reports.hoursTrendDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={t('reports.hours')} stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Reports;
