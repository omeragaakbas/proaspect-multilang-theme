import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Clock, Play, Pause, Calendar, BarChart3, CheckCircle } from 'lucide-react';

export const TimeTrackingPage = () => {
  const features = [
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: 'Real-time Tijdregistratie',
      description: 'Start en stop je timer met één klik. Perfect voor nauwkeurige urenregistratie.'
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: 'Week Overzicht',
      description: 'Bekijk al je gewerkte uren in een overzichtelijk weekoverzicht.'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: 'Project Tracking',
      description: 'Registreer tijd per project en krijg inzicht in je projecturen.'
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Goedkeuringsflow',
      description: 'Klanten kunnen gewerkte uren goedkeuren voor transparante samenwerking.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <Clock className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Slimme Tijdregistratie
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Registreer je uren eenvoudig en nauwkeurig. Perfect voor ZZP'ers die waarde hechten aan transparantie.
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
              Alles wat je nodig hebt
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
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
              Klaar om te beginnen?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start vandaag nog met professionele tijdregistratie
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
