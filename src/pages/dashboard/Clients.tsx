import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Plus, 
  Search, 
  Building, 
  Mail, 
  User, 
  MapPin, 
  MoreHorizontal,
  Edit,
  Archive,
  Loader2
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    billing_email: '',
    street: '',
    postal_code: '',
    city: '',
    country: 'Nederland'
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('contractor_id', user?.id)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Fout',
        description: 'Kon klanten niet laden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          contractor_id: user?.id,
          name_i18n: { nl: formData.name, en: formData.name, tr: formData.name },
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          billing_email: formData.billing_email,
          address_json: {
            street: formData.street,
            postal_code: formData.postal_code,
            city: formData.city,
            country: formData.country
          }
        });

      if (error) throw error;

      toast({
        title: 'Succes',
        description: 'Klant succesvol toegevoegd'
      });

      setShowNewClientDialog(false);
      setFormData({
        name: '',
        contact_name: '',
        contact_email: '',
        billing_email: '',
        street: '',
        postal_code: '',
        city: '',
        country: 'Nederland'
      });
      fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Fout',
        description: 'Kon klant niet toevoegen',
        variant: 'destructive'
      });
    }
  };

  const handleArchiveClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ archived: true })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: 'Succes',
        description: 'Klant gearchiveerd'
      });

      fetchClients();
    } catch (error) {
      console.error('Error archiving client:', error);
      toast({
        title: 'Fout',
        description: 'Kon klant niet archiveren',
        variant: 'destructive'
      });
    }
  };

  const filteredClients = clients.filter(client => {
    const name = client.name_i18n?.nl || client.name_i18n?.en || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

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
                  <h1 className="text-2xl font-semibold">Klanten</h1>
                  <p className="text-muted-foreground">
                    Beheer je klanten en contactgegevens
                  </p>
                </div>
                <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nieuwe klant
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Nieuwe klant toevoegen</DialogTitle>
                      <DialogDescription>
                        Voeg een nieuwe klant toe aan je portfolio
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateClient} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientName">Bedrijfsnaam *</Label>
                          <Input 
                            id="clientName" 
                            placeholder="ACME Corporation" 
                            required 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Contactpersoon</Label>
                          <Input 
                            id="contactName" 
                            placeholder="John Doe" 
                            value={formData.contact_name}
                            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">E-mailadres</Label>
                          <Input 
                            id="contactEmail" 
                            type="email" 
                            placeholder="john@acme.com" 
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingEmail">Factuur e-mail</Label>
                          <Input 
                            id="billingEmail" 
                            type="email" 
                            placeholder="billing@acme.com" 
                            value={formData.billing_email}
                            onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adres</Label>
                        <div className="space-y-2">
                          <Input 
                            placeholder="Straatnaam 123" 
                            value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input 
                              placeholder="1234AB" 
                              value={formData.postal_code}
                              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                            />
                            <Input 
                              placeholder="Amsterdam" 
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                          </div>
                          <Input 
                            placeholder="Nederland" 
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1" 
                          type="button"
                          onClick={() => setShowNewClientDialog(false)}
                        >
                          Annuleren
                        </Button>
                        <Button variant="hero" className="flex-1" type="submit">
                          Klant toevoegen
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 space-y-6 p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek klanten..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  Filter
                </Button>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Totaal klanten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clients.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Actieve klanten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {clients.filter(c => c.status === 'active').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Totaal projecten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {clients.reduce((sum, c) => sum + c.projects_count, 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Clients List */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {client.name_i18n?.nl || client.name_i18n?.en || 'Geen naam'}
                          </CardTitle>
                          <Badge variant={client.archived ? 'secondary' : 'default'}>
                            {client.archived ? 'Gearchiveerd' : 'Actief'}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Bewerken
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchiveClient(client.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archiveren
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        {client.contact_email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {client.contact_email}
                          </div>
                        )}
                        {client.contact_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {client.contact_name}
                          </div>
                        )}
                        {!client.contact_email && !client.contact_name && (
                          <div className="text-muted-foreground text-xs">Geen contactgegevens</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Geen klanten gevonden</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Probeer een andere zoekterm' : 'Begin door je eerste klant toe te voegen'}
                  </p>
                  {!searchTerm && (
                    <Button variant="hero" onClick={() => setShowNewClientDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Eerste klant toevoegen
                    </Button>
                  )}
                </div>
              )}
              </>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Clients;