import React, { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useToast } from '@/hooks/use-toast';

const Approvals = () => {
  const { timeEntries, isLoading, updateTimeEntry } = useTimeEntries();
  const { toast } = useToast();
  
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const pendingSubmissions = timeEntries.filter(s => s.status === 'SUBMITTED');
  const processedSubmissions = timeEntries.filter(s => ['APPROVED', 'REJECTED'].includes(s.status));

  const handleApprove = (entryId: string) => {
    updateTimeEntry({
      id: entryId,
      status: 'APPROVED',
    });
    
    toast({
      title: 'Tijdsregistratie goedgekeurd',
      description: 'De tijdsregistratie is goedgekeurd.',
    });
  };

  const handleReject = (entryId: string) => {
    setSelectedEntry(timeEntries.find(s => s.id === entryId) || null);
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = () => {
    if (selectedEntry && rejectionReason.trim()) {
      updateTimeEntry({
        id: selectedEntry.id,
        status: 'REJECTED',
        rejection_reason: rejectionReason,
      });
      
      toast({
        title: 'Tijdsregistratie afgewezen',
        description: 'De tijdsregistratie is afgewezen.',
        variant: 'destructive',
      });
      
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedEntry(null);
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}u ${m}m` : `${h}u`;
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
                  <h1 className="text-2xl font-semibold">Goedkeuringen</h1>
                  <p className="text-muted-foreground">
                    Beoordeel en keur tijdsregistraties goed
                  </p>
                </div>
                {pendingSubmissions.length > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {pendingSubmissions.length} wachtend
                  </Badge>
                )}
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 space-y-6 p-6">
              {/* Alert for pending submissions */}
              {pendingSubmissions.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Er zijn {pendingSubmissions.length} tijdsregistraties die wachten op goedkeuring.
                  </AlertDescription>
                </Alert>
              )}

              {/* Pending Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Wachtend op goedkeuring ({pendingSubmissions.length})
                  </CardTitle>
                  <CardDescription>
                    Ingediende tijdsregistraties die beoordeling vereisen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingSubmissions.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Geen wachtende inzendingen</h3>
                      <p className="text-muted-foreground">
                        Alle tijdsregistraties zijn beoordeeld
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingSubmissions.map((submission) => {
                        const projectName = submission.project && typeof submission.project.name_i18n === 'object'
                          ? submission.project.name_i18n.nl || submission.project.name_i18n.en || submission.project.name_i18n.tr
                          : '';
                        const clientName = submission.project?.client && typeof submission.project.client.name_i18n === 'object'
                          ? submission.project.client.name_i18n.nl || submission.project.client.name_i18n.en || submission.project.client.name_i18n.tr
                          : '';
                        
                        return (
                          <div key={submission.id} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                  <User className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                  <div className="font-medium">Tijdsregistratie</div>
                                  <div className="text-sm text-muted-foreground">
                                    Ingediend: {format(new Date(submission.submitted_at), 'dd MMM yyyy, HH:mm', { locale: nl })}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Wachtend
                              </Badge>
                            </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-muted-foreground">Project</div>
                              <div>{projectName}</div>
                              <div className="text-muted-foreground">{clientName}</div>
                            </div>
                            <div>
                              <div className="font-medium text-muted-foreground">Datum</div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(submission.date), 'dd MMM yyyy', { locale: nl })}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-muted-foreground">Uren</div>
                              <div className="font-semibold">{formatDuration(Number(submission.hours))}</div>
                            </div>
                          </div>

                          {submission.description && (
                            <div>
                              <div className="font-medium text-muted-foreground mb-2">Beschrijving</div>
                              <p className="text-sm bg-muted/50 p-3 rounded-lg">{submission.description}</p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleApprove(submission.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Goedkeuren
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleReject(submission.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Afwijzen
                            </Button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recently Processed */}
              {processedSubmissions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Recent beoordeeld ({processedSubmissions.length})
                    </CardTitle>
                    <CardDescription>
                      Laatst goedgekeurde of afgewezen tijdsregistraties
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {processedSubmissions.slice(0, 5).map((submission) => {
                        const projectName = submission.project && typeof submission.project.name_i18n === 'object'
                          ? submission.project.name_i18n.nl || submission.project.name_i18n.en || submission.project.name_i18n.tr
                          : '';
                        
                        return (
                          <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                submission.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {submission.status === 'APPROVED' ? 
                                  <CheckCircle className="h-4 w-4 text-green-600" /> :
                                  <XCircle className="h-4 w-4 text-red-600" />
                                }
                              </div>
                              <div>
                                <div className="font-medium">{projectName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDuration(Number(submission.hours))} • {format(new Date(submission.date), 'dd MMM', { locale: nl })}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={submission.status === 'APPROVED' ? 'outline' : 'destructive'}>
                                {submission.status === 'APPROVED' ? 'Goedgekeurd' : 'Afgewezen'}
                              </Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(new Date(submission.approved_at || submission.rejected_at || ''), 'dd MMM', { locale: nl })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tijdsregistratie afwijzen</DialogTitle>
            <DialogDescription>
              Geef een reden op waarom deze tijdsregistratie wordt afgewezen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reden voor afwijzing..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectDialog(false)}
              >
                Annuleren
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Afwijzen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Approvals;