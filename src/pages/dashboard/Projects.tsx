import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, FolderOpen, Archive, Edit, MoreHorizontal } from 'lucide-react';
import { useProjects, Project } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';

const Projects = () => {
  const { t, i18n } = useTranslation();
  const { projects, isLoading, createProject, updateProject, archiveProject } = useProjects();
  const { clients } = useClients();

  const getLocalizedName = (nameI18n: any) => {
    if (!nameI18n || typeof nameI18n !== 'object') return '';
    const lang = i18n.language as 'nl' | 'en' | 'tr';
    return nameI18n[lang] || nameI18n.nl || nameI18n.en || nameI18n.tr || '';
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editClientId, setEditClientId] = useState('');
  const [archivingProjectId, setArchivingProjectId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    createProject({
      name: projectName,
      code: projectCode || undefined,
      description: projectDescription || undefined,
      client_id: selectedClientId,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
    });

    setIsDialogOpen(false);
    setProjectName('');
    setProjectCode('');
    setProjectDescription('');
    setHourlyRate('');
    setSelectedClientId('');
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setEditName(getLocalizedName(project.name_i18n));
    setEditCode(project.code || '');
    setEditDescription(getLocalizedName(project.description_i18n));
    setEditRate(project.hourly_rate ? (project.hourly_rate / 100).toString() : '');
    setEditClientId(project.client_id);
  };

  const handleEdit = () => {
    if (!editingProject || !editName) return;
    updateProject({
      id: editingProject.id,
      name: editName,
      code: editCode || undefined,
      description: editDescription || undefined,
      client_id: editClientId,
      hourly_rate: editRate ? parseFloat(editRate) : undefined,
    });
    setEditingProject(null);
  };

  const handleArchive = () => {
    if (!archivingProjectId) return;
    archiveProject(archivingProjectId);
    setArchivingProjectId(null);
  };

  return (
    <DashboardLayout>
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar />

          <main className="flex-1 p-8 bg-gradient-subtle">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{t('projects.title')}</h1>
                  <p className="text-muted-foreground">{t('projects.subtitle')}</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t('projects.newProject')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <form onSubmit={handleSubmit}>
                      <DialogHeader>
                        <DialogTitle>{t('projects.newProject')}</DialogTitle>
                        <DialogDescription>{t('projects.addProjectDesc')}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">{t('projects.projectNameRequired')}</Label>
                          <Input id="name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Website Redesign" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="client">{t('projects.clientRequired')}</Label>
                          <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
                            <SelectTrigger><SelectValue placeholder={t('projects.selectClient')} /></SelectTrigger>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>{getLocalizedName(client.name_i18n)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="code">{t('projects.projectCode')}</Label>
                          <Input id="code" value={projectCode} onChange={(e) => setProjectCode(e.target.value)} placeholder="WEB-001" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">{t('projects.description')}</Label>
                          <Textarea id="description" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder={t('projects.describeProject')} rows={3} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="rate">{t('projects.hourlyRateEur')}</Label>
                          <Input id="rate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="75.00" step="0.01" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                        <Button type="submit">{t('projects.createProject')}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">{t('projects.activeProjects')}</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{projects.filter(p => !p.archived).length}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">{t('projects.averageRate')}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projects.length > 0 && projects.some(p => p.hourly_rate)
                        ? `€${(projects.reduce((sum, p) => sum + (p.hourly_rate || 0), 0) / projects.filter(p => p.hourly_rate).length / 100).toFixed(2)}`
                        : '€0.00'
                      }
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">{t('projects.totalProjects')}</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{projects.length}</div></CardContent>
                </Card>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
              ) : (
                <div className="grid gap-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <FolderOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {getLocalizedName(project.name_i18n)}
                                {project.archived && (
                                  <Badge variant="secondary">
                                    <Archive className="h-3 w-3 mr-1" />
                                    {t('projects.archived')}
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {project.code && <span className="font-mono">{project.code}</span>}
                                {project.code && ' • '}
                                {getLocalizedName(project.client?.name_i18n)}
                              </CardDescription>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {project.hourly_rate && (
                              <div className="text-right mr-4">
                                <div className="text-sm text-muted-foreground">{t('projects.hourlyRate')}</div>
                                <div className="text-lg font-bold">€{(project.hourly_rate / 100).toFixed(2)}</div>
                              </div>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(project)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setArchivingProjectId(project.id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  {t('projects.archiveProject')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      {project.description_i18n && getLocalizedName(project.description_i18n) && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{getLocalizedName(project.description_i18n)}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {projects.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('projects.noProjectsFound')}</h3>
                    <p className="text-muted-foreground mb-4">{t('projects.startAdding')}</p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('projects.newProject')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>

        <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{t('projects.editProject')}</DialogTitle>
              <DialogDescription>{t('projects.editProjectDesc')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('projects.projectNameRequired')}</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>{t('projects.clientRequired')}</Label>
                <Select value={editClientId} onValueChange={setEditClientId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{getLocalizedName(client.name_i18n)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('projects.projectCode')}</Label>
                <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>{t('projects.description')}</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid gap-2">
                <Label>{t('projects.hourlyRateEur')}</Label>
                <Input type="number" value={editRate} onChange={(e) => setEditRate(e.target.value)} step="0.01" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProject(null)}>{t('common.cancel')}</Button>
              <Button onClick={handleEdit}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!archivingProjectId} onOpenChange={(open) => !open && setArchivingProjectId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('projects.archiveProject')}</AlertDialogTitle>
              <AlertDialogDescription>{t('projects.archiveProjectConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive}>{t('projects.archiveProject')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Projects;
