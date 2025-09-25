import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Play, 
  Pause, 
  Square,
  Save,
  Send
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TimeEntry = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimer, setCurrentTimer] = useState('00:00:00');

  const weekStart = startOfWeek(currentWeek, { locale: nl });
  const weekEnd = endOfWeek(currentWeek, { locale: nl });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Mock data - will be replaced with real data from Supabase
  const projects = [
    { id: '1', name: 'Website redesign', client: 'ACME Corporation' },
    { id: '2', name: 'API ontwikkeling', client: 'TechStart BV' },
    { id: '3', name: 'Mobile app', client: 'StartupXYZ' }
  ];

  const timeEntries = [
    {
      id: '1',
      date: new Date(2024, 0, 15),
      project: 'Website redesign',
      client: 'ACME Corporation',
      hours: 4.5,
      description: 'Homepage design and responsive layout',
      status: 'SUBMITTED'
    },
    {
      id: '2',
      date: new Date(2024, 0, 16),
      project: 'API ontwikkeling',
      client: 'TechStart BV',
      hours: 6.0,
      description: 'REST API endpoints voor gebruikersbeheer',
      status: 'DRAFT'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'secondary';
      case 'SUBMITTED': return 'default';
      case 'APPROVED': return 'outline';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Concept';
      case 'SUBMITTED': return 'Ingediend';
      case 'APPROVED': return 'Goedgekeurd';
      case 'REJECTED': return 'Afgewezen';
      default: return 'Onbekend';
    }
  };

  const getDayEntries = (date: Date) => {
    return timeEntries.filter(entry => 
      format(entry.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getDayTotal = (date: Date) => {
    return getDayEntries(date).reduce((total, entry) => total + entry.hours, 0);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
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
                  <h1 className="text-2xl font-semibold">Tijdregistratie</h1>
                  <p className="text-muted-foreground">
                    Registreer je gewerkte uren per project
                  </p>
                </div>
                
                {/* Timer */}
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm">{currentTimer}</span>
                  <Button 
                    size="sm" 
                    variant={isTimerRunning ? "destructive" : "default"}
                    onClick={toggleTimer}
                  >
                    {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  {isTimerRunning && (
                    <Button size="sm" variant="outline" onClick={() => setIsTimerRunning(false)}>
                      <Square className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tijd toevoegen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Nieuwe tijdregistratie</DialogTitle>
                      <DialogDescription>
                        Voeg je gewerkte uren toe
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Datum</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon />
                              {selectedDate ? format(selectedDate, "PPP", { locale: nl }) : <span>Selecteer datum</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Project</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                <div>
                                  <div className="font-medium">{project.name}</div>
                                  <div className="text-sm text-muted-foreground">{project.client}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Start tijd</label>
                          <Input type="time" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Eind tijd</label>
                          <Input type="time" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Uren</label>
                        <Input type="number" step="0.25" min="0" placeholder="0.0" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Beschrijving</label>
                        <Textarea placeholder="Wat heb je gedaan?" />
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          Opslaan als concept
                        </Button>
                        <Button variant="hero" className="flex-1">
                          <Send className="h-4 w-4 mr-2" />
                          Opslaan & indienen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 space-y-6 p-6">
              {/* Week Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    Week {format(weekStart, 'd MMM', { locale: nl })} - {format(weekEnd, 'd MMM yyyy', { locale: nl })}
                  </h2>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentWeek(new Date())}
                  >
                    Deze week
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Totaal deze week: <strong>10.5 uur</strong>
                </div>
              </div>

              {/* Week View */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day) => {
                  const dayEntries = getDayEntries(day);
                  const dayTotal = getDayTotal(day);
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                  return (
                    <Card key={day.toISOString()} className={cn("min-h-[200px]", isToday && "ring-2 ring-primary")}>
                      <CardHeader className="pb-3">
                        <div className="text-center">
                          <CardTitle className="text-sm font-medium">
                            {format(day, 'EEE', { locale: nl })}
                          </CardTitle>
                          <CardDescription className="text-lg font-semibold">
                            {format(day, 'd', { locale: nl })}
                          </CardDescription>
                          {dayTotal > 0 && (
                            <div className="text-xs text-primary font-medium">
                              {dayTotal}h
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {dayEntries.map((entry) => (
                          <div key={entry.id} className="text-xs bg-muted/50 p-2 rounded">
                            <div className="font-medium truncate">{entry.project}</div>
                            <div className="text-muted-foreground truncate">{entry.client}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span>{entry.hours}h</span>
                              <Badge variant={getStatusColor(entry.status)} className="text-xs">
                                {getStatusText(entry.status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full h-8 text-xs"
                          onClick={() => {
                            setSelectedDate(day);
                            setShowNewEntryDialog(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Toevoegen
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default TimeEntry;