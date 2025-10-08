import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Code, BookOpen, Key, Zap, Shield, Globe } from 'lucide-react';

export const ApiDocsPage = () => {
  const features = [
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: 'RESTful API',
      description: 'Moderne REST API met JSON responses'
    },
    {
      icon: <Key className="h-8 w-8 text-primary" />,
      title: 'API Keys',
      description: 'Veilige authenticatie met API sleutels'
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Real-time Webhooks',
      description: 'Ontvang notificaties bij belangrijke events'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Beveiligd',
      description: 'HTTPS encryptie en OAuth 2.0 support'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <Code className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              API Documentatie
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Integreer ProAspect met je eigen applicaties en workflows
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/register">API Key Aanvragen</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              API Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 border rounded-lg hover:shadow-lg transition-shadow text-center">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Endpoints Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Beschikbare Endpoints
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="p-6 bg-background border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-mono">GET</span>
                  <code className="text-sm">/api/v1/time-entries</code>
                </div>
                <p className="text-muted-foreground text-sm">Haal alle tijdregistraties op</p>
              </div>
              
              <div className="p-6 bg-background border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">POST</span>
                  <code className="text-sm">/api/v1/time-entries</code>
                </div>
                <p className="text-muted-foreground text-sm">Maak een nieuwe tijdregistratie</p>
              </div>
              
              <div className="p-6 bg-background border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-mono">GET</span>
                  <code className="text-sm">/api/v1/invoices</code>
                </div>
                <p className="text-muted-foreground text-sm">Haal alle facturen op</p>
              </div>
              
              <div className="p-6 bg-background border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">POST</span>
                  <code className="text-sm">/api/v1/invoices</code>
                </div>
                <p className="text-muted-foreground text-sm">Maak een nieuwe factuur</p>
              </div>

              <div className="p-6 bg-background border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-mono">GET</span>
                  <code className="text-sm">/api/v1/clients</code>
                </div>
                <p className="text-muted-foreground text-sm">Haal alle klanten op</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Klaar om te integreren?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Vraag je API key aan en begin met bouwen
            </p>
            <Button asChild size="lg">
              <Link to="/register">Aan de slag</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
