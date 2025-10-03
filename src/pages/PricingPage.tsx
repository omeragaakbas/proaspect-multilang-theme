import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '€19',
      period: 'per maand',
      description: 'Perfect voor startende ZZP\'ers',
      features: [
        'Tot 5 klanten',
        'Onbeperkte tijdregistratie',
        '25 facturen per maand',
        'Basis rapportages',
        'Email support'
      ],
      cta: 'Start gratis',
      popular: false
    },
    {
      name: 'Professional',
      price: '€39',
      period: 'per maand',
      description: 'Voor groeiende bedrijven',
      features: [
        'Onbeperkt aantal klanten',
        'Onbeperkte tijdregistratie',
        'Onbeperkt facturen',
        'Geavanceerde rapportages',
        'Automatische herinneringen',
        'Prioriteit support',
        'API toegang'
      ],
      cta: 'Start gratis',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Op maat',
      period: 'neem contact op',
      description: 'Voor grote organisaties',
      features: [
        'Alles van Professional',
        'Dedicated account manager',
        'Custom integraties',
        'SLA garantie',
        'Training & onboarding',
        'White-label optie'
      ],
      cta: 'Neem contact op',
      popular: false
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
                Transparante Prijzen
              </h1>
              <p className="text-xl text-muted-foreground">
                Kies het plan dat bij jou past. Altijd opzegbaar, geen verborgen kosten.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-card border rounded-xl p-8 relative ${
                    plan.popular
                      ? 'border-primary shadow-xl scale-105'
                      : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Populair
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {plan.description}
                    </p>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">{plan.period}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <a href={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                      {plan.cta}
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center text-foreground">
                Veelgestelde vragen
              </h2>
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-2 text-foreground">
                    Kan ik van plan wisselen?
                  </h3>
                  <p className="text-muted-foreground">
                    Ja, je kunt op elk moment upgraden of downgraden. Wijzigingen gaan direct in.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-2 text-foreground">
                    Is er een gratis proefperiode?
                  </h3>
                  <p className="text-muted-foreground">
                    Ja, alle plannen komen met een gratis proefperiode van 14 dagen. Geen creditcard nodig.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-2 text-foreground">
                    Wat gebeurt er na de proefperiode?
                  </h3>
                  <p className="text-muted-foreground">
                    Na de proefperiode kun je kiezen om door te gaan met een betaald plan of je account wordt automatisch gepauzeerd.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
