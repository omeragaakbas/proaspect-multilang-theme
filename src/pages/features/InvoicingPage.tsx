import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Send, Euro, Download, RefreshCw, CheckCircle } from 'lucide-react';

export const InvoicingPage = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Professionele Facturen',
      description: 'Maak mooie, professionele facturen in enkele klikken.'
    },
    {
      icon: <Send className="h-8 w-8 text-primary" />,
      title: 'Verstuur Direct',
      description: 'Verstuur facturen direct per e-mail naar je klanten.'
    },
    {
      icon: <Euro className="h-8 w-8 text-primary" />,
      title: 'BTW Berekening',
      description: 'Automatische BTW berekening volgens Nederlandse regelgeving.'
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-primary" />,
      title: 'Terugkerende Facturen',
      description: 'Stel periodieke facturen in voor vaste klanten.'
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: 'PDF Export',
      description: 'Download facturen als PDF voor je administratie.'
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Status Tracking',
      description: 'Houd bij welke facturen betaald zijn en welke nog open staan.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Eenvoudige Facturatie
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Van uren naar factuur in enkele klikken. Professioneel, snel en betrouwbaar.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/register">Gratis Proberen</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/pricing">Bekijk Prijzen</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Complete facturatie oplossing
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Klaar om professioneel te factureren?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Bespaar tijd en maak indruk met ProAspect
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">Maak een gratis account</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
