import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileText, Shield, UserPlus, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RHUsersTab } from "@/components/rh/RHUsersTab";
import { RHCoursesTab } from "@/components/rh/RHCoursesTab";
import { RHDocumentsTab } from "@/components/rh/RHDocumentsTab";
import { RHAccessesTab } from "@/components/rh/RHAccessesTab";
import { supabase } from "@/integrations/supabase/client";

export default function RHDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    documents: 0,
    accesses: 0,
  });

  useEffect(() => {
    loadStats();

    const subscription = supabase
      .channel('onboardees-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'onboardees' }, () => {
        loadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const loadStats = async () => {
    const [usersData, coursesData, documentsData, accessesData] = await Promise.all([
      supabase.from("onboardees").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("documents").select("id", { count: "exact", head: true }),
      supabase.from("accesses").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      users: usersData.count || 0,
      courses: coursesData.count || 0,
      documents: documentsData.count || 0,
      accesses: accessesData.count || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Painel de Controle</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accesses}</div>
            <p className="text-xs text-muted-foreground">Configurados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="accesses">
            <Shield className="h-4 w-4 mr-2" />
            Acessos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <RHUsersTab onChange={loadStats} />
        </TabsContent>

        <TabsContent value="courses">
          <RHCoursesTab onChange={loadStats}/>
        </TabsContent>

        <TabsContent value="documents">
          <RHDocumentsTab onChange={loadStats}/>
        </TabsContent>

        <TabsContent value="accesses">
          <RHAccessesTab onChange={loadStats}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}