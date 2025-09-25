import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { 
  Clock, 
  Euro, 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { analytics, timeAnalytics, loading } = useAnalytics();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welkom terug! Hier is je overzicht voor vandaag.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button 
            variant="hero" 
            className="h-auto p-4" 
            size="lg"
            onClick={() => navigate('/dashboard/time-entry')}
          >
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Tijd Loggen</div>
                <div className="text-xs opacity-90">Nieuwe entry</div>
              </div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4" 
            size="lg"
            onClick={() => navigate('/dashboard/invoices')}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Factuur</div>
                <div className="text-xs text-muted-foreground">Maken</div>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4" 
            size="lg"
            onClick={() => navigate('/dashboard/clients')}
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Klant</div>
                <div className="text-xs text-muted-foreground">Toevoegen</div>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto p-4" 
            size="lg"
            onClick={() => navigate('/dashboard/reports')}
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Rapporten</div>
                <div className="text-xs text-muted-foreground">Bekijken</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Uren</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics ? formatHours(analytics.totalHours) : '0u'}
              </div>
              <p className="text-xs text-muted-foreground">
                Deze periode
              </p>
              <Progress 
                value={analytics ? Math.min((analytics.totalHours / 160) * 100, 100) : 0} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Omzet</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics ? formatCurrency(analytics.totalRevenue) : '€0'}
              </div>
              <p className="text-xs text-success">
                {analytics ? formatCurrency(analytics.averageHourlyRate) : '€0'}/uur gemiddeld
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Openstaande Facturen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics ? analytics.totalInvoices - analytics.paidInvoices : 0}
              </div>
              <p className="text-xs text-warning">
                {analytics ? formatCurrency(analytics.outstandingAmount) : '€0'} totaal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturen Betaald</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics ? analytics.paidInvoices : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                van {analytics ? analytics.totalInvoices : 0} totaal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {timeAnalytics && timeAnalytics.dailyHours.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Uren per Dag</CardTitle>
                <CardDescription>
                  Dagelijkse tijdsregistratie trend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    hours: {
                      label: "Uren",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeAnalytics.dailyHours}>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Omzet per Dag</CardTitle>
                <CardDescription>
                  Dagelijkse omzet ontwikkeling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Omzet",
                      color: "hsl(var(--success))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeAnalytics.dailyHours}>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="revenue" 
                        fill="hsl(var(--success))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Time Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recente Tijdregistraties
                <Button variant="ghost" size="sm">
                  Alle bekijken
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Website Redesign</div>
                    <div className="text-sm text-muted-foreground">Acme Corp</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">8.0u</div>
                    <Badge variant="secondary" className="text-xs">DRAFT</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">API Development</div>
                    <div className="text-sm text-muted-foreground">TechStart BV</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">6.5u</div>
                    <Badge className="text-xs">GOEDGEKEURD</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Database Optimalisatie</div>
                    <div className="text-sm text-muted-foreground">DataCorp NL</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">4.0u</div>
                    <Badge variant="outline" className="text-xs">INGEDIEND</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recente Facturen
                <Button variant="ghost" size="sm">
                  Alle bekijken
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">INV-2024-001</div>
                    <div className="text-sm text-muted-foreground">Acme Corp</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">€1,250</div>
                    <Badge className="text-xs">BETAALD</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">INV-2024-002</div>
                    <div className="text-sm text-muted-foreground">TechStart BV</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">€890</div>
                    <Badge variant="outline" className="text-xs">VERZONDEN</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">INV-2024-003</div>
                    <div className="text-sm text-muted-foreground">DataCorp NL</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">€560</div>
                    <Badge variant="secondary" className="text-xs">CONCEPT</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;