import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types (mantidos como estavam)
interface Task {
  id: number;
  title: string;
  type: 'standard' | 'course';
  courseId?: string | null; // Ajustado para aceitar null do banco
}

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  status: 'completed' | 'in-progress' | 'blocked';
  period: string;
  completedTasks: number;
  totalTasks: number;
  tasks: Task[];
}

interface OnboardingState {
  stages: Stage[];
  currentStageId: number;
  completedTasks: Set<number>; // Usar Set para performance
  completedCourses: Set<string>; // Usar Set para performance
}

interface OnboardingContextType {
  state: OnboardingState;
  loading: boolean;
  getCurrentStage: () => Stage | undefined;
  toggleTask: (stageId: number, task: Task) => Promise<void>;
  navigateToCourse: (courseId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<OnboardingState>({
    stages: [],
    currentStageId: 1,
    completedTasks: new Set(),
    completedCourses: new Set(),
  });

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Buscar em paralelo os dados do banco
      const [
        { data: stagesData, error: stagesError },
        { data: tasksData, error: tasksError },
        { data: coursesData, error: coursesError },
        { data: progressData, error: progressError },
      ] = await Promise.all([
        supabase.from('stages').select('*').order('id', { ascending: true }),
        supabase.from('tasks').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('onboardee_progress').select('*').eq('onboardee_id', user.id),
      ]);

      if (stagesError || tasksError || coursesError || progressError) {
        throw stagesError || tasksError || coursesError || progressError;
      }

      // 2. Processar o progresso do usuário
      const completedTaskIds = new Set(progressData.map(p => p.task_id).filter(Boolean) as number[]);
      const completedCourseIds = new Set(progressData.map(p => p.course_id).filter(Boolean) as string[]);

      // 3. Montar a estrutura final das etapas
      const formattedStages = stagesData.map(stage => {
        const stageTasks: Task[] = tasksData
            .filter(t => t.stage_id === stage.id)
            .map(t => ({ id: t.id, title: t.title, type: 'standard', courseId: null }));
        
        const courseTasks: Task[] = coursesData
            .filter(c => c.stage_id === stage.id)
            .map(c => ({ id: c.id, title: c.title, type: 'course', courseId: c.id }));
        
        const allTasks = [...stageTasks, ...courseTasks];

        const completedTasksInStage = allTasks.filter(task =>
          task.type === 'standard'
            ? completedTaskIds.has(task.id)
            : (task.courseId && completedCourseIds.has(task.courseId))
        ).length;
        
        return {
          ...stage,
          tasks: allTasks,
          totalTasks: allTasks.length,
          completedTasks: completedTasksInStage,
          status: 'blocked', // Status inicial, será recalculado abaixo
        };
      });

      // 4. Calcular o status de cada etapa (in-progress, completed, blocked)
      let previousStageCompleted = true;
      for (const stage of formattedStages) {
        if (previousStageCompleted) {
          stage.status = stage.completedTasks === stage.totalTasks ? 'completed' : 'in-progress';
        } else {
          stage.status = 'blocked';
        }
        previousStageCompleted = stage.status === 'completed';
      }

      const firstInProgressStage = formattedStages.find(s => s.status === 'in-progress');

      // 5. Atualizar o estado principal
      setState({
        stages: formattedStages,
        currentStageId: firstInProgressStage ? firstInProgressStage.id : stagesData[stagesData.length - 1].id,
        completedTasks: completedTaskIds,
        completedCourses: completedCourseIds,
      });

    } catch (error) {
      console.error("Erro ao buscar dados do onboarding:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTask = async (stageId: number, task: Task) => {
    if (!user) return;

    const isStandardTask = task.type === 'standard';
    const isCompleted = isStandardTask
      ? state.completedTasks.has(task.id)
      : (task.courseId && state.completedCourses.has(task.courseId));

    if (isCompleted) {
      // --- LÓGICA PARA REMOVER O PROGRESSO (DESMARCAR) ---
      const { error } = await supabase.from('onboardee_progress').delete().match({
        onboardee_id: user.id,
        [isStandardTask ? 'task_id' : 'course_id']: isStandardTask ? task.id : task.courseId,
      });
      if (error) console.error("Erro ao remover progresso:", error);

    } else {
      // --- LÓGICA PARA ADICIONAR O PROGRESSO (MARCAR) ---
      const { error } = await supabase.from('onboardee_progress').insert({
        onboardee_id: user.id,
        task_id: isStandardTask ? task.id : null,
        course_id: !isStandardTask ? task.courseId : null,
      });
      if (error) console.error("Erro ao inserir progresso:", error);
    }
    
    // Após a alteração no banco, busca os dados novamente para garantir consistência
    await fetchData();
  };

  const getCurrentStage = () => {
    return state.stages.find(stage => stage.status === 'in-progress');
  };
  
  const navigateToCourse = (courseId: string) => {
    navigate('/courses');
    setTimeout(() => {
      const courseElement = document.getElementById(`course-${courseId}`);
      if (courseElement) {
        courseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const contextValue: OnboardingContextType = {
    state,
    loading,
    getCurrentStage,
    toggleTask,
    navigateToCourse,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {loading ? <div>Carregando sua jornada...</div> : children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}