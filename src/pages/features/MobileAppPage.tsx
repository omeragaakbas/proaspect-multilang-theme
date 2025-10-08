import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Smartphone, Wifi, Cloud, Zap, Shield, RefreshCw } from 'lucide-react';

export const MobileAppPage = () => {
  const features = [
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: 'Responsive Design',
      description: 'Werkt perfect op elke smartphone en tablet.'
    },
    {
      icon: <Wifi className="h-8 w-8 text-primary" />,
      title: 'Offline Functionaliteit',
      description: 'Registreer tijd ook zonder internetverbinding.'
    },
    {
      icon: <Cloud className="h-8 w-8 text-primary" />,
      title: 'Cloud Sync',
      description: 'Automatische synchronisatie met al je apparaten.'
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Snelle Toegang',
      description: 'Start je timer met één tik, waar je ook bent.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Veilig',
      description: 'Je data is beveiligd met encryptie.'
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-primary" />,
      title: 'Real-time Updates',
      description: 'Zie direct updates van klanten en projecten.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <Smartphone className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Altijd en Overal
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              ProAspect werkt naadloos op al je apparaten. Van desktop tot smartphone, je data is altijd bij de hand.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/register">Gratis Proberen</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/features">Alle Features</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Mobile-first ervaring
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

        {/* Info Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              Progressive Web App
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-6">
              ProAspect is gebouwd als een moderne Progressive Web App (PWA). Dit betekent dat je geen aparte app hoeft te installeren uit de App Store of Google Play.
            </p>
            <p className="text-lg text-muted-foreground text-center">
              Voeg ProAspect gewoon toe aan je home screen en geniet van een app-achtige ervaring, direct vanuit je browser.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Probeer het op je telefoon
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Open ProAspect op je smartphone en ervaar het zelf
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
