import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { nl } from 'date-fns/locale';
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
  const { projects } = useProjects();
  const { timeEntries } = useTimeEntries();
  const { invoices } = useInvoices();
  const { expenses } = useExpenses();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  // Monthly revenue data
  const monthlyData = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return last6Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const revenue = invoices
        .filter(inv => {
          const date = new Date(inv.issue_date);
          return date >= monthStart && date <= monthEnd && inv.status === 'PAID';
        })
        .reduce((sum, inv) => sum + inv.total_cents, 0);

      const expensesTotal = expenses
        .filter(exp => {
          const date = new Date(exp.date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, exp) => sum + exp.amount_cents, 0);

      const hours = timeEntries
        .filter(entry => {
          const date = new Date(entry.date);
          return date >= monthStart && date <= monthEnd && entry.status === 'APPROVED';
        })
        .reduce((sum, entry) => sum + entry.hours, 0);

      return {
        month: format(month, 'MMM', { locale: nl }),
        omzet: revenue / 100,
        kosten: expensesTotal / 100,
        winst: (revenue - expensesTotal) / 100,
        uren: hours,
      };
    });
  }, [invoices, expenses, timeEntries]);

  // Project profitability
  const projectData = useMemo(() => {
    return projects.map(project => {
      const projectEntries = timeEntries.filter(e => e.project_id === project.id && e.status === 'APPROVED');
      const totalHours = projectEntries.reduce((sum, e) => sum + e.hours, 0);
      const revenue = totalHours * (project.hourly_rate || 0) / 100;
      
      const projectExpenses = expenses
        .filter(e => e.project_id === project.id)
        .reduce((sum, e) => sum + e.amount_cents, 0) / 100;

      return {
        name: project.name_i18n.nl,
        uren: totalHours,
        omzet: revenue,
        kosten: projectExpenses,
        winst: revenue - projectExpenses,
      };
    }).filter(p => p.uren > 0);
  }, [projects, timeEntries, expenses]);

  // Category expenses
  const expensesByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount_cents / 100;
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Summary stats
  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total_cents, 0);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount_cents, 0);

    const totalHours = timeEntries
      .filter(e => e.status === 'APPROVED')
      .reduce((sum, e) => sum + e.hours, 0);

    const avgHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;

    return {
      totalRevenue,
      totalExpenses,
      totalProfit: totalRevenue - totalExpenses,
      totalHours,
      avgHourlyRate,
    };
  }, [invoices, expenses, timeEntries]);

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
                  <h1 className="text-2xl font-semibold">Rapportages</h1>
                  <p className="text-muted-foreground">
                    Inzicht in je bedrijfsprestaties
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 space-y-6 p-6">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-5">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      Totale omzet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Totale kosten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Totale winst
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalProfit)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Totale uren
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}u</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Gem. uurtarief
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.avgHourlyRate)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Revenue & Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle>Omzet & Kosten (laatste 6 maanden)</CardTitle>
                  <CardDescription>Maandelijks overzicht van inkomsten en uitgaven</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `€${value}`} />
                      <Legend />
                      <Bar dataKey="omzet" fill="#00C49F" name="Omzet" />
                      <Bar dataKey="kosten" fill="#FF8042" name="Kosten" />
                      <Bar dataKey="winst" fill="#0088FE" name="Winst" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Project Profitability */}
                <Card>
                  <CardHeader>
                    <CardTitle>Winstgevendheid per project</CardTitle>
                    <CardDescription>Omzet en kosten per project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={projectData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value) => `€${value}`} />
                        <Legend />
                        <Bar dataKey="omzet" fill="#00C49F" name="Omzet" />
                        <Bar dataKey="kosten" fill="#FF8042" name="Kosten" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Expenses by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Onkosten per categorie</CardTitle>
                    <CardDescription>Verdeling van zakelijke uitgaven</CardDescription>
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
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `€${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Hours Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Gewerkte uren trend</CardTitle>
                  <CardDescription>Goedgekeurde uren per maand</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="uren" stroke="#8884d8" name="Uren" strokeWidth={2} />
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
