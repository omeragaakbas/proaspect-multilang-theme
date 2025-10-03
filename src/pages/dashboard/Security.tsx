import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Smartphone, 
  Download, 
  FileDown, 
  AlertTriangle,
  CheckCircle,
  Lock,
  Key
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Security = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleExportData = async (exportType: string) => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create export request
      const { error } = await supabase
        .from('backup_exports')
        .insert({
          user_id: user.id,
          export_type: exportType,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Export gestart',
        description: 'Je data wordt voorbereid. Je ontvangt een email wanneer het klaar is.',
      });
    } catch (error: any) {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      // In a real implementation, this would:
      // 1. Generate a TOTP secret
      // 2. Show QR code
      // 3. Verify code before enabling
      
      toast({
        title: '2FA Setup',
        description: 'Two-factor authenticatie is nog niet volledig geïmplementeerd. Gebruik Supabase Auth MFA voor volledige functionaliteit.',
      });
      
      setTwoFactorEnabled(true);
    } catch (error: any) {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      return;
    }

    try {
      // In a real implementation, this would:
      // 1. Delete all user data
      // 2. Anonymize audit logs
      // 3. Delete the account
      
      toast({
        title: 'Account verwijderen',
        description: 'Neem contact op met support om je account te verwijderen (GDPR compliance).',
      });
    } catch (error: any) {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          
          <main className="flex-1">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold">Beveiliging & Privacy</h1>
                  <p className="text-muted-foreground">
                    Beheer je accountbeveiliging en privacy instellingen
                  </p>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 space-y-6 p-6">
              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      <CardTitle>Twee-factor Authenticatie (2FA)</CardTitle>
                    </div>
                    <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                      {twoFactorEnabled ? (
                        <><CheckCircle className="h-3 w-3 mr-1" />Actief</>
                      ) : (
                        <><Lock className="h-3 w-3 mr-1" />Inactief</>
                      )}
                    </Badge>
                  </div>
                  <CardDescription>
                    Beveilig je account met een extra verificatiestap
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Twee-factor authenticatie voegt een extra beveiligingslaag toe aan je account. 
                    Je hebt dan niet alleen je wachtwoord nodig, maar ook een code van je telefoon.
                  </p>
                  <Button 
                    onClick={handleEnable2FA}
                    disabled={twoFactorEnabled}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {twoFactorEnabled ? '2FA Ingeschakeld' : '2FA Inschakelen'}
                  </Button>
                </CardContent>
              </Card>

              {/* Data Export (GDPR) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    <CardTitle>Data Export</CardTitle>
                  </div>
                  <CardDescription>
                    Download je gegevens (GDPR Compliance)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Je kunt een kopie van al je gegevens downloaden. Dit omvat je profiel, 
                      facturen, tijdsregistraties, en meer.
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleExportData('full')}
                        disabled={isExporting}
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Volledige Export
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleExportData('invoices')}
                        disabled={isExporting}
                      >
                        Alleen Facturen
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleExportData('time_entries')}
                        disabled={isExporting}
                      >
                        Alleen Tijdsregistraties
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <CardTitle>Sessie Beheer</CardTitle>
                  </div>
                  <CardDescription>
                    Bekijk je actieve sessies en recent inlogpogingen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(profile as any)?.last_login_at && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Laatste Login</span>
                          <Badge variant="outline">Actief</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date((profile as any).last_login_at).toLocaleString('nl-NL')}
                        </div>
                        {(profile as any).last_login_ip && (
                          <div className="text-xs text-muted-foreground mt-1">
                            IP: {(profile as any).last_login_ip}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {(profile as any)?.failed_login_attempts && (profile as any).failed_login_attempts > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {(profile as any).failed_login_attempts} mislukte inlogpogingen gedetecteerd
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Deletion (GDPR) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <CardTitle>Account Verwijderen</CardTitle>
                  </div>
                  <CardDescription>
                    Permanent je account en alle gegevens verwijderen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Let op:</strong> Dit verwijdert permanent alle gegevens en kan niet ongedaan worden gemaakt.
                    </AlertDescription>
                  </Alert>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Als je je account verwijdert, worden al je gegevens permanent gewist inclusief:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mb-4 space-y-1">
                    <li>Profiel en accountinformatie</li>
                    <li>Alle facturen en tijdsregistraties</li>
                    <li>Klanten en projecten</li>
                    <li>Audit logs en backups</li>
                  </ul>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Account Verwijderen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Security;
