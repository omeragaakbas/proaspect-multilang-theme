import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex items-center justify-center py-20 px-4 gradient-subtle">
        <Card className="w-full max-w-md animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welkom Terug</CardTitle>
            <CardDescription>
              Log in op je ProAspect account om verder te gaan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="naam@bedrijf.nl"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button variant="hero" className="w-full" type="submit">
                Inloggen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="text-center text-sm">
              <a href="#" className="text-primary hover:underline">
                Wachtwoord vergeten?
              </a>
            </div>

            <Separator />

            <div className="text-center text-sm text-muted-foreground">
              Nog geen account?{' '}
              <a href="#" className="text-primary hover:underline">
                Start gratis proefperiode
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;