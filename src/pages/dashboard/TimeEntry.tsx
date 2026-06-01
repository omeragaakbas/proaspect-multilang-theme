import React, { useState, useRef, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { nl, enUS, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  Square,
  Save,
  Send,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimeEntries, TimeEntry as TimeEntryType } from '@/hooks/useTimeEntries';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

const TimeEntry = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { timeEntries, isLoading, createTimeEntry, editTimeEntry, deleteTimeEntry } = useTimeEntries();
  const { projects } = useProjects();

  const dateLocale = i18n.language === 'tr' ? tr : i18n.language === 'en' ? enUS : nl;

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimer, setCurrentTimer] = useState('00:00:00');
  const timerStartedAt = useRef<number | null>(null);
  const timerProjectId = useRef<string>('');

  const [editingEntry, setEditingEntry] = useState<TimeEntryType | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const [selectedProject, setSelectedProject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  const [editProject, setEditProject] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  useEffect(() => {
    if (!isTimerRunning) return;

    if (!timerStartedAt.current) {
      timerStartedAt.current = Date.now();
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStartedAt.current!) / 1000);
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60);
      const s = elapsed % 60;
      setCurrentTimer(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const weekStart = startOfWeek(currentWeek, { locale: dateLocale });
  const weekEnd = endOfWeek(currentWeek, { locale: dateLocale });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getLocalizedName = (nameI18n: any) => {
    if (!nameI18n || typeof nameI18n !== 'object') return '';
    const lang = i18n.language as 'nl' | 'en' | 'tr';
    return nameI18n[lang] || nameI18n.nl || nameI18n.en || nameI18n.tr || '';
  };

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
    const key = status.toLowerCase();
    return t(`time.${key}`, t('common.unknown'));
  };

  const getDayEntries = (date: Date) => {
    return timeEntries.filter(entry =>
      format(new Date(entry.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getDayTotal = (date: Date) => {
    return getDayEntries(date).reduce((total, entry) => total + Number(entry.hours), 0);
  };

  const weekTotal = weekDays.reduce((sum, day) => sum + getDayTotal(day), 0);

  const startTimer = () => {
    timerStartedAt.current = Date.now();
    setIsTimerRunning(true);
  };

  const stopTimer = useCallback(() => {
    if (!timerStartedAt.current) return;

    const elapsed = (Date.now() - timerStartedAt.current) / 1000 / 3600;
    const roundedHours = Math.round(elapsed * 4) / 4;

    setIsTimerRunning(false);
    setCurrentTimer('00:00:00');

    setHours(roundedHours > 0 ? roundedHours.toString() : '0.25');
    setSelectedDate(new Date());
    setSelectedProject(timerProjectId.current || '');
    setShowNewEntryDialog(true);

    timerStartedAt.current = null;
  }, []);

  const handleSaveTimeEntry = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (!selectedDate || !selectedProject || !hours) {
      toast({
        title: t('time.validationError'),
        description: t('time.validationDesc'),
        variant: 'destructive',
      });
      return;
    }

    createTimeEntry({
      date: selectedDate,
      project_id: selectedProject,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      hours: parseFloat(hours),
      description: description || undefined,
      status,
    });

    setShowNewEntryDialog(false);
    setSelectedDate(undefined);
    setSelectedProject('');
    setStartTime('');
    setEndTime('');
    setHours('');
    setDescription('');
  };

  const openEditDialog = (entry: TimeEntryType) => {
    setEditingEntry(entry);
    setEditProject(entry.project_id);
    setEditHours(String(entry.hours));
    setEditDescription(entry.description || '');
    setEditStartTime(entry.start_time || '');
    setEditEndTime(entry.end_time || '');
  };

  const handleEditEntry = () => {
    if (!editingEntry || !editProject || !editHours) return;

    editTimeEntry({
      id: editingEntry.id,
      project_id: editProject,
      hours: parseFloat(editHours),
      description: editDescription || undefined,
      start_time: editStartTime || undefined,
      end_time: editEndTime || undefined,
    });

    setEditingEntry(null);
  };

  const handleDeleteEntry = () => {
    if (!deletingEntryId) return;
    deleteTimeEntry(deletingEntryId);
    setDeletingEntryId(null);
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
                  <h1 className="text-2xl font-semibold">{t('time.title')}</h1>
                  <p className="text-muted-foreground">
                    {t('time.subtitle')}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm">{currentTimer}</span>
                  <Button
                    size="sm"
                    variant={isTimerRunning ? "destructive" : "default"}
                    onClick={isTimerRunning ? () => setIsTimerRunning(false) : startTimer}
                  >
                    {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  {isTimerRunning && (
                    <Button size="sm" variant="outline" onClick={stopTimer}>
                      <Square className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t('time.addEntry')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{t('time.newEntry')}</DialogTitle>
                      <DialogDescription>
                        {t('time.addEntryDesc')}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('time.date')}</label>
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
                              {selectedDate ? format(selectedDate, "PPP", { locale: dateLocale }) : <span>{t('common.selectDate')}</span>}
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
                        <label className="text-sm font-medium">{t('time.project')}</label>
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('time.selectProject')} />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                <div>
                                  <div className="font-medium">{getLocalizedName(project.name_i18n)}</div>
                                  {project.client && <div className="text-sm text-muted-foreground">{getLocalizedName(project.client.name_i18n)}</div>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t('time.startTime')}</label>
                          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t('time.endTime')}</label>
                          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('time.hours')}</label>
                        <Input type="number" step="0.25" min="0" placeholder="0.0" value={hours} onChange={(e) => setHours(e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('time.description')}</label>
                        <Textarea placeholder={t('time.whatDidYouDo')} value={description} onChange={(e) => setDescription(e.target.value)} />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleSaveTimeEntry('DRAFT')}
                          type="button"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {t('time.saveAsDraft')}
                        </Button>
                        <Button
                          variant="hero"
                          className="flex-1"
                          onClick={() => handleSaveTimeEntry('SUBMITTED')}
                          type="button"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {t('time.saveAndSubmit')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            <div className="flex-1 space-y-6 p-6">
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
                    {t('time.week')} {format(weekStart, 'd MMM', { locale: dateLocale })} - {format(weekEnd, 'd MMM yyyy', { locale: dateLocale })}
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
                    {t('time.thisWeek')}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  {t('time.totalThisWeek')}: <strong>{weekTotal.toFixed(1)} {t('time.hours').toLowerCase()}</strong>
                </div>
              </div>

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
                            {format(day, 'EEE', { locale: dateLocale })}
                          </CardTitle>
                          <CardDescription className="text-lg font-semibold">
                            {format(day, 'd', { locale: dateLocale })}
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
                          <div
                            key={entry.id}
                            className={cn(
                              "text-xs bg-muted/50 p-2 rounded group relative",
                              entry.status === 'DRAFT' && "cursor-pointer hover:bg-muted"
                            )}
                            onClick={() => entry.status === 'DRAFT' && openEditDialog(entry)}
                          >
                            <div className="font-medium truncate">{getLocalizedName(entry.project?.name_i18n)}</div>
                            <div className="text-muted-foreground truncate">{getLocalizedName(entry.project?.client?.name_i18n)}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span>{entry.hours}h</span>
                              <Badge variant={getStatusColor(entry.status)} className="text-xs">
                                {getStatusText(entry.status)}
                              </Badge>
                            </div>
                            {entry.status === 'DRAFT' && (
                              <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={(e) => { e.stopPropagation(); openEditDialog(entry); }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-destructive"
                                  onClick={(e) => { e.stopPropagation(); setDeletingEntryId(entry.id); }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
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
                          {t('time.add')}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </main>
        </div>

        <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('time.editEntry')}</DialogTitle>
              <DialogDescription>{t('time.editEntryDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('time.project')}</label>
                <Select value={editProject} onValueChange={setEditProject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {getLocalizedName(project.name_i18n)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('time.startTime')}</label>
                  <Input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('time.endTime')}</label>
                  <Input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('time.hours')}</label>
                <Input type="number" step="0.25" min="0" value={editHours} onChange={(e) => setEditHours(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('time.description')}</label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingEntry(null)}>{t('common.cancel')}</Button>
              <Button onClick={handleEditEntry}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingEntryId} onOpenChange={(open) => !open && setDeletingEntryId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('time.deleteEntry')}</AlertDialogTitle>
              <AlertDialogDescription>{t('time.deleteEntryConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEntry}>{t('common.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
    </DashboardLayout>
  );
};

export default TimeEntry;
