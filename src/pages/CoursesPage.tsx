import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Lock, Clock } from "lucide-react";

// Interfaces
interface Course {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  stage_id: number;
  video_url: string;
}

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  courses: Course[];
}

export default function CoursesPage() {
  const { profile } = useAuth();
  const [stages, setStages] = useState<Stage[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) fetchCourseData();
  }, [profile]);

  const fetchCourseData = async () => {
    setLoading(true);

    const { data: stagesData, error: stagesError } = await supabase
      .from('stages')
      .select(`
        id,
        title,
        subtitle,
        courses ( id, title, description, duration_minutes, stage_id, video_url )
      `)
      .order('stage_order', { ascending: true });

    if (stagesError) console.error("Erro ao buscar fases e cursos:", stagesError);

    if (profile?.id) {
      const { data: progressData, error: progressError } = await supabase
        .from('onboardee_progress')
        .select('course_id')
        .eq('onboardee_id', profile.id)
        .not('course_id', 'is', null);

      if (!progressError) setCompletedCourses(new Set(progressData.map(p => p.course_id)));
    }

    setStages(stagesData as Stage[]);
    setLoading(false);
  };

  const handleCompleteCourse = async (courseId: number) => {
    if (completedCourses.has(courseId) || !profile?.id) return;

    const { error } = await supabase
      .from('onboardee_progress')
      .insert({ onboardee_id: profile.id, course_id: courseId });

    if (!error) setCompletedCourses(prev => new Set(prev).add(courseId));
  };
  
  const totalCourses = stages.reduce((acc, stage) => acc + stage.courses.length, 0);
  const overallProgress = totalCourses > 0 ? (completedCourses.size / totalCourses) * 100 : 0;

  if (loading) return <div className="flex justify-center items-center h-screen">Carregando cursos...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trilha de Cursos</h1>
        <p className="text-muted-foreground mb-4">Siga as etapas para completar seu onboarding.</p>
        <div className="flex items-center gap-4">
          <Progress value={overallProgress} className="flex-1 h-2" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {Math.round(overallProgress)}% concluído ({completedCourses.size}/{totalCourses})
          </span>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {stages.map((stage, stageIndex) => {
          const completedInStage = stage.courses.filter(c => completedCourses.has(c.id)).length;
          const totalInStage = stage.courses.length;
          const stageProgress = totalInStage > 0 ? (completedInStage / totalInStage) * 100 : 0;

          const previousStageCompleted = stageIndex === 0 || stages[stageIndex - 1].courses.every(c => completedCourses.has(c.id));

          return (
            <AccordionItem 
              value={`item-${stage.id}`} 
              key={stage.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className={`px-6 py-4 ${!previousStageCompleted ? 'cursor-not-allowed' : 'hover:bg-muted/50'}`}>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex flex-col items-start">
                    <h2 className="text-xl font-semibold">{stage.title}</h2>
                    <p className="text-sm text-muted-foreground">{stage.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={stageProgress} className="w-24 h-2" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {completedInStage}/{totalInStage}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 bg-muted/30 space-y-6">
                {stage.courses.map(course => {
                  const isCompleted = completedCourses.has(course.id);
                  const isActive = previousStageCompleted && !isCompleted;
                  const isBlocked = !previousStageCompleted;

                  let Icon, iconColor;
                  if (isCompleted) { Icon = CheckCircle; iconColor = "text-primary"; }
                  else if (isActive) { Icon = Clock; iconColor = "text-purple-500"; }
                  else { Icon = Lock; iconColor = "text-gray-400"; }

                  // Somente cursos bloqueados ficam cinza
                  const textColor = isBlocked ? "text-gray-400" : "text-current";
                  const cursorClass = isBlocked ? "cursor-not-allowed" : "cursor-auto";

                  return (
                    <Card key={course.id} className={`overflow-hidden ${cursorClass}`}>
                      <CardHeader className="pb-4">
                        <CardTitle className={`flex items-center justify-between text-lg ${textColor}`}>
                          <span>{course.title}</span>
                          <Icon className={`h-5 w-5 ${iconColor}`} />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className={cursorClass}>
                        <p className={`text-sm mb-4 ${textColor}`}>
                          {course.description}
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <span className={`text-sm font-medium ${textColor}`}>
                            Duração: {course.duration_minutes} minutos
                          </span>
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button 
                              variant="outline" 
                              asChild 
                              className={`flex-1 ${isBlocked ? 'hover:bg-transparent' : ''}`}
                              disabled={isBlocked}
                            >
                              <a href={isBlocked ? undefined : course.video_url} target="_blank" rel="noopener noreferrer">
                                Assistir Curso
                              </a>
                            </Button>
                            {!isCompleted && isActive && (
                              <Button 
                                onClick={() => handleCompleteCourse(course.id)}
                                className="flex-1"
                                disabled={isBlocked}
                              >
                                Marcar como Concluído
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
