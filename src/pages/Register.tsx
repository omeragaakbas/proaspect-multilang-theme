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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    if (formData.password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens lang zijn');
      return;
    }

    if (!formData.name || !formData.email || !formData.companyName) {
      setError('Vul alle verplichte velden in');
      return;
    }

    setLoading(true);

    const userData = {
      name: formData.name,
      companyName: formData.companyName,
      kvk: formData.kvk || null,
      vatNumber: formData.vatNumber || null,
      iban: formData.iban || null,
      defaultHourlyRate: parseInt(formData.defaultHourlyRate) * 100, // convert to cents
      preferredLocale: formData.preferredLocale,
      uiTheme: formData.uiTheme,
      role: 'CONTRACTOR'
    };

    const { error } = await signUp(formData.email, formData.password, userData);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/login', { 
        state: { 
          message: 'Registratie succesvol! Check je e-mail voor de verificatielink.' 
        }
      });
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