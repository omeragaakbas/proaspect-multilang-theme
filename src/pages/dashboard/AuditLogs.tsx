import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, FileText, Clock, AlertCircle } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const AuditLogs = () => {
  const { logs, isLoading } = useAuditLogs();

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <FileText className="h-4 w-4" />;
    if (action.includes('update')) return <Clock className="h-4 w-4" />;
    if (action.includes('delete')) return <AlertCircle className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'default';
    if (action.includes('update')) return 'secondary';
    if (action.includes('delete')) return 'destructive';
    return 'outline';
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
                  <h1 className="text-2xl font-semibold">Audit Logs</h1>
                  <p className="text-muted-foreground">
                    Bekijk alle activiteiten en wijzigingen in je account
                  </p>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 space-y-6 p-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <CardTitle>Activiteiten Geschiedenis</CardTitle>
                  </div>
                  <CardDescription>
                    Chronologisch overzicht van alle acties in je account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Laden...
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nog geen activiteiten</h3>
                      <p className="text-muted-foreground">
                        Alle acties in je account worden hier gelogd
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="p-2 bg-muted rounded-lg">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getActionColor(log.action) as any}>
                                {log.action}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                op {log.resource_type}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {format(new Date(log.created_at), 'd MMM yyyy HH:mm', { locale: nl })}
                            </div>
                            {log.details && Object.keys(log.details).length > 0 && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono">
                                {JSON.stringify(log.details, null, 2)}
                              </div>
                            )}
                          </div>
                          {log.user_agent && (
                            <div className="text-xs text-muted-foreground max-w-xs truncate">
                              {log.user_agent}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default AuditLogs;
