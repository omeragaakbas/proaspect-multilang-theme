import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string()
    .trim()
    .email('Ongeldig e-mailadres')
    .max(255, 'E-mailadres mag maximaal 255 tekens zijn'),
  password: z.string()
    .min(8, 'Wachtwoord moet minimaal 8 tekens zijn')
    .max(100, 'Wachtwoord mag maximaal 100 tekens zijn')
    .regex(/[A-Z]/, 'Wachtwoord moet minimaal één hoofdletter bevatten')
    .regex(/[a-z]/, 'Wachtwoord moet minimaal één kleine letter bevatten')
    .regex(/[0-9]/, 'Wachtwoord moet minimaal één cijfer bevatten'),
  confirmPassword: z.string(),
  name: z.string()
    .trim()
    .min(1, 'Naam is verplicht')
    .max(100, 'Naam mag maximaal 100 tekens zijn'),
  companyName: z.string()
    .trim()
    .min(1, 'Bedrijfsnaam is verplicht')
    .max(200, 'Bedrijfsnaam mag maximaal 200 tekens zijn')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    kvk: '',
    vatNumber: '',
    iban: '',
    defaultHourlyRate: '50',
    preferredLocale: 'nl' as 'nl' | 'en' | 'tr',
    uiTheme: 'SYSTEM' as 'LIGHT' | 'DARK' | 'SYSTEM'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate inputs with zod
      const validatedData = registerSchema.parse({
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name.trim(),
        companyName: formData.companyName.trim()
      });

      setLoading(true);

      const userData = {
        name: validatedData.name,
        companyName: validatedData.companyName,
        kvk: formData.kvk || null,
        vatNumber: formData.vatNumber || null,
        iban: formData.iban || null,
        defaultHourlyRate: parseInt(formData.defaultHourlyRate) * 100, // convert to cents
        preferredLocale: formData.preferredLocale,
        uiTheme: formData.uiTheme
        // Note: Role is now ALWAYS set to CONTRACTOR on server side for security
        // Only admins can assign other roles via admin functions
      };

      // Use secure signup edge function with password strength and breach checks
      const { data, error: signupError } = await supabase.functions.invoke('auth-secure-signup', {
        body: {
          email: validatedData.email,
          password: validatedData.password,
          userData,
        },
      });

      setLoading(false);

      if (signupError || data?.error) {
        setError(signupError?.message || data?.error || 'Registration failed');
      } else {
        navigate('/login', { 
          state: { 
            message: 'Registratie succesvol! Je kunt nu inloggen met je account.' 
          }
        });
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
      <main className="flex items-center justify-center py-12 px-4 gradient-subtle">
        <Card className="w-full max-w-2xl animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Registreren</CardTitle>
            <CardDescription>
              Maak een ProAspect account aan om te beginnen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Persoonlijke gegevens</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Volledige naam *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Wachtwoord *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Bevestig wachtwoord *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bedrijfsgegevens</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Bedrijfsnaam *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="companyName" 
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kvk">KvK-nummer</Label>
                    <Input 
                      id="kvk" 
                      value={formData.kvk}
                      onChange={(e) => setFormData(prev => ({ ...prev, kvk: e.target.value }))}
                      placeholder="12345678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">BTW-nummer</Label>
                    <Input 
                      id="vatNumber" 
                      value={formData.vatNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
                      placeholder="NL123456789B01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input 
                      id="iban" 
                      value={formData.iban}
                      onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                      placeholder="NL91 ABNA 0417 1643 00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Standaard uurtarief (€)</Label>
                  <Input 
                    id="hourlyRate" 
                    type="number"
                    min="1"
                    value={formData.defaultHourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultHourlyRate: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Voorkeuren</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Taal</Label>
                    <Select 
                      value={formData.preferredLocale} 
                      onValueChange={(value: 'nl' | 'en' | 'tr') => 
                        setFormData(prev => ({ ...prev, preferredLocale: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nl">Nederlands</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="tr">Türkçe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Thema</Label>
                    <Select 
                      value={formData.uiTheme} 
                      onValueChange={(value: 'LIGHT' | 'DARK' | 'SYSTEM') => 
                        setFormData(prev => ({ ...prev, uiTheme: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LIGHT">Licht</SelectItem>
                        <SelectItem value="DARK">Donker</SelectItem>
                        <SelectItem value="SYSTEM">Systeem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                variant="hero" 
                className="w-full" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Bezig met registreren...' : 'Account aanmaken'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="text-center text-sm mt-6 text-muted-foreground">
              Heb je al een account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log hier in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Register;