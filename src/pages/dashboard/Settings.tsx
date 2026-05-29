import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Settings as SettingsIcon, LogOut, Bell, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { t } = useTranslation();
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

  // Notification preferences
  const defaultPrefs = {
    invoice_sent: true,
    invoice_viewed: true,
    invoice_paid: true,
    invoice_overdue: true,
    payment_reminder: true,
    time_entry_approved: true,
    time_entry_rejected: true,
    team_invitation: true,
  };
  const [notificationPrefs, setNotificationPrefs] = useState(
    (contractorProfile as any)?.notification_preferences || defaultPrefs
  );

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        name,
        preferred_locale: preferredLocale as 'nl' | 'en' | 'tr',
      });

      toast({
        title: t('settings.profileUpdated'),
        description: t('settings.profileUpdatedDesc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.unexpectedError'),
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contractor_profiles')
        .update({
          company_name: companyName,
          kvk,
          vat_number: vatNumber,
          iban,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: t('settings.businessUpdated'),
        description: t('settings.businessUpdatedDesc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.unexpectedError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contractor_profiles')
        .update({
          notification_preferences: notificationPrefs,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: t('settings.notificationsUpdated'),
        description: t('settings.notificationsUpdatedDesc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.unexpectedError'),
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
                <h1 className="text-3xl font-bold mb-2">{t('settings.title')}</h1>
                <p className="text-muted-foreground">
                  {t('settings.subtitle')}
                </p>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <CardTitle>{t('settings.personalDetails')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('settings.personalDetailsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">{t('auth.name')}</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('auth.name')}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('settings.emailCannotChange')}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="locale">{t('auth.language')}</Label>
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
                        {isLoading ? t('settings.saving') : t('common.save')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      <CardTitle>{t('settings.businessDetails')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('settings.businessDetailsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleContractorUpdate} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="companyName">{t('auth.companyName')}</Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Mijn Bedrijf BV"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="kvk">{t('auth.kvk')}</Label>
                          <Input
                            id="kvk"
                            value={kvk}
                            onChange={(e) => setKvk(e.target.value)}
                            placeholder="12345678"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="vat">{t('auth.vatNumber')}</Label>
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
                        {isLoading ? t('settings.saving') : t('common.save')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      <CardTitle>{t('settings.emailNotifications')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('settings.emailNotificationsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('settings.invoiceSent')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.invoiceSentDesc')}
                          </p>
                        </div>
                        <Switch
                          checked={notificationPrefs.invoice_sent}
                          onCheckedChange={(checked) => 
                            setNotificationPrefs(prev => ({ ...prev, invoice_sent: checked }))
                          }
                        />
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('settings.invoiceViewed')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.invoiceViewedDesc')}
                          </p>
                        </div>
                        <Switch
                          checked={notificationPrefs.invoice_viewed}
                          onCheckedChange={(checked) => 
                            setNotificationPrefs(prev => ({ ...prev, invoice_viewed: checked }))
                          }
                        />
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('settings.paymentReceived')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.paymentReceivedDesc')}
                          </p>
                        </div>
                        <Switch
                          checked={notificationPrefs.invoice_paid}
                          onCheckedChange={(checked) => 
                            setNotificationPrefs(prev => ({ ...prev, invoice_paid: checked }))
                          }
                        />
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('settings.paymentReminders')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.paymentRemindersDesc')}
                          </p>
                        </div>
                        <Switch
                          checked={notificationPrefs.payment_reminder}
                          onCheckedChange={(checked) => 
                            setNotificationPrefs(prev => ({ ...prev, payment_reminder: checked }))
                          }
                        />
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('settings.overdueInvoices')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.overdueInvoicesDesc')}
                          </p>
                        </div>
                        <Switch
                          checked={notificationPrefs.invoice_overdue}
                          onCheckedChange={(checked) => 
                            setNotificationPrefs(prev => ({ ...prev, invoice_overdue: checked }))
                          }
                        />
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('settings.timeApproved')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.timeApprovedDesc')}
                          </p>
                        </div>
                        <Switch
                          checked={notificationPrefs.time_entry_approved}
                          onCheckedChange={(checked) => 
                            setNotificationPrefs(prev => ({ ...prev, time_entry_approved: checked }))
                          }
                        />
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('settings.timeRejected')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.timeRejectedDesc')}
                          </p>
                        </div>
                        <Switch
                          checked={notificationPrefs.time_entry_rejected}
                          onCheckedChange={(checked) => 
                            setNotificationPrefs(prev => ({ ...prev, time_entry_rejected: checked }))
                          }
                        />
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('settings.teamInvitations')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.teamInvitationsDesc')}
                          </p>
                        </div>
                        <Switch
                          checked={notificationPrefs.team_invitation}
                          onCheckedChange={(checked) => 
                            setNotificationPrefs(prev => ({ ...prev, team_invitation: checked }))
                          }
                        />
                      </div>

                      <Button onClick={handleNotificationUpdate} disabled={isLoading} className="w-full mt-4">
                        <Mail className="h-4 w-4 mr-2" />
                        {isLoading ? t('settings.saving') : t('settings.saveNotifications')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5" />
                      <CardTitle>{t('settings.account')}</CardTitle>
                    </div>
                    <CardDescription>
                      {t('settings.accountDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{t('settings.logoutTitle')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('settings.logoutDesc')}
                          </p>
                        </div>
                        <Button variant="outline" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('auth.logout')}
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
