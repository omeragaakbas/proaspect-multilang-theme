import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Plus,
  Search,
  Building,
  Mail,
  User,
  MoreHorizontal,
  Edit,
  Archive,
  Loader2,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClients, Client } from '@/hooks/useClients';

const Clients = () => {
  const { t, i18n } = useTranslation();
  const { clients, isLoading, createClient, updateClient, archiveClient } = useClients();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [archivingClientId, setArchivingClientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    billing_email: '',
    street: '',
    postal_code: '',
    city: '',
    country: 'Nederland',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    billing_email: '',
    street: '',
    postal_code: '',
    city: '',
    country: '',
  });

  const getLocalizedName = (nameI18n: any) => {
    if (!nameI18n || typeof nameI18n !== 'object') return '';
    const lang = i18n.language as 'nl' | 'en' | 'tr';
    return nameI18n[lang] || nameI18n.nl || nameI18n.en || nameI18n.tr || '';
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    createClient({
      name: formData.name,
      contact_name: formData.contact_name || undefined,
      contact_email: formData.contact_email || undefined,
      billing_email: formData.billing_email || undefined,
      address_json: {
        street: formData.street || undefined,
        postal_code: formData.postal_code || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
      },
    });
    setShowNewClientDialog(false);
    setFormData({ name: '', contact_name: '', contact_email: '', billing_email: '', street: '', postal_code: '', city: '', country: 'Nederland' });
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setEditFormData({
      name: getLocalizedName(client.name_i18n),
      contact_name: client.contact_name || '',
      contact_email: client.contact_email || '',
      billing_email: client.billing_email || '',
      street: client.address_json?.street || '',
      postal_code: client.address_json?.postal_code || '',
      city: client.address_json?.city || '',
      country: client.address_json?.country || '',
    });
  };

  const handleEditClient = () => {
    if (!editingClient) return;
    updateClient({
      id: editingClient.id,
      name: editFormData.name,
      contact_name: editFormData.contact_name || undefined,
      contact_email: editFormData.contact_email || undefined,
      billing_email: editFormData.billing_email || undefined,
      address_json: {
        street: editFormData.street || undefined,
        postal_code: editFormData.postal_code || undefined,
        city: editFormData.city || undefined,
        country: editFormData.country || undefined,
      },
    });
    setEditingClient(null);
  };

  const handleArchiveClient = () => {
    if (!archivingClientId) return;
    archiveClient(archivingClientId);
    setArchivingClientId(null);
  };

  const filteredClients = clients.filter(client => {
    const name = getLocalizedName(client.name_i18n);
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

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
                  <h1 className="text-2xl font-semibold">{t('clients.title')}</h1>
                  <p className="text-muted-foreground">{t('clients.subtitle')}</p>
                </div>
                <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t('clients.newClient')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{t('clients.addNewClient')}</DialogTitle>
                      <DialogDescription>{t('clients.addNewClientDesc')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateClient} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientName">{t('clients.companyName')} *</Label>
                          <Input
                            id="clientName"
                            placeholder="ACME Corporation"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactName">{t('clients.contactPerson')}</Label>
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
                          <Label htmlFor="contactEmail">{t('clients.email')}</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            placeholder="john@acme.com"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingEmail">{t('clients.billingEmail')}</Label>
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
                        <Label>{t('clients.address')}</Label>
                        <div className="space-y-2">
                          <Input
                            placeholder={t('clients.streetPlaceholder')}
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
                        <Button variant="outline" className="flex-1" type="button" onClick={() => setShowNewClientDialog(false)}>
                          {t('common.cancel')}
                        </Button>
                        <Button variant="hero" className="flex-1" type="submit">
                          {t('clients.addClient')}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            <div className="flex-1 space-y-6 p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('clients.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('clients.totalClients')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{clients.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('clients.activeClients')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{clients.length}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                      <Card key={client.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {getLocalizedName(client.name_i18n)}
                              </CardTitle>
                              <Badge variant="default">{t('clients.active')}</Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(client)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setArchivingClientId(client.id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  {t('clients.archive')}
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
                              <div className="text-muted-foreground text-xs">{t('clients.noContact')}</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredClients.length === 0 && (
                    <div className="text-center py-12">
                      <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t('clients.noClientsFound')}</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? t('clients.tryDifferentSearch') : t('clients.startByAdding')}
                      </p>
                      {!searchTerm && (
                        <Button variant="hero" onClick={() => setShowNewClientDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          {t('clients.addFirstClient')}
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>

        <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('clients.editClient')}</DialogTitle>
              <DialogDescription>{t('clients.editClientDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('clients.companyName')}</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('clients.contactPerson')}</Label>
                  <Input
                    value={editFormData.contact_name}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('clients.email')}</Label>
                  <Input
                    type="email"
                    value={editFormData.contact_email}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('clients.billingEmail')}</Label>
                  <Input
                    type="email"
                    value={editFormData.billing_email}
                    onChange={(e) => setEditFormData({ ...editFormData, billing_email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('clients.address')}</Label>
                <Input
                  placeholder={t('clients.streetPlaceholder')}
                  value={editFormData.street}
                  onChange={(e) => setEditFormData({ ...editFormData, street: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="1234AB"
                    value={editFormData.postal_code}
                    onChange={(e) => setEditFormData({ ...editFormData, postal_code: e.target.value })}
                  />
                  <Input
                    placeholder="Amsterdam"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  />
                </div>
                <Input
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingClient(null)}>{t('common.cancel')}</Button>
              <Button onClick={handleEditClient}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!archivingClientId} onOpenChange={(open) => !open && setArchivingClientId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('clients.archiveClient')}</AlertDialogTitle>
              <AlertDialogDescription>{t('clients.archiveClientConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchiveClient}>{t('clients.archive')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Clients;
