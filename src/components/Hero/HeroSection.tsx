import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, FileText, Shield, Zap, Globe } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4 gradient-subtle">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            Voor Nederlandse ZZP'ers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-gray-600 bg-clip-text text-transparent">
            Tijd & Facturen
            <br />
            <span className="text-foreground">Volledig Geautomatiseerd</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            ProAspect maakt tijdregistratie en facturering simpel. Van uren loggen tot goedkeuring 
            tot factuur versturen - alles in één platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="animate-slide-up">
              <a href="/dashboard">Start 30 Dagen Gratis</a>
            </Button>
            <Button variant="outline" size="xl" className="animate-slide-up">
              <a href="/login">Bekijk Demo</a>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-slide-up">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Smart Tijdregistratie</h3>
            <p className="text-sm text-muted-foreground">
              Log uren per project met 15-min precisie. Bulk acties en automatische validatie.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-slide-up">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold mb-2">Goedkeuringsflow</h3>
            <p className="text-sm text-muted-foreground">
              Automatische review workflow met real-time notificaties en audit trail.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-slide-up">
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-info" />
            </div>
            <h3 className="font-semibold mb-2">Professionele Facturen</h3>
            <p className="text-sm text-muted-foreground">
              PDF + UBL facturen met BTW handling en integratie met boekhoudpakketten.
            </p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-slide-up">
            <h2 className="text-3xl font-bold mb-6">
              Waarom Kiezen Voor ProAspect?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <Shield className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">GDPR Compliant</h4>
                  <p className="text-sm text-muted-foreground">
                    Nederlandse hosting met volledige compliance en audit logs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center mt-1">
                  <Zap className="h-3 w-3 text-success" />
                </div>
                <div>
                  <h4 className="font-medium">Lightning Fast</h4>
                  <p className="text-sm text-muted-foreground">
                    Moderne technologie voor snelle, responsive ervaring op alle devices.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-info/10 rounded-full flex items-center justify-center mt-1">
                  <Globe className="h-3 w-3 text-info" />
                </div>
                <div>
                  <h4 className="font-medium">Meertalig</h4>
                  <p className="text-sm text-muted-foreground">
                    Nederlands, Engels en Turks - perfect voor internationale projecten.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="p-8 animate-slide-up">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">€29</div>
              <div className="text-muted-foreground mb-4">per maand</div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Onbeperkte tijdregistratie
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Professionele facturen
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Mobile & web apps
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Nederlandse support
                </li>
              </ul>
              <Button variant="premium" className="w-full">
                <a href="/dashboard">Probeer 30 Dagen Gratis</a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};