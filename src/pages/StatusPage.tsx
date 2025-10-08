import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const StatusPage = () => {
  const services = [
    { name: 'Web Applicatie', status: 'operational', uptime: '99.99%' },
    { name: 'API', status: 'operational', uptime: '99.98%' },
    { name: 'Database', status: 'operational', uptime: '99.99%' },
    { name: 'Facturatie Systeem', status: 'operational', uptime: '99.97%' },
    { name: 'Email Notificaties', status: 'operational', uptime: '99.95%' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operationeel';
      case 'degraded':
        return 'Verminderde prestaties';
      case 'down':
        return 'Niet beschikbaar';
      default:
        return 'Operationeel';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold text-center mb-4">
              ProAspect Status
            </h1>
            <p className="text-center text-muted-foreground mb-12">
              Real-time status van alle ProAspect diensten
            </p>

            {/* Overall Status */}
            <div className="mb-12 p-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-green-900 dark:text-green-100">
                  Alle Systemen Operationeel
                </h2>
              </div>
              <p className="text-green-700 dark:text-green-300">
                Alle diensten functioneren normaal
              </p>
            </div>

            {/* Services Status */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Service Status</h3>
              {services.map((service, index) => (
                <div key={index} className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {getStatusText(service.status)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{service.uptime}</p>
                    <p className="text-xs text-muted-foreground">Uptime (30d)</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Updates */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-4">Recente Updates</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Alle systemen operationeel</p>
                      <p className="text-sm text-muted-foreground">
                        Vandaag om 14:32 - Alle diensten functioneren normaal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscribe Section */}
            <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-2">
                Blijf op de hoogte
              </h3>
              <p className="text-muted-foreground mb-4">
                Ontvang notificaties bij status updates
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Jouw email adres"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Abonneren
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
