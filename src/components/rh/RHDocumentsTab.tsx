import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RHDocumentsTab({ onChange }: { onChange?: () => void }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file_url: "", 
    is_mandatory: false,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [mandatoryFilter, setMandatoryFilter] = useState<boolean | null>(null);

  useEffect(() => {
    loadDocuments();

    const subscription = supabase
      .channel('documents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        loadDocuments();
        if (onChange) onChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [onChange]);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("data_created", { ascending: false }); // Alterado para "data_created"

    if (error) {
      toast({ title: "Erro ao carregar documentos", variant: "destructive" });
    } else {
      setDocuments(data || []);
    }
  };

  const handleCreateDocument = async () => {
    setLoading(true);
    try {
      if (editingDocument) {
        const { error } = await supabase
          .from("documents")
          .update({
            name: formData.name,
            description: formData.description,
            file_url: formData.file_url,
            is_mandatory: formData.is_mandatory,
          })
          .eq("id", editingDocument.id);

        if (error) throw error;
        toast({ title: "Documento atualizado com sucesso!" });
        
      } else {
        const { error } = await supabase.from("documents").insert({
          name: formData.name,
          description: formData.description,
          file_url: formData.file_url,
          is_mandatory: formData.is_mandatory,
          data_created: new Date().toISOString(),
        });

        if (error) throw error;
        toast({ title: "Documento criado com sucesso!" });
      }

      loadDocuments();
      if (onChange) onChange();
      setOpen(false);
      setEditingDocument(null);
      setFormData({ name: "", description: "", file_url: "", is_mandatory: false });
    } catch (error: any) {
      toast({
        title: editingDocument ? "Erro ao atualizar documento" : "Erro ao criar documento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = (document: any) => {
    setEditingDocument(document);
    setFormData({
      name: document.name,
      description: document.description || "",
      file_url: document.file_url,
      is_mandatory: document.is_mandatory,
    });
    setOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentToDelete.id);
      
      if (error) throw error;

      toast({ title: "Documento deletado com sucesso!" });
      loadDocuments();
      if (onChange) onChange();
      setDeleteConfirmOpen(false);
      setDocumentToDelete(null);
    } catch (error: any) {
      toast({
        title: "Erro ao deletar documento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setMandatoryFilter(null);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMandatory = mandatoryFilter === null || doc.is_mandatory === mandatoryFilter;
    return matchesSearch && matchesMandatory;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Documentos</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDocument ? "Editar Documento" : "Criar Novo Documento"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label> {/* Alterado de "Título" para "Nome" */}
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file_url">URL do Arquivo</Label> {/* Alterado de "URL do Documento" para "URL do Arquivo" */}
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_mandatory"
                  checked={formData.is_mandatory}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_mandatory: checked as boolean })
                  }
                />
                <Label htmlFor="is_mandatory">Documento obrigatório</Label> {/* Alterado "mandatory" para "is_mandatory" */}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setOpen(false);
                setEditingDocument(null);
                setFormData({ name: "", description: "", file_url: "", is_mandatory: false });
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateDocument} disabled={loading}>
                {loading ? (editingDocument ? "Salvando..." : "Criando...") : (editingDocument ? "Salvar Alterações" : "Criar Documento")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search">Pesquisar por Nome ou Descrição</Label>
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
            <Label>Obrigatório</Label>
            <Select value={mandatoryFilter === null ? 'all' : mandatoryFilter ? 'true' : 'false'} onValueChange={(value) => setMandatoryFilter(value === 'all' ? null : value === 'true')}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Obrigatório</SelectItem>
                <SelectItem value="false">Opcional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" /> Limpar Filtros
          </Button>
        </div>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum documento cadastrado ainda</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Obrigatório</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{doc.description}</TableCell>
                  <TableCell>
                    {doc.is_mandatory ? (
                      <Badge>Obrigatório</Badge>
                    ) : (
                      <Badge variant="outline">Opcional</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditDocument(doc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDocumentToDelete(doc);
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
              Tem certeza que deseja deletar o documento <strong>{documentToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} disabled={loading}>
              {loading ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}