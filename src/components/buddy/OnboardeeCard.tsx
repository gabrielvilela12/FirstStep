// src/components/buddy/OnboardeeCard.tsx
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle } from "lucide-react";

export interface EnrichedOnboardee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  progress?: number;
  status?: string;
  completed_tasks: number;
  total_tasks: number;
  completed_courses: number;
  total_courses: number;
  completed_items: {
    tasks: { title: string }[];
    courses: { title: string }[];
  };
}

interface OnboardeeCardProps {
  onboardee: EnrichedOnboardee;
}

export function OnboardeeCard({ onboardee }: OnboardeeCardProps) {
  const [open, setOpen] = useState(false);

  const handleSendMessage = () => {
    alert(`Enviar mensagem para ${onboardee.name} (${onboardee.email})`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:border-primary hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={onboardee.avatar} alt={onboardee.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {onboardee.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-sm md:text-base">{onboardee.name}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">{onboardee.email}</CardDescription>
                    <CardDescription className="text-xs md:text-sm">{onboardee.department || "Departamento não informado"}</CardDescription>
                  </div>
                </div>
                <Badge variant={onboardee.status === "progress" ? "default" : "secondary"} className="capitalize">
                  {onboardee.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Progresso Geral</span>
                <span>{onboardee.progress}%</span>
              </div>
              <Progress value={onboardee.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Tarefas: {onboardee.completed_tasks}/{onboardee.total_tasks}</span>
                <span>Cursos: {onboardee.completed_courses}/{onboardee.total_courses}</span>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{onboardee.name}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar e Botão */}
            <div className="flex flex-col items-center gap-4 md:w-1/4">
              <Avatar className="h-28 w-28">
                <AvatarImage src={onboardee.avatar} alt={onboardee.name} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {onboardee.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
  variant="default"
  className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
  onClick={handleSendMessage}
>
  <MessageCircle className="h-4 w-4 text-white" />
  Enviar Mensagem
</Button>

            </div>

            {/* Dados principais */}
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <p><strong>Email:</strong> {onboardee.email}</p>
                <p><strong>Departamento:</strong> {onboardee.department || "Não informado"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge variant={onboardee.status === "progress" ? "default" : "secondary"} className="capitalize">
                    {onboardee.status}
                  </Badge>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Progresso Geral</span>
                  <span>{onboardee.progress}%</span>
                </div>
                <Progress value={onboardee.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tarefas: {onboardee.completed_tasks}/{onboardee.total_tasks}</span>
                  <span>Cursos: {onboardee.completed_courses}/{onboardee.total_courses}</span>
                </div>
              </div>

              {/* Tabs de tarefas e cursos */}
              <Tabs defaultValue="tasks" className="mt-4">
                <TabsList>
                  <TabsTrigger value="tasks">Tarefas</TabsTrigger>
                  <TabsTrigger value="courses">Cursos</TabsTrigger>
                </TabsList>
                <TabsContent value="tasks">
                  {onboardee.completed_items.tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">Nenhuma tarefa concluída ainda</p>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {onboardee.completed_items.tasks.map((task, idx) => (
                        <li key={idx} className="text-sm">• {task.title}</li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
                <TabsContent value="courses">
                  {onboardee.completed_items.courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">Nenhum curso concluído ainda</p>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {onboardee.completed_items.courses.map((course, idx) => (
                        <li key={idx} className="text-sm">• {course.title}</li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
