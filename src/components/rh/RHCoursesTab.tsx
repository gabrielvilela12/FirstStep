import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen, Plus, Pencil, Trash2, Search, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function RHCoursesTab({ onChange }: { onChange?: () => void }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    duration_minutes: 0,
    stage: 1,
  });

  const [stageCourses, setStageCourses] = useState<any[]>([]); // Cursos da etapa selecionada
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null); // Posição selecionada

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();

    const subscription = supabase
      .channel('courses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        loadCourses();
        if (onChange) onChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [onChange]);

  const loadCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("stage_id", { ascending: true }) // Certifique-se de usar "stage_id"
      .order("order_key", { ascending: true }); // Ordenar corretamente por "order_key"

    if (error) {
      toast({ title: "Erro ao carregar cursos", variant: "destructive" });
    } else {
      setCourses(data || []);
    }
  };

  const handleStageChange = async (stage: number) => {
    setFormData({ ...formData, stage });
    setSelectedPosition(null); // Resetar posição ao mudar etapa

    // Carregar cursos da etapa selecionada
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("stage_id", stage) // Certifique-se de usar "stage_id"
      .order("order_key", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar cursos da etapa",
        variant: "destructive",
      });
    } else {
      setStageCourses(data || []);
    }
  };

  const calculateOrderKey = async (
    selectedOrderKey: number,
    isBefore: boolean
  ) => {
    try {
      let adjacentCourse;
      if (isBefore) {
        // Buscar o curso anterior ao selecionado
        const { data } = await supabase
          .from("courses")
          .select("order_key")
          .lt("order_key", selectedOrderKey)
          .order("order_key", { ascending: false })
          .limit(1);
        adjacentCourse = data?.[0];
      } else {
        // Buscar o curso posterior ao selecionado
        const { data } = await supabase
          .from("courses")
          .select("order_key")
          .gt("order_key", selectedOrderKey)
          .order("order_key", { ascending: true })
          .limit(1);
        adjacentCourse = data?.[0];
      }

      const adjacentOrderKey =
        adjacentCourse?.order_key || (isBefore ? 0 : selectedOrderKey + 1000);
      return (selectedOrderKey + adjacentOrderKey) / 2;
    } catch (error) {
      console.error("Erro ao calcular order_key:", error);
      throw new Error("Erro ao calcular order_key");
    }
  };

  const handleCreateCourse = async () => {
    setLoading(true);
    try {
      const selectedOrderKey =
        stageCourses[selectedPosition || 0]?.order_key || 1000;
      const isBefore =
        selectedPosition === 0 || selectedPosition < stageCourses.length;
      const orderKey = await calculateOrderKey(selectedOrderKey, isBefore);

      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update({
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            duration_minutes: formData.duration_minutes,
            stage_id: formData.stage,
            order_key: orderKey,
          })
          .eq("id", editingCourse.id);

        if (error) throw error;
        toast({ title: "Curso atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from("courses").insert({
          title: formData.title,
          description: formData.description,
          video_url: formData.video_url,
          duration_minutes: formData.duration_minutes,
          stage_id: formData.stage, // Certifique-se de usar "stage_id"
          order_key: orderKey,
        });

        if (error) throw error;
        toast({ title: "Curso criado com sucesso!" });
      }

      loadCourses();
      if (onChange) onChange();
      setOpen(false);
      setEditingCourse(null);
      setFormData({
        title: "",
        description: "",
        video_url: "",
        duration_minutes: 0,
        stage: 1,
      });
      setStageCourses([]);
      setSelectedPosition(null);
    } catch (error: any) {
      toast({
        title: editingCourse
          ? "Erro ao atualizar curso"
          : "Erro ao criar curso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      video_url: course.video_url || "",
      duration_minutes: course.duration_minutes || 0,
      stage: Number(course.stage_id) || 1, // Certifique-se de usar "stage_id"
    });
    setOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseToDelete.id);

      if (error) throw error;

      toast({ title: "Curso deletado com sucesso!" });
      loadCourses();
      if (onChange) onChange();
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
    } catch (error: any) {
      toast({
        title: "Erro ao deletar curso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStageFilter(null);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === null || course.stage_id === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Cursos</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Editar Curso" : "Criar Novo Curso"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="video_url">URL do Vídeo</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) =>
                      setFormData({ ...formData, video_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_minutes: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage">Etapa (1-10)</Label>
                  <Select
                    value={formData.stage.toString()}
                    onValueChange={(value) =>
                      handleStageChange(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          Etapa {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {stageCourses.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="position">Posição na Etapa</Label>
                  <Select
                    value={selectedPosition?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedPosition(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">
                        Antes de {stageCourses[0].title}
                      </SelectItem>
                      {stageCourses.map((course, index) => (
                        <SelectItem
                          key={course.id}
                          value={(index + 1).toString()}
                        >
                          Após {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditingCourse(null);
                  setFormData({
                    title: "",
                    description: "",
                    video_url: "",
                    duration_minutes: 0,
                    stage: 1,
                  });
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateCourse} disabled={loading}>
                {loading
                  ? editingCourse
                    ? "Salvando..."
                    : "Criando..."
                  : editingCourse
                  ? "Salvar Alterações"
                  : "Criar Curso"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search">Pesquisar por Título ou Descrição</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <Label>Etapa</Label>
            <Select value={stageFilter === null ? 'all' : stageFilter.toString()} onValueChange={(value) => setStageFilter(value === 'all' ? null : parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    Etapa {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" /> Limpar Filtros
          </Button>
        </div>
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {courses.length === 0 ? "Nenhum curso cadastrado ainda" : "Nenhum curso encontrado com os filtros aplicados."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {course.description}
                  </TableCell>
                  <TableCell className="pl-7">{course.stage_id}</TableCell>
                  <TableCell className="pl-6">
                    {course.duration_minutes} min
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCourseToDelete(course);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o curso{" "}
              <strong>{courseToDelete?.title}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} disabled={loading}>
              {loading ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}