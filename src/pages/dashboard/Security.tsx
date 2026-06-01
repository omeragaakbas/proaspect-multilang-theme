import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  Smartphone,
  Download,
  FileDown,
  AlertTriangle,
  Lock,
  Key,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Security = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportData = async (exportType: string) => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('backup_exports')
        .insert({
          user_id: user.id,
          export_type: exportType,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: t('security.exportStarted'),
        description: t('security.exportStartedDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccountRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Account verwijderingsverzoek',
        message: `Gebruiker ${profile?.email || user.email} heeft verzocht om accountverwijdering.`,
        type: 'ACCOUNT_DELETE_REQUEST',
        metadata: { user_id: user.id, email: profile?.email || user.email },
      });

      toast({
        title: t('security.deleteRequested'),
        description: t('security.deleteRequestedDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
    setShowDeleteDialog(false);
  };

  return (
    <DashboardLayout>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />

          <main className="flex-1">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold">{t('security.title')}</h1>
                  <p className="text-muted-foreground">{t('security.subtitle')}</p>
                </div>
              </div>
            </header>

            <div className="flex-1 space-y-6 p-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      <CardTitle>{t('security.twoFactorTitle')}</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />{t('security.comingSoon')}
                    </Badge>
                  </div>
                  <CardDescription>{t('security.twoFactorDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{t('security.twoFactorExplanation')}</p>
                  <Button disabled>
                    <Key className="h-4 w-4 mr-2" />
                    {t('security.enable2FA')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    <CardTitle>{t('security.dataExportTitle')}</CardTitle>
                  </div>
                  <CardDescription>{t('security.dataExportDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{t('security.dataExportExplanation')}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => handleExportData('full')} disabled={isExporting}>
                        <FileDown className="h-4 w-4 mr-2" />
                        {t('security.fullExport')}
                      </Button>
                      <Button variant="outline" onClick={() => handleExportData('invoices')} disabled={isExporting}>
                        {t('security.invoicesOnly')}
                      </Button>
                      <Button variant="outline" onClick={() => handleExportData('time_entries')} disabled={isExporting}>
                        {t('security.timeEntriesOnly')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <CardTitle>{t('security.sessionTitle')}</CardTitle>
                  </div>
                  <CardDescription>{t('security.sessionDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(profile as any)?.last_login_at && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{t('security.lastLogin')}</span>
                          <Badge variant="outline">{t('security.activeBadge')}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date((profile as any).last_login_at).toLocaleString(i18n.language === 'en' ? 'en-GB' : i18n.language === 'tr' ? 'tr-TR' : 'nl-NL')}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <CardTitle>{t('security.deleteAccountTitle')}</CardTitle>
                  </div>
                  <CardDescription>{t('security.deleteAccountDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{t('security.warning')}:</strong> {t('security.deleteWarning')}
                    </AlertDescription>
                  </Alert>
                  <p className="text-sm text-muted-foreground mb-4">{t('security.deleteExplanation')}</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mb-4 space-y-1">
                    <li>{t('security.deleteItem1')}</li>
                    <li>{t('security.deleteItem2')}</li>
                    <li>{t('security.deleteItem3')}</li>
                    <li>{t('security.deleteItem4')}</li>
                  </ul>
                  <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t('security.requestDeletion')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('security.deleteAccountTitle')}</AlertDialogTitle>
              <AlertDialogDescription>{t('security.deleteConfirmDesc')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccountRequest} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('security.confirmDeletion')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Security;
