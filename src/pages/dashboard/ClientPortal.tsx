import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useClientAccess } from '@/hooks/useClientAccess';
import { useClients } from '@/hooks/useClients';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Key, Mail, Trash2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function ClientPortal() {
  const { accessTokens, isLoading, createAccessToken, revokeAccess } = useClientAccess();
  const { clients } = useClients();
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState('');
  const [email, setEmail] = useState('');

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !email) return;

    await createAccessToken.mutateAsync({ clientId: selectedClientId, email });
    setEmail('');
    setSelectedClientId('');
  };

  const copyPortalLink = (token: string) => {
    const link = `${window.location.origin}/client-portal?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link gekopieerd',
      description: 'De portal link is naar je klembord gekopieerd.',
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <DashboardLayout>
          <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Client Portal</h1>
                <p className="text-muted-foreground">Geef klanten toegang tot hun facturen</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Nieuwe Client Toegang
                </CardTitle>
                <CardDescription>
                  Geef een klant toegang tot hun facturen via het client portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAccess} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="client">Client</Label>
                      <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer een client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name_i18n.nl}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="client@bedrijf.nl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={createAccessToken.isPending}>
                    <Mail className="mr-2 h-4 w-4" />
                    Toegang Aanmaken
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actieve Toegangen</CardTitle>
                <CardDescription>
                  Beheer client toegangen tot het portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Laden...</p>
                ) : accessTokens.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nog geen client toegangen aangemaakt
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Aangemaakt</TableHead>
                        <TableHead>Laatst Gebruikt</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessTokens.map((access: any) => (
                        <TableRow key={access.id}>
                          <TableCell className="font-medium">
                            {access.clients?.name_i18n?.nl || 'Onbekend'}
                          </TableCell>
                          <TableCell>{access.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(access.created_at), 'dd MMM yyyy', { locale: nl })}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {access.last_used_at
                              ? format(new Date(access.last_used_at), 'dd MMM yyyy HH:mm', { locale: nl })
                              : 'Nooit'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyPortalLink(access.token)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeAccess.mutate(access.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </div>
    </SidebarProvider>
  );
}
