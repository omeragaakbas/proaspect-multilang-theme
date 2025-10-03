import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Settings as SettingsIcon, LogOut } from 'lucide-react';

const Settings = () => {
  const { profile, contractorProfile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Profile settings
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [preferredLocale, setPreferredLocale] = useState(profile?.preferred_locale || 'nl');

  // Contractor settings
  const [companyName, setCompanyName] = useState(contractorProfile?.company_name || '');
  const [kvk, setKvk] = useState(contractorProfile?.kvk || '');
  const [vatNumber, setVatNumber] = useState(contractorProfile?.vat_number || '');
  const [iban, setIban] = useState(contractorProfile?.iban || '');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        name,
        preferred_locale: preferredLocale as 'nl' | 'en' | 'tr',
      });

      toast({
        title: "Profiel bijgewerkt",
        description: "Je profielgegevens zijn succesvol opgeslagen.",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContractorUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Add Supabase update for contractor_profiles
      toast({
        title: "Bedrijfsgegevens bijgewerkt",
        description: "Je bedrijfsgegevens zijn succesvol opgeslagen.",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het opslaan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DashboardLayout>
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar />
          
          <main className="flex-1 p-8 bg-gradient-subtle">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Instellingen</h1>
                <p className="text-muted-foreground">
                  Beheer je profiel en bedrijfsgegevens
                </p>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <CardTitle>Persoonlijke Gegevens</CardTitle>
                    </div>
                    <CardDescription>
                      Werk je persoonlijke informatie bij
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Naam</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Je naam"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          E-mailadres kan niet worden gewijzigd
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="locale">Taal</Label>
                        <Select value={preferredLocale} onValueChange={(value) => setPreferredLocale(value as 'nl' | 'en' | 'tr')}>
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

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Opslaan..." : "Opslaan"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      <CardTitle>Bedrijfsgegevens</CardTitle>
                    </div>
                    <CardDescription>
                      Werk je bedrijfsinformatie bij
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleContractorUpdate} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="companyName">Bedrijfsnaam</Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Mijn Bedrijf BV"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="kvk">KVK Nummer</Label>
                          <Input
                            id="kvk"
                            value={kvk}
                            onChange={(e) => setKvk(e.target.value)}
                            placeholder="12345678"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="vat">BTW Nummer</Label>
                          <Input
                            id="vat"
                            value={vatNumber}
                            onChange={(e) => setVatNumber(e.target.value)}
                            placeholder="NL123456789B01"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="iban">IBAN</Label>
                        <Input
                          id="iban"
                          value={iban}
                          onChange={(e) => setIban(e.target.value)}
                          placeholder="NL00 BANK 0123 4567 89"
                        />
                      </div>

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Opslaan..." : "Opslaan"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5" />
                      <CardTitle>Account</CardTitle>
                    </div>
                    <CardDescription>
                      Beheer je account instellingen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Uitloggen</h4>
                          <p className="text-sm text-muted-foreground">
                            Log uit van je account
                          </p>
                        </div>
                        <Button variant="outline" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Uitloggen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Settings;
