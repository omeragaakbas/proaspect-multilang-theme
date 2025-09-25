import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar as CalendarIcon,
  Clock,
  Euro,
  Users,
  FileText,
  PieChart,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Calculate date ranges based on selected period
  const getDateRange = () => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'thisQuarter':
        // Simplified - just use last 3 months
        return { start: subMonths(startOfMonth(now), 2), end: endOfMonth(now) };
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return { start: dateFrom, end: dateTo };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start: periodStart, end: periodEnd } = getDateRange();
  const { analytics, timeAnalytics, clientAnalytics, loading } = useAnalytics(periodStart, periodEnd);
  const exportData = async () => {
    if (!analytics) return;
    
    const exportContent = `Rapport - ${format(periodStart || new Date(), 'PPP', { locale: nl })} tot ${format(periodEnd || new Date(), 'PPP', { locale: nl })}

Overzicht:
- Totaal uren: ${formatHours(analytics.totalHours)}
- Totaal omzet: ${formatCurrency(analytics.totalRevenue)}
- Gemiddeld uurtarief: ${formatCurrency(analytics.averageHourlyRate)}
- Facturen: ${analytics.totalInvoices} (${analytics.paidInvoices} betaald)
- Openstaand: ${formatCurrency(analytics.outstandingAmount)}

Beste klant: ${analytics.topClient || 'Geen data'}
Populairste project: ${analytics.topProject || 'Geen data'}

Klanten breakdown:
${clientAnalytics.map(client => `- ${client.name}: ${formatHours(client.hours)} (${formatCurrency(client.revenue)})`).join('\n')}
`;

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--muted-foreground))'];

  if (loading) {
    return (
      <DashboardLayout>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </main>
          </div>
        </SidebarProvider>
      </DashboardLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}u ${m}m` : `${h}u`;
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
                  <h1 className="text-2xl font-semibold">Rapporten</h1>
                  <p className="text-muted-foreground">
                    Inzicht in je prestaties en omzet
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisMonth">Deze maand</SelectItem>
                      <SelectItem value="lastMonth">Vorige maand</SelectItem>
                      <SelectItem value="thisQuarter">Dit kwartaal</SelectItem>
                      <SelectItem value="thisYear">Dit jaar</SelectItem>
                      <SelectItem value="custom">Aangepaste periode</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2" onClick={exportData}>
                    <Download className="h-4 w-4" />
                    Exporteren
                  </Button>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 space-y-6 p-6">
              {/* Custom Date Range */}
              {selectedPeriod === 'custom' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Aangepaste periode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !dateFrom && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon />
                            {dateFrom ? format(dateFrom, "PPP", { locale: nl }) : <span>Van datum</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !dateTo && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon />
                            {dateTo ? format(dateTo, "PPP", { locale: nl }) : <span>Tot datum</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Totaal uren</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics ? formatHours(analytics.totalHours) : '0u'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Geselecteerde periode
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Totaal omzet</CardTitle>
                    <Euro className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics ? formatCurrency(analytics.totalRevenue) : '€0'}
                    </div>
                    <p className="text-xs text-success">
                      {analytics ? formatCurrency(analytics.averageHourlyRate) : '€0'} gem. uurtarief
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Facturen</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics ? analytics.totalInvoices : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics ? analytics.paidInvoices : 0} betaald • {analytics ? formatCurrency(analytics.outstandingAmount) : '€0'} openstaand
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gem. uurtarief</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics ? formatCurrency(analytics.averageHourlyRate) : '€0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gebaseerd op alle projecten
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Analysis */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Client Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Klantenverdeling
                    </CardTitle>
                    <CardDescription>
                      Omzet per klant in de geselecteerde periode
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {clientAnalytics.length > 0 ? (
                      <div className="space-y-6">
                        {/* Pie Chart */}
                        <div className="h-[200px]">
                          <ChartContainer
                            config={{
                              revenue: {
                                label: "Omzet",
                                color: "hsl(var(--primary))",
                              },
                            }}
                            className="h-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={clientAnalytics.slice(0, 5)}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={60}
                                  dataKey="revenue"
                                  nameKey="name"
                                >
                                  {clientAnalytics.slice(0, 5).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>

                        {/* Client List */}
                        <div className="space-y-4">
                          {clientAnalytics.slice(0, 5).map((client, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{client.name}</span>
                                <span>{client.percentage}%</span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{formatHours(client.hours)}</span>
                                <span>{formatCurrency(client.revenue)}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300" 
                                  style={{ 
                                    width: `${client.percentage}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Geen data beschikbaar voor deze periode
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Project Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Projectprestaties
                    </CardTitle>
                    <CardDescription>
                      Top projecten op basis van uren en omzet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Projectprestaties worden binnenkort toegevoegd</p>
                      <p className="text-sm">Deze sectie toont gedetailleerde project analytics</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trends and Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trends & Inzichten
                  </CardTitle>
                  <CardDescription>
                    Belangrijke trends en aanbevelingen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="font-medium">Beste klant</div>
                      <div className="text-2xl font-bold text-primary">
                        {analytics?.topClient || 'Geen data'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {clientAnalytics[0]?.percentage || 0}% van je totale omzet deze periode
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Populairste project</div>
                      <div className="text-2xl font-bold text-primary">
                        {analytics?.topProject || 'Geen data'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Meeste uren besteed aan dit project
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Aanbevelingen</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {analytics && analytics.totalRevenue > 0 && (
                        <li>• Je gemiddelde uurtarief is {formatCurrency(analytics.averageHourlyRate)}</li>
                      )}
                      {analytics?.topClient && (
                        <li>• {analytics.topClient} is je beste klant - investeer in deze relatie</li>
                      )}
                      {analytics && analytics.outstandingAmount > 0 && (
                        <li>• Je hebt {formatCurrency(analytics.outstandingAmount)} openstaand - stuur herinneringen</li>
                      )}
                      {(!analytics || analytics.totalHours === 0) && (
                        <li>• Begin met het registreren van je tijd om inzichten te krijgen</li>
                      )}
                    </ul>
                  </div>
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