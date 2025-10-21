import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Key,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  CheckCheck,
  XCircle,
  Search,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Tipos para os dados
type Onboardee = {
  id: string;
  name: string;
};

type Access = {
  id: number;
  name: string;
  description?: string;
};

type AccessPermission = {
  id: number;
  onboardee_id: string;
  access_id: number;
  status: string;
};

export function RHAccessesTab({ onChange }: { onChange?: () => void }) {
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [onboardees, setOnboardees] = useState<Onboardee[]>([]);
  const [permissions, setPermissions] = useState<AccessPermission[]>([]);
  const [selectedOnboardee, setSelectedOnboardee] = useState<string | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<Access | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [accessToDelete, setAccessToDelete] = useState<Access | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAccesses();
    loadOnboardees();

    const subscription = supabase
      .channel('accesses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accesses' }, () => {
        loadAccesses();
        if (onChange) onChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [onChange]);

  useEffect(() => {
    if (selectedOnboardee) {
      loadPermissions(selectedOnboardee);
    } else {
      setPermissions([]);
    }
  }, [selectedOnboardee]);

  const loadAccesses = async () => {
    const { data, error } = await supabase
      .from("accesses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar acessos", variant: "destructive" });
    } else {
      setAccesses(data || []);
    }
  };

  const loadOnboardees = async () => {
    const { data, error } = await supabase
      .from("onboardees")
      .select("id, name")
      .eq("role", "Onboardee");

    if (error) {
      toast({ title: "Erro ao carregar onboardees", variant: "destructive" });
    } else {
      setOnboardees(data || []);
    }
  };

  const loadPermissions = async (onboardeeId: string) => {
    const { data, error } = await supabase
      .from("onboardee_access_permissions")
      .select("*")
      .eq("onboardee_id", onboardeeId);

    if (error) {
      toast({
        title: "Erro ao carregar permissões",
        variant: "destructive",
      });
    } else {
      setPermissions(data || []);
    }
  };

  const handleCreateAccess = async () => {
    setLoading(true);
    try {
      if (editingAccess) {
        const { error } = await supabase
          .from("accesses")
          .update({
            name: formData.name,
            description: formData.description,
          })
          .eq("id", editingAccess.id);

        if (error) throw error;
        toast({ title: "Acesso atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from("accesses").insert({
          name: formData.name,
          description: formData.description,
        });

        if (error) throw error;
        toast({ title: "Acesso criado com sucesso!" });
      }

      loadAccesses();
      if (onChange) onChange();
      setOpen(false);
      setEditingAccess(null);
      setFormData({ name: "", description: "" });
    } catch (error: any) {
      toast({
        title: editingAccess
          ? "Erro ao atualizar acesso"
          : "Erro ao criar acesso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAccess = (access: Access) => {
    setEditingAccess(access);
    setFormData({
      name: access.name,
      description: access.description || "",
    });
    setOpen(true);
  };

  const handleDeleteAccess = async () => {
    if (!accessToDelete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("accesses")
        .delete()
        .eq("id", accessToDelete.id);

      if (error) throw error;

      toast({ title: "Acesso deletado com sucesso!" });
      loadAccesses();
      if (onChange) onChange();
      setDeleteConfirmOpen(false);
      setAccessToDelete(null);
    } catch (error: any) {
      toast({
        title: "Erro ao deletar acesso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (
    accessId: number,
    isChecked: boolean
  ) => {
    if (!selectedOnboardee) return;

    const status = isChecked ? "Liberado" : "Pendente";

    const existingPermission = permissions.find(
      (p) => p.access_id === accessId
    );

    let error;

    if (existingPermission) {
      ({ error } = await supabase
        .from("onboardee_access_permissions")
        .update({ status })
        .eq("id", existingPermission.id));
    } else {
      ({ error } = await supabase.from("onboardee_access_permissions").insert({
        onboardee_id: selectedOnboardee,
        access_id: accessId,
        status: status,
      }));
    }

    if (error) {
      toast({
        title: "Erro ao salvar permissão",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Permissão salva com sucesso!" });
      loadPermissions(selectedOnboardee);
    }
  };

  const handleBulkPermissionChange = async (
    newStatus: "Liberado" | "Pendente"
  ) => {
    if (!selectedOnboardee) return;

    setLoading(true);
    try {
      const permissionsToUpsert = accesses.map((access) => ({
        onboardee_id: selectedOnboardee,
        access_id: access.id,
        status: newStatus,
      }));

      const { error } = await supabase
        .from("onboardee_access_permissions")
        .upsert(permissionsToUpsert, { onConflict: "onboardee_id, access_id" });

      if (error) throw error;

      toast({
        title: `Todos os acessos foram ${
          newStatus === "Liberado" ? "aprovados" : "removidos"
        }!`,
      });
      loadPermissions(selectedOnboardee);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar permissões em massa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionsOpenChange = (isOpen: boolean) => {
    setPermissionsOpen(isOpen);
    if (!isOpen) {
      setSelectedOnboardee(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  const filteredAccesses = accesses.filter(access => {
    const matchesSearch = access.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (access.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Acessos</CardTitle>
        <div className="flex gap-2">
          <Dialog
            open={permissionsOpen}
            onOpenChange={handlePermissionsOpenChange}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserCheck className="h-4 w-4 mr-2" />
                Permissões
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Gerenciar Permissões de Acesso</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="onboardee-select">Selecione o Onboardee</Label>
                <Select
                  onValueChange={setSelectedOnboardee}
                  value={selectedOnboardee || ""}
                >
                  <SelectTrigger id="onboardee-select">
                    <SelectValue placeholder="Selecione um onboardee" />
                  </SelectTrigger>
                  <SelectContent>
                    {onboardees.map((onboardee) => (
                      <SelectItem key={onboardee.id} value={onboardee.id}>
                        {onboardee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedOnboardee && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">
                        Acessos para{" "}
                        {
                          onboardees.find((o) => o.id === selectedOnboardee)
                            ?.name
                        }
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkPermissionChange("Liberado")}
                          disabled={loading}
                        >
                          <CheckCheck className="h-4 w-4 mr-2" />
                          Aprovar Todos
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBulkPermissionChange("Pendente")}
                          disabled={loading}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Remover Todos
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Acesso</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accesses.map((access) => {
                            const permission = permissions.find(
                              (p) => p.access_id === access.id
                            );
                            const isLiberado =
                              permission?.status === "Liberado";

                            return (
                              <TableRow key={access.id}>
                                <TableCell className="font-medium">
                                  {access.name}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <span>
                                      {isLiberado ? "Liberado" : "Pendente"}
                                    </span>
                                    <Switch
                                      checked={isLiberado}
                                      onCheckedChange={(isChecked) =>
                                        handlePermissionChange(
                                          access.id,
                                          isChecked
                                        )
                                      }
                                      disabled={loading}
                                    />
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Acesso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAccess ? "Editar Acesso" : "Criar Novo Acesso"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Sistema/Acesso</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Sistema Interno, VPN, Email..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Instruções de acesso..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setEditingAccess(null);
                    setFormData({ name: "", description: "" });
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateAccess} disabled={loading}>
                  {loading
                    ? editingAccess
                      ? "Salvando..."
                      : "Criando..."
                    : editingAccess
                    ? "Salvar Alterações"
                    : "Criar Acesso"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" /> Limpar Filtro
          </Button>
        </div>
        {filteredAccesses.length === 0 ? (
          <div className="text-center py-12">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {accesses.length === 0 ? "Nenhum acesso cadastrado ainda" : "Nenhum acesso encontrado com o filtro aplicado."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccesses.map((access) => (
                <TableRow key={access.id}>
                  <TableCell className="font-medium">{access.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {access.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAccess(access)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAccessToDelete(access);
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
              Tem certeza que deseja deletar o acesso{" "}
              <strong>{accessToDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccess} disabled={loading}>
              {loading ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}