import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string()
    .trim()
    .email('Ongeldig e-mailadres')
    .max(255, 'E-mailadres mag maximaal 255 tekens zijn'),
  password: z.string()
    .min(6, 'Wachtwoord moet minimaal 6 tekens zijn')
    .max(100, 'Wachtwoord mag maximaal 100 tekens zijn')
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate inputs with zod
      const validatedData = loginSchema.parse({
        email: email.trim(),
        password
      });

      setLoading(true);

      const { error } = await signIn(validatedData.email, validatedData.password);

      if (error) {
        // Sanitize error messages
        console.error('Login error:', error);
        
        if (error.message.toLowerCase().includes('credential') || 
            error.message.toLowerCase().includes('password')) {
          setError('Invalid email or password');
        } else if (error.message.toLowerCase().includes('confirm') || 
                   error.message.toLowerCase().includes('verif')) {
          setError('Please verify your email address');
        } else if (error.message.toLowerCase().includes('account')) {
          setError('Account access issue - please contact support');
        } else {
          setError('Unable to sign in. Please try again.');
        }
        setLoading(false);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('Er is een fout opgetreden');
      }
      setLoading(false);
    }
  };

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
            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="naam@bedrijf.nl"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                variant="hero" 
                className="w-full" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Bezig met inloggen...' : 'Inloggen'}
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
              <Link to="/register" className="text-primary hover:underline">
                Start gratis proefperiode
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;