// src/pages/Courses.tsx

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [completedItems, setCompletedItems] = useState<any[]>([]);
  const [currentStage, setCurrentStage] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    // Carrega progresso (para pintar os cards) e calcula o estágio atual
    loadCompletedItems();
    determineCurrentStage();
  }, [user?.id]);

  const determineCurrentStage = async () => {
    try {
      // 1) Buscar progresso do onboardee (traz course_id e task_id já feitos)
      const { data: progressRows, error: progressError } = await supabase
        .from("onboardee_progress")
        .select("course_id, task_id")
        .eq("onboardee_id", user!.id);

      if (progressError) throw progressError;

      // Normaliza para string para evitar mismatch de tipos (number vs string)
      const completedCourseIds = (progressRows || [])
        .filter(r => r.course_id != null)
        .map(r => String(r.course_id));

      const completedTaskIds = (progressRows || [])
        .filter(r => r.task_id != null)
        .map(r => String(r.task_id));

      // 2) Buscar todos os cursos (ordenados por order_key asc)
      const { data: allCourses, error: coursesError } = await supabase
        .from("courses")
        .select("id, stage_id, order_key")
        .order("order_key", { ascending: true });

      if (coursesError) throw coursesError;

      // 3) Buscar todas as tasks (sem order_key -> ordena por stage_id depois id)
      const { data: allTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, stage_id")
        .order("stage_id", { ascending: true })
        .order("id", { ascending: true });

      if (tasksError) throw tasksError;

      // 4) Primeiro curso não concluído
      const firstIncompleteCourse = (allCourses || []).find(
        (course) => !completedCourseIds.includes(String(course.id))
      );
      const stageFromCourse: number | null = firstIncompleteCourse?.stage_id ?? null;

      // 5) Primeira task não concluída
      const firstIncompleteTask = (allTasks || []).find(
        (task) => !completedTaskIds.includes(String(task.id))
      );
      const stageFromTask: number | null = firstIncompleteTask?.stage_id ?? null;

      // 6) Decide o currentStage: menor stage entre curso pendente e task pendente
      let nextStage: number | null = null;
      if (stageFromCourse == null && stageFromTask == null) {
        // Nada pendente
        toast({ title: "Parabéns!", description: "Você concluiu todos os cursos e tasks.", variant: "success" });
        setCourses([]);
        setCurrentStage(null);
        return;
      } else if (stageFromCourse != null && stageFromTask != null) {
        nextStage = Math.min(stageFromCourse, stageFromTask);
      } else {
        nextStage = (stageFromCourse ?? stageFromTask)!;
      }

      setCurrentStage(nextStage);
      // Carrega os cursos apenas do estágio atual calculado
      if (nextStage != null) {
        await loadCourses(nextStage);
      }
    } catch (error: any) {
      console.error("Erro ao determinar o estágio atual:", error);
      toast({ title: "Erro", description: "Não foi possível determinar o estágio atual.", variant: "destructive" });
    }
  };

  const loadCourses = async (stageId: number) => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, video_url, stage_id, order_key, duration_minutes")
        .eq("stage_id", stageId)
        .order("order_key", { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar cursos:", error);
      toast({ title: "Erro ao carregar cursos", description: error.message, variant: "destructive" });
    }
  };

  const loadCompletedItems = async () => {
    try {
      const { data, error } = await supabase
        .from("onboardee_progress")
        .select("task_id, course_id, completed_at")
        .eq("onboardee_id", user!.id);

      if (error) throw error;
      setCompletedItems(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar progresso:", error);
      toast({ title: "Erro ao carregar progresso", description: error.message, variant: "destructive" });
    }
  };

  const handleCompleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from("onboardee_progress")
        .upsert({
          onboardee_id: user!.id,
          course_id: courseId,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({ title: "Curso concluído com sucesso!" });
      await loadCompletedItems();
      await determineCurrentStage();
    } catch (error: any) {
      console.error("Erro ao completar curso:", error);
      toast({ title: "Erro ao completar curso", description: error.message, variant: "destructive" });
    }
  };

  if (!user?.id) {
    return <div className="text-center text-red-500">Usuário não autenticado.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Meus Cursos</h1>
      {currentStage && <p className="text-center text-muted-foreground mb-4">Estágio Atual: {currentStage}</p>}
      {courses.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhum curso disponível para o seu estágio.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isCompleted = completedItems.some((item) => String(item.course_id) === String(course.id));
            return (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                  <Progress value={isCompleted ? 100 : 0} className="w-full" />
                  <p className="text-sm text-center mt-2">{isCompleted ? "100% concluído" : "0% concluído"}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleCompleteCourse(String(course.id))} disabled={isCompleted}>
                    {isCompleted ? "Concluído" : "Acessar Curso"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
