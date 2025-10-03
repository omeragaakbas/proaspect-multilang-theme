import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTeam } from '@/hooks/useTeam';
import { Users, Mail, UserPlus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function Team() {
  const { invitations, isLoading, inviteMember, revokeInvitation } = useTeam();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CONTRACTOR');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await inviteMember.mutateAsync({ email, role });
    setEmail('');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <DashboardLayout>
          <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Team Beheer</h1>
                <p className="text-muted-foreground">Beheer teamleden en uitnodigingen</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Teamlid Uitnodigen
                  </CardTitle>
                  <CardDescription>
                    Nodig een nieuw teamlid uit om samen te werken
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="naam@bedrijf.nl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={inviteMember.isPending}>
                      <Mail className="mr-2 h-4 w-4" />
                      Verstuur Uitnodiging
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Overzicht
                  </CardTitle>
                  <CardDescription>
                    Actieve teamleden en openstaande uitnodigingen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Actieve Uitnodigingen</p>
                        <p className="text-sm text-muted-foreground">
                          {invitations.filter(i => !i.accepted_at).length} openstaand
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {invitations.filter(i => !i.accepted_at).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Geaccepteerd</p>
                        <p className="text-sm text-muted-foreground">
                          {invitations.filter(i => i.accepted_at).length} teamleden
                        </p>
                      </div>
                      <Badge>
                        {invitations.filter(i => i.accepted_at).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Uitnodigingen</CardTitle>
                <CardDescription>
                  Beheer alle verstuurde uitnodigingen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Laden...</p>
                ) : invitations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nog geen uitnodigingen verstuurd
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verstuurd</TableHead>
                        <TableHead>Verloopt</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">{invitation.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{invitation.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {invitation.accepted_at ? (
                              <Badge>Geaccepteerd</Badge>
                            ) : (
                              <Badge variant="secondary">In afwachting</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(invitation.created_at), 'dd MMM yyyy', { locale: nl })}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(invitation.expires_at), 'dd MMM yyyy', { locale: nl })}
                          </TableCell>
                          <TableCell>
                            {!invitation.accepted_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeInvitation.mutate(invitation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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
