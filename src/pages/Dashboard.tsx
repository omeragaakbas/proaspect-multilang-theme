import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Euro, 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  ArrowUpRight 
} from 'lucide-react';

const Dashboard = () => {
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
          <Button variant="hero" className="h-auto p-4" size="lg">
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Tijd Loggen</div>
                <div className="text-xs opacity-90">Nieuwe entry</div>
              </div>
            </div>
          </Button>
          
          <Button variant="outline" className="h-auto p-4" size="lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Factuur</div>
                <div className="text-xs text-muted-foreground">Maken</div>
              </div>
            </div>
          </Button>

          <Button variant="outline" className="h-auto p-4" size="lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Klant</div>
                <div className="text-xs text-muted-foreground">Toevoegen</div>
              </div>
            </div>
          </Button>

          <Button variant="outline" className="h-auto p-4" size="lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Planning</div>
                <div className="text-xs text-muted-foreground">Bekijken</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deze Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32.5u</div>
              <p className="text-xs text-muted-foreground">
                +2.5u van vorige week
              </p>
              <Progress value={65} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Te Factureren</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€2,340</div>
              <p className="text-xs text-success">
                +€420 deze week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Openstaande Facturen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-warning">
                €1,850 totaal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Projecten</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                2 nieuwe deze maand
              </p>
            </CardContent>
          </Card>
        </div>

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