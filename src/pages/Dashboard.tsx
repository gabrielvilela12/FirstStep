import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, CheckCircle2, Star, BookOpen, Users, Target, Clock, Mail, Lock, Play, ArrowLeft } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboardingState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Supabase p/ progresso real
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
}

type ChecklistItem = {
  key: string;
  id: string;                 // normalizado p/ string
  type: "task" | "course";
  title: string;
  completed: boolean;
  courseId?: string;
};

type StageChecklist = {
  loading: boolean;
  items: ChecklistItem[];
  total: number;
  completed: number;
};

export function Dashboard({ user }: DashboardProps) {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const { state, getCurrentStage, toggleTask, navigateToCourse } = useOnboarding();
  const { user: sessionUser } = useAuth();

  // Cache dos checklists por etapa (preenchido ao abrir o Dialog)
  const [checklists, setChecklists] = useState<Record<number, StageChecklist>>({});

  // Estado para o buddy
  const [buddy, setBuddy] = useState<{ name: string; email: string } | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40';
      case 'in-progress':
        return 'bg-primary/10 dark:bg-primary/20 border-primary dark:border-primary hover:bg-primary/20 dark:hover:bg-primary/30 ring-2 ring-primary/20 dark:ring-primary/30';
      default:
        return 'bg-muted/30 dark:bg-muted/20 border-muted dark:border-muted-foreground/50 opacity-70 dark:opacity-60';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-primary" />;
      default:
        return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleTaskToggle = (stageId: number, taskId: number) => {
    toggleTask(stageId, taskId);
  };

  const handleAccessCourse = (courseId: string) => {
    navigateToCourse(courseId);
  };

  // Fetch do buddy
  useEffect(() => {
    const fetchBuddy = async () => {
      if (!sessionUser?.id) return;

      try {
        const { data: profile, error: profileError } = await supabase
          .from("onboardees")
          .select("buddy_id")
          .eq("id", sessionUser.id)
          .single();

        if (profileError) throw profileError;
        if (!profile?.buddy_id) {
          console.log("No buddy assigned");
          return;
        }

        const { data: buddyData, error: buddyError } = await supabase
          .from("onboardees")
          .select("name, email")
          .eq("id", profile.buddy_id)
          .single();

        if (buddyError) throw buddyError;
        if (buddyData) {
          setBuddy(buddyData);
        }
      } catch (error) {
        console.error("Error fetching buddy:", error);
      }
    };

    fetchBuddy();
  }, [sessionUser?.id]);

  // ---------- Carrega checklist (courses + tasks + progress) ao abrir Dialog ----------
  useEffect(() => {
    const loadChecklist = async (stageId: number) => {
      if (!sessionUser?.id) return;
      setChecklists(prev => ({
        ...prev,
        [stageId]: { loading: true, items: prev[stageId]?.items ?? [], total: prev[stageId]?.total ?? 0, completed: prev[stageId]?.completed ?? 0 }
      }));

      try {
        const [coursesRes, tasksRes, progressRes] = await Promise.all([
          supabase
            .from("courses")
            .select("id,title,stage_id,order_key")
            .eq("stage_id", stageId)
            .order("order_key", { ascending: true }),
          supabase
            .from("tasks")
            .select("id,title,type,stage_id")
            .eq("stage_id", stageId)
            .order("id", { ascending: true }),
          supabase
            .from("onboardee_progress")
            .select("task_id,course_id")
            .eq("onboardee_id", sessionUser.id),
        ]);

        if (coursesRes.error) throw coursesRes.error;
        if (tasksRes.error) throw tasksRes.error;
        if (progressRes.error) throw progressRes.error;

        const toStr = (v: any) => (v == null ? "" : String(v));

        const doneCourses = new Set(
          (progressRes.data ?? [])
            .map((r: any) => toStr(r.course_id))
            .filter((s: string) => s !== "")
        );
        const doneTasks = new Set(
          (progressRes.data ?? [])
            .map((r: any) => toStr(r.task_id))
            .filter((s: string) => s !== "")
        );

        const taskItems: ChecklistItem[] = (tasksRes.data ?? []).map((t: any) => ({
          key: `task-${t.id}`,
          id: toStr(t.id),
          type: "task",
          title: t.title,
          completed: doneTasks.has(toStr(t.id)),
        }));

        const courseItems: ChecklistItem[] = (coursesRes.data ?? []).map((c: any) => ({
          key: `course-${c.id}`,
          id: toStr(c.id),
          type: "course",
          title: c.title,
          completed: doneCourses.has(toStr(c.id)),
          courseId: toStr(c.id),
        }));

        const items = [...taskItems, ...courseItems];
        const total = items.length;
        const completed = items.filter(i => i.completed).length;

        setChecklists(prev => ({
          ...prev,
          [stageId]: { loading: false, items, total, completed }
        }));
      } catch (e) {
        console.error("Erro carregando checklist da etapa", stageId, e);
        setChecklists(prev => ({
          ...prev,
          [stageId]: { loading: false, items: [], total: 0, completed: 0 }
        }));
      }
    };

    if (selectedStage != null && !checklists[selectedStage]) {
      loadChecklist(selectedStage);
    }
  }, [selectedStage, sessionUser?.id]); // carrega uma vez por etapa aberta

  // ---------- Toggle no checklist: grava no Supabase e atualiza cache local ----------
  const handleChecklistToggle = async (stageId: number, item: ChecklistItem) => {
    if (!sessionUser?.id) return;
    const column = item.type === "course" ? "course_id" : "task_id";

    try {
      const { data: existing, error: selErr } = await supabase
        .from("onboardee_progress")
        .select("id")
        .eq("onboardee_id", sessionUser.id)
        .eq(column, item.id)
        .limit(1);
      if (selErr) throw selErr;

      if (existing && existing.length > 0) {
        // Desmarcar
        const { error: delErr } = await supabase
          .from("onboardee_progress")
          .delete()
          .eq("onboardee_id", sessionUser.id)
          .eq(column, item.id);
        if (delErr) throw delErr;

        setChecklists(prev => {
          const curr = prev[stageId]; if (!curr) return prev;
          const items = curr.items.map(i => i.key === item.key ? { ...i, completed: false } : i);
          const completed = items.filter(i => i.completed).length;
          return { ...prev, [stageId]: { ...curr, items, completed } };
        });
      } else {
        // Marcar
        const payload: any = {
          onboardee_id: sessionUser.id,
          completed_at: new Date().toISOString(),
          task_id: null,
          course_id: null,
          document_id: null,
          access_id: null,
        };
        payload[column] = item.id;

        const { error: insErr } = await supabase
          .from("onboardee_progress")
          .insert([payload]);
        if (insErr) throw insErr;

        setChecklists(prev => {
          const curr = prev[stageId]; if (!curr) return prev;
          const items = curr.items.map(i => i.key === item.key ? { ...i, completed: true } : i);
          const completed = items.filter(i => i.completed).length;
          return { ...prev, [stageId]: { ...curr, items, completed } };
        });
      }
    } catch (e) {
      console.error("Erro ao alternar checklist", e);
    }
  };

  // ---------- Derivação de status com "cadeado" (libera próxima só quando a anterior está 100%) ----------
  const derived = useMemo(() => {
    const stagesSorted = [...state.stages].sort((a, b) => a.id - b.id);
    const byId: Record<number, "blocked" | "in-progress" | "completed"> = {};
    const counts: Record<number, { completed: number; total: number }> = {};

    let gateOpen = true; // enquanto true, seguimos liberando até achar a primeira não-completa
    let currentStageId: number | null = null;

    for (const s of stagesSorted) {
      const cl = checklists[s.id];
      const total = cl?.total ?? s.totalTasks ?? 0;
      const completed = cl?.completed ?? s.completedTasks ?? 0;
      counts[s.id] = { completed, total };

      // regra de completude
      const isComplete = total > 0 ? completed >= total : (s.status === "completed");

      let status: "blocked" | "in-progress" | "completed";
      if (gateOpen) {
        if (isComplete) {
          status = "completed";
        } else {
          status = "in-progress";
          gateOpen = false; // a partir daqui, tudo depois fica bloqueado
          if (currentStageId == null) currentStageId = s.id;
        }
      } else {
        status = "blocked";
      }
      byId[s.id] = status;
    }

    // se todas completas, considera "etapa atual" a última (apenas para exibição)
    if (gateOpen && stagesSorted.length) {
      currentStageId = stagesSorted[stagesSorted.length - 1].id;
    }

    return { byId, counts, currentStageId };
  }, [state.stages, checklists]);

  // Header “Sua Etapa Atual” – usa etapa derivada (cadeado)
  const headerStage = useMemo(() => {
    const id = derived.currentStageId;
    if (!id) return getCurrentStage(); // fallback
    return state.stages.find(s => s.id === id) || getCurrentStage();
  }, [derived.currentStageId, state.stages, getCurrentStage]);

  const headerCounts = headerStage ? derived.counts[headerStage.id] : undefined;
  const headerCompleted = headerCounts?.completed ?? headerStage?.completedTasks ?? 0;
  const headerTotal = headerCounts?.total ?? headerStage?.totalTasks ?? 0;
  const headerPct = headerTotal > 0 ? Math.round((headerCompleted / headerTotal) * 100) : 0;

  return (
    <div className="flex-1 space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          FirstStep: Acompanhe aqui sua Jornada de Desenvolvimento
        </p>
      </div>

      {/* Current Stage Section */}
      {headerStage && (
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="flex-1 bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl">Sua Etapa Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{headerStage.title}</h3>
                  <p className="text-primary-foreground/80">{headerStage.subtitle}</p>
                  <p className="text-sm text-primary-foreground/70 mt-1">Período: {headerStage.period}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {headerCompleted}/{headerTotal}
                  </div>
                  <p className="text-sm text-primary-foreground/80">tarefas</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso na Etapa: {headerCompleted} de {headerTotal} tarefas concluídas</span>
                  <span>{headerPct}%</span>
                </div>
                <Progress 
                  value={headerTotal > 0 ? (headerCompleted / headerTotal) * 100 : 0} 
                  className="h-4 bg-primary-foreground [&>div]:bg-purple-500" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Buddy Contact */}
          <Card className="lg:w-1/3">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                Alguma dúvida?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Entre em contato com seu Buddy!
              </p>
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-white">
                    {buddy?.name ? buddy.name.charAt(0).toUpperCase() : 'B'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{buddy?.name || 'Buddy'}</p>
                  <p className="text-xs text-muted-foreground">Contato: {buddy?.email || 'buddy@company.com'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Complete Journey Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Sua Jornada de Onboarding</h2>
          <p className="text-muted-foreground">10 etapas para sua integração completa na empresa</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.stages.map((stage) => {
            const IconComponent =
              stage.id === 1 ? Target :
              stage.id === 2 ? BookOpen :
              stage.id === 3 ? Star :
              stage.id === 4 ? CheckCircle2 :
              stage.id === 5 ? Users :
              stage.id === 6 ? Target :
              stage.id === 7 ? Lock :
              stage.id === 8 ? MessageCircle :
              stage.id === 9 ? BookOpen : Star;

            const cl = checklists[stage.id];
            const displayStatus = derived.byId[stage.id] ?? stage.status;

            const completed = cl?.completed ?? stage.completedTasks;
            const total = cl?.total ?? stage.totalTasks;
            const pct = total > 0 ? (completed / total) * 100 : 0;

            return (
              <Card key={stage.id} className={`relative ${getStatusColor(displayStatus)} border-2 transition-all duration-200`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <IconComponent className={`h-8 w-8 ${
                      displayStatus === 'in-progress'
                        ? 'text-primary'
                        : displayStatus === 'completed'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-muted-foreground'
                    }`} />
                    {getStatusIcon(displayStatus)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <h3 className="font-semibold text-lg">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground">{stage.subtitle}</p>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                    <p className="text-xs font-medium text-muted-foreground">📅 {stage.period}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{completed}/{total}</span>
                    </div>
                    
                    <Progress value={pct} className="h-2" />
                    
                    {/* Dialog controlado — carrega checklist quando abrir */}
                    <Dialog
                      open={selectedStage === stage.id}
                      onOpenChange={(o) => setSelectedStage(o ? stage.id : null)}
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        disabled={displayStatus === 'blocked'}
                        onClick={() => setSelectedStage(stage.id)}
                      >
                        Ver Detalhes
                      </Button>

                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <IconComponent className="h-6 w-6 text-primary" />
                            {stage.title}
                          </DialogTitle>
                          <p className="text-muted-foreground">{stage.description}</p>
                          <Badge variant="outline" className="w-fit">
                            📅 {stage.period}
                          </Badge>
                        </DialogHeader>
                        
                        <div className="space-y-4 pt-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Tarefas da Etapa</h4>
                            <Badge variant="secondary">
                              {(cl?.completed ?? 0)}/{(cl?.total ?? 0)} concluídas
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            {cl?.loading && <div className="text-sm text-muted-foreground">Carregando…</div>}
                            {!cl?.loading && (cl?.items?.length ? cl.items.map((item) => {
                              const isCompleted = item.completed;
                              return (
                                <div key={item.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <Checkbox 
                                      checked={isCompleted}
                                      onCheckedChange={() => handleChecklistToggle(stage.id, item)}
                                      disabled={displayStatus === 'blocked'}
                                    />
                                    <div className="flex items-center space-x-2">
                                      {item.type === 'course' ? (
                                        <Play className="h-4 w-4 text-primary" />
                                      ) : (
                                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                                        {item.title}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {item.type === "course" && item.courseId && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      disabled={displayStatus === 'blocked'}
                                      onClick={() => handleAccessCourse(item.courseId!)}
                                    >
                                      <BookOpen className="h-4 w-4 mr-2" />
                                      Acessar Curso
                                    </Button>
                                  )}
                                </div>
                              );
                            }) : <div className="text-sm text-muted-foreground">Nenhuma tarefa encontrada.</div>)}
                          </div>
                          
                          <div className="pt-4 border-t">
                            <Button variant="ghost" className="w-full" onClick={() => setSelectedStage(null)}>
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Voltar para a Jornada
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default Dashboard;