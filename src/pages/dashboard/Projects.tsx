import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FolderOpen, Archive, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Projects = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // Mock data - replace with actual Supabase query
  const projects = [
    {
      id: '1',
      name: 'Website Redesign',
      code: 'WEB-001',
      client: 'Acme Corp',
      hourlyRate: 75,
      description: 'Complete redesign van de bedrijfswebsite',
      archived: false
    },
    {
      id: '2',
      name: 'API Development',
      code: 'API-001',
      client: 'TechStart BV',
      hourlyRate: 85,
      description: 'REST API ontwikkeling voor mobile app',
      archived: false
    },
    {
      id: '3',
      name: 'Database Optimalisatie',
      code: 'DB-001',
      client: 'DataCorp NL',
      hourlyRate: 95,
      description: 'Performance verbetering database queries',
      archived: false
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Add Supabase insert logic
    toast({
      title: "Project aangemaakt",
      description: `${projectName} is succesvol toegevoegd.`,
    });
    
    setIsDialogOpen(false);
    setProjectName('');
    setProjectCode('');
    setProjectDescription('');
    setHourlyRate('');
  };

  return (
    <DashboardLayout>
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar />
          
          <main className="flex-1 p-8 bg-gradient-subtle">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Projecten</h1>
                  <p className="text-muted-foreground">
                    Beheer al je projecten en uurtarieven
                  </p>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nieuw Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <form onSubmit={handleSubmit}>
                      <DialogHeader>
                        <DialogTitle>Nieuw Project</DialogTitle>
                        <DialogDescription>
                          Voeg een nieuw project toe aan je systeem
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Projectnaam *</Label>
                          <Input
                            id="name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Website Redesign"
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="code">Projectcode</Label>
                          <Input
                            id="code"
                            value={projectCode}
                            onChange={(e) => setProjectCode(e.target.value)}
                            placeholder="WEB-001"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="description">Omschrijving</Label>
                          <Textarea
                            id="description"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="Beschrijf het project..."
                            rows={3}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="rate">Uurtarief (€)</Label>
                          <Input
                            id="rate"
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="75.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Annuleren
                        </Button>
                        <Button type="submit">Project aanmaken</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Actieve Projecten</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projects.filter(p => !p.archived).length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Gemiddeld Tarief</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      €{(projects.reduce((sum, p) => sum + p.hourlyRate, 0) / projects.length).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Totaal Projecten</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projects.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Projects List */}
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
                              {project.name}
                              {project.archived && (
                                <Badge variant="secondary">
                                  <Archive className="h-3 w-3 mr-1" />
                                  Gearchiveerd
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {project.code && <span className="font-mono">{project.code}</span>}
                              {project.code && ' • '}
                              {project.client}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <div className="text-sm text-muted-foreground">Uurtarief</div>
                            <div className="text-lg font-bold">€{project.hourlyRate}</div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {project.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {projects.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Geen projecten gevonden</h3>
                    <p className="text-muted-foreground mb-4">
                      Begin met het toevoegen van je eerste project
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nieuw Project
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default Projects;
