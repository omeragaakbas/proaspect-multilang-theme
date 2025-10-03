import React from 'react';
import { ArrowRight, CheckCircle, Users, BarChart, Clock, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Over ProAspect</h1>
            <p className="text-xl text-muted-foreground mb-8">
              ProAspect maakt administratie en facturatie eenvoudig voor ZZP'ers en kleine bedrijven in Nederland.
            </p>
          </div>
        </div>
      </section>

      {/* Onze visie Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Onze visie</h2>
              <p className="text-muted-foreground mb-4">
                Wij geloven dat het runnen van een onderneming al genoeg uitdagingen met zich meebrengt. 
                Daarom verdient jouw administratie niet nog eens extra kopzorgen.
              </p>
              <p className="text-muted-foreground mb-6">
                Bij ProAspect creëren we software die je administratieve lasten vermindert, 
                zodat jij kunt focussen op wat écht belangrijk is: jouw klanten, projecten en groei.
              </p>
            </div>
            <div className="bg-muted rounded-xl p-8 shadow-sm">
              <blockquote className="italic text-lg mb-6">
                "Met ProAspect hebben we een oplossing gecreëerd die niet alleen tijd bespaart, maar ook stress vermindert. 
                Onze gebruikers rapporteren gemiddeld 75% tijdsbesparing op hun administratieve taken."
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <span className="font-semibold text-primary">CA</span>
                </div>
                <div>
                  <p className="font-medium">Caner Akbas</p>
                  <p className="text-sm text-muted-foreground">Oprichter, ProAspect</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ons platform Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ons platform</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              ProAspect biedt een complete oplossing voor tijdregistratie, facturatie en projectmanagement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tijdregistratie</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Eenvoudig uren registreren</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Automatische herinneringen</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Mobiele app voor onderweg</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Klantbeheer</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Overzichtelijk klantendashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Projecthistorie per klant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Aangepaste uurtarieven</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Facturatie</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Professionele facturen</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Automatische facturatie</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Betalingsherinneringen</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/features">
              <Button>
                Bekijk alle functies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Kernwaarden Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Onze kernwaarden</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-card p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Betrouwbaarheid</h3>
              <p className="text-muted-foreground">
                We bouwen oplossingen waar je elke dag op kunt rekenen.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gebruiksgemak</h3>
              <p className="text-muted-foreground">
                We maken complexe zaken eenvoudig en toegankelijk.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Klantgericht</h3>
              <p className="text-muted-foreground">
                De behoeften van onze gebruikers staan altijd centraal.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovatie</h3>
              <p className="text-muted-foreground">
                We blijven vooruitdenken en verbeteren onze diensten continu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Het team achter ProAspect</h2>
          <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            Ons diverse team van experts werkt elke dag aan het verbeteren van onze dienstverlening.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {name: "Jan Dijkstra", title: "Oprichter & CEO"},
              {name: "Lisa van der Berg", title: "Hoofd Ontwikkeling"},
              {name: "Mark Bakker", title: "Klantenservice Manager"},
              {name: "Emma de Vries", title: "Marketing Specialist"}
            ].map((person, i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-4"></div>
                <h4 className="font-medium mb-1">{person.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{person.title}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Interesse om ons team te versterken?
            </p>
            <Link to="/careers">
              <Button variant="outline">
                Bekijk onze vacatures
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Klaar om tijd te besparen?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sluit je aan bij duizenden tevreden klanten en ontdek hoe ProAspect jouw administratie kan vereenvoudigen.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg">
              Gratis uitproberen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Demo aanvragen
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
