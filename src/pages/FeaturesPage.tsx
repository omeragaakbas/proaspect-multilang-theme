import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Clock, Users, FileText, BarChart3, Shield, Zap } from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: Clock,
      title: 'Tijdregistratie',
      description: 'Registreer uren eenvoudig en efficiënt. Houd alle gewerkte uren bij per project en klant.'
    },
    {
      icon: Users,
      title: 'Klantenbeheer',
      description: 'Beheer al je klanten op één centrale plek. Volledige contactgegevens en projecthistorie.'
    },
    {
      icon: FileText,
      title: 'Facturatie',
      description: 'Maak en verstuur professionele facturen in enkele klikken. Inclusief automatische herinnering.'
    },
    {
      icon: BarChart3,
      title: 'Rapportages',
      description: 'Krijg inzicht in je business met uitgebreide rapportages en analytics.'
    },
    {
      icon: Shield,
      title: 'Veilig & Betrouwbaar',
      description: 'Je data is veilig opgeslagen met enterprise-grade beveiliging en dagelijkse backups.'
    },
    {
      icon: Zap,
      title: 'Supersnel',
      description: 'Intuïtieve interface die snel werkt, zodat je je kunt focussen op je werk.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Krachtige Features voor ZZP'ers
              </h1>
              <p className="text-xl text-muted-foreground">
                Alles wat je nodig hebt om je bedrijf soepel te laten draaien, in één platform.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Klaar om te beginnen?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Start vandaag nog gratis en ontdek hoe ProAspect je bedrijf kan helpen groeien.
              </p>
              <a
                href="/register"
                className="inline-flex items-center px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Gratis proberen
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
