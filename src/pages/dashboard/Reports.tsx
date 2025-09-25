import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { nl } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Mock data - will be replaced with real data from Supabase
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);

  const stats = {
    totalHours: 156.5,
    totalRevenue: 7825.00,
    totalInvoices: 8,
    averageHourlyRate: 50.00,
    paidInvoices: 6,
    outstandingAmount: 2340.00,
    topClient: 'ACME Corporation',
    topProject: 'Website Redesign'
  };

  const monthlyComparison = {
    hoursChange: 12.5,
    revenueChange: 890.00,
    invoicesChange: 2
  };

  const clientBreakdown = [
    { name: 'ACME Corporation', hours: 45.5, revenue: 2275.00, percentage: 29 },
    { name: 'TechStart BV', hours: 38.0, revenue: 1900.00, percentage: 24 },
    { name: 'Digital Solutions', hours: 32.5, revenue: 1625.00, percentage: 21 },
    { name: 'StartupXYZ', hours: 25.0, revenue: 1250.00, percentage: 16 },
    { name: 'Anderen', hours: 15.5, revenue: 775.00, percentage: 10 }
  ];

  const projectPerformance = [
    { name: 'Website Redesign', client: 'ACME Corp', hours: 45.5, revenue: 2275.00, status: 'Actief' },
    { name: 'API Development', client: 'TechStart BV', hours: 38.0, revenue: 1900.00, status: 'Voltooid' },
    { name: 'Mobile App', client: 'StartupXYZ', hours: 25.0, revenue: 1250.00, status: 'Actief' },
    { name: 'Database Optimization', client: 'Digital Solutions', hours: 32.5, revenue: 1625.00, status: 'Voltooid' }
  ];

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
                  <Button variant="outline" className="gap-2">
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
                    <div className="text-2xl font-bold">{formatHours(stats.totalHours)}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      +{formatHours(monthlyComparison.hoursChange)} vs vorige maand
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Totaal omzet</CardTitle>
                    <Euro className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      +{formatCurrency(monthlyComparison.revenueChange)} vs vorige maand
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Facturen</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.paidInvoices} betaald • {formatCurrency(stats.outstandingAmount)} openstaand
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gem. uurtarief</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.averageHourlyRate)}</div>
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
                    <div className="space-y-4">
                      {clientBreakdown.map((client, index) => (
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
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${client.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <div className="space-y-4">
                      {projectPerformance.map((project, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-muted-foreground">{project.client}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <span>{formatHours(project.hours)}</span>
                              <span>•</span>
                              <span>{formatCurrency(project.revenue)}</span>
                            </div>
                          </div>
                          <Badge variant={project.status === 'Actief' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      ))}
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
                      <div className="text-2xl font-bold text-primary">{stats.topClient}</div>
                      <p className="text-sm text-muted-foreground">
                        29% van je totale omzet deze periode
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Populairste project</div>
                      <div className="text-2xl font-bold text-primary">{stats.topProject}</div>
                      <p className="text-sm text-muted-foreground">
                        Meeste uren besteed aan dit project
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Aanbevelingen</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Overweeg je uurtarief te verhogen - je prestaties zijn sterk</li>
                      <li>• {stats.topClient} is je beste klant - investeer in deze relatie</li>
                      <li>• Je hebt {formatCurrency(stats.outstandingAmount)} openstaand - stuur herinneringen</li>
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