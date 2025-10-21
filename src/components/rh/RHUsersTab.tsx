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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { UserPlus, Trash2, Edit, ChevronsUpDown, Check, Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isValid } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Onboardee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  start_date?: string;
  deadline?: string;
  department?: string;
  role: 'Onboardee' | 'Buddy' | 'RH';
  buddy_id?: string;
}

interface Buddy {
  id: string;
  name: string;
  email: string;
}

const initialFormData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  avatar: '',
  start_date: '',
  deadline: '',
  department: '',
  role: 'Onboardee' as 'Onboardee' | 'Buddy' | 'RH',
  buddy_id: '',
};

export function RHUsersTab({ onChange }: { onChange?: () => void }) {
  const [users, setUsers] = useState<Onboardee[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<Onboardee | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState(initialFormData);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchData();

    const subscription = supabase
      .channel('onboardees-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'onboardees' }, () => {
        fetchData();
        if (onChange) onChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [onChange]);

  useEffect(() => {
    if (formData.start_date && formData.role === 'Onboardee') {
      const startDate = new Date(formData.start_date);
      startDate.setUTCDate(startDate.getUTCDate() + 91);
      const deadlineDate = startDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, deadline: deadlineDate }));
    }
  }, [formData.start_date, formData.role]);

  const fetchData = async () => {
    const { data: usersData, error: usersError } = await supabase.from('onboardees').select('*').order('name', { ascending: true });
    if (usersError) toast({ title: "Erro ao buscar utilizadores", description: usersError.message, variant: "destructive" });
    else setUsers((usersData as Onboardee[]) || []);

    const { data: buddiesData, error: buddiesError } = await supabase.from('onboardees').select('id, name, email').eq('role', 'Buddy').order('name', { ascending: true });
    if (buddiesError) toast({ title: "Erro ao buscar buddies", description: buddiesError.message, variant: "destructive" });
    else setBuddies((buddiesData as Buddy[]) || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: 'Onboardee' | 'Buddy' | 'RH') => {
    const newFormData = { ...formData, role: value };
    if (value !== 'Onboardee') {
      newFormData.buddy_id = '';
      newFormData.start_date = '';
      newFormData.deadline = '';
    }
    setFormData(newFormData);
  };

  const handleDateChange = (field: 'start_date' | 'deadline', date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, [field]: dateString }));
    }
  };

  const handleBuddyChange = (buddyId: string) => {
    setFormData({ ...formData, buddy_id: buddyId });
  };

  const openModal = (user: Onboardee | null = null) => {
    if (user) {
      setIsEditMode(true);
      setCurrentUser(user);
      setFormData({
        name: user.name || '', email: user.email || '', phone: user.phone || '',
        avatar: user.avatar || '', start_date: user.start_date || '',
        deadline: user.deadline || '', department: user.department || '',
        role: user.role || 'Onboardee', buddy_id: user.buddy_id || '', password: '',
      });
    } else {
      setIsEditMode(false);
      setCurrentUser(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      name: formData.name,
      phone: formData.phone || null,
      avatar: formData.avatar || null,
      department: formData.department,
      role: formData.role,
      start_date: formData.role === 'Onboardee' ? formData.start_date || null : null,
      deadline: formData.role === 'Onboardee' ? formData.deadline || null : null,
      buddy_id: formData.role === 'Onboardee' ? formData.buddy_id || null : null,
      progress: 0,
      total_tasks: 0,
      completed_tasks: 0,
      pending_questions: 0,
    };

    if (isEditMode && currentUser) {
      const { data, error } = await supabase
        .from('onboardees')
        .update(dataToSave)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) {
        toast({ title: "Erro ao atualizar utilizador", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Sucesso!", description: "Utilizador atualizado com sucesso." });
        fetchData();
        if (onChange) onChange();
        closeModal();
      }
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        toast({ title: "Erro ao criar conta", description: authError.message, variant: "destructive" });
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        toast({ title: "Erro", description: "Usuário criado mas ID não encontrado.", variant: "destructive" });
        return;
      }

      const profileData = {
        id: userId,
        name: formData.name,
        email: formData.email,
        ...dataToSave,
      };

      const { data: profile, error: profileError } = await supabase
        .from('onboardees')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        toast({ title: "Erro ao criar perfil", description: profileError.message, variant: "destructive" });
      } else {
        toast({ title: "Sucesso!", description: "Utilizador criado com sucesso." });
        if (!authData.session) {
          toast({ 
            title: "Aviso", 
            description: "Por favor, informe o utilizador para verificar a caixa de entrada para confirmar o email!" 
          });
        }
        fetchData();
        if (onChange) onChange();
        closeModal();
      }
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem a certeza? Esta ação não pode ser desfeita.')) {
      const { error } = await supabase.functions.invoke('delete-user', { body: { userId } });
      if (error) {
        toast({ title: "Erro ao excluir utilizador", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Sucesso!", description: "Utilizador excluído com sucesso." });
        fetchData();
        if (onChange) onChange();
      }
    }
  };

  const getBuddyName = (buddyId: string | undefined) => {
    if (!buddyId) return 'N/A';
    const buddy = buddies.find(b => b.id === buddyId);
    return buddy ? buddy.name : 'Desconhecido';
  };

  const renderRoleBadge = (role: Onboardee['role']) => {
    const variant: "default" | "secondary" | "destructive" =
      role === 'RH' ? 'destructive' : role === 'Buddy' ? 'secondary' : 'default';
    return <Badge variant={variant}>{role}</Badge>;
  };

  const formatDateForPopover = (dateStr: string) => {
    if (!dateStr) return <span>Selecione a data</span>;
    const date = new Date(dateStr);
    if (isValid(date)) {
        return format(date, "dd/MM/yyyy", { timeZone: 'UTC' });
    }
    return <span>Data inválida</span>;
  };

  // Get unique departments
  const uniqueDepartments = Array.from(new Set(users.map(user => user.department).filter(Boolean))).sort();

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesDepartment = !departmentFilter || user.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter(null);
    setDepartmentFilter(null);
  };
  
  return (
    <Card>
      <Toaster />
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestão de Utilizadores</CardTitle>
        <div className="flex items-center gap-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openModal()}>
                <UserPlus className="mr-2" /> Adicionar Utilizador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Editar Utilizador' : 'Adicionar Utilizador'}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? 'Altere os dados do utilizador abaixo.' : 'Preencha os dados para criar um novo utilizador no sistema.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
                  <Input name="name" placeholder="Nome Completo" value={formData.name} onChange={handleInputChange} required />
                  <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required disabled={isEditMode} />
                  {!isEditMode && ( <Input name="password" type="password" placeholder="Senha Temporária" value={formData.password} onChange={handleInputChange} required /> )}
                  <div>
                    <Label>Função</Label>
                    <Select onValueChange={handleRoleChange} value={formData.role}>
                      <SelectTrigger><SelectValue placeholder="Selecione a função" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Onboardee">Onboardee</SelectItem>
                        <SelectItem value="Buddy">Buddy</SelectItem>
                        <SelectItem value="RH">RH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input name="phone" placeholder="Telefone (opcional)" value={formData.phone} onChange={handleInputChange} />
                  <Input name="avatar" placeholder="URL do Avatar (opcional)" value={formData.avatar} onChange={handleInputChange} />
                  <Input name="department" placeholder="Departamento" value={formData.department} onChange={handleInputChange} required/>
                  {formData.role === 'Onboardee' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data de Início</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDateForPopover(formData.start_date)}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={formData.start_date ? new Date(formData.start_date) : undefined} onSelect={(date) => handleDateChange('start_date', date)} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label>Prazo Final</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.deadline && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDateForPopover(formData.deadline)}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={formData.deadline ? new Date(formData.deadline) : undefined} onSelect={(date) => handleDateChange('deadline', date)} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div>
                        <Label>Buddy Designado (opcional)</Label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                              {formData.buddy_id ? getBuddyName(formData.buddy_id) : "Selecione um buddy..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Procurar buddy..." />
                              <CommandList>
                                <CommandEmpty>Nenhum buddy encontrado.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem onSelect={() => { handleBuddyChange(''); setPopoverOpen(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", !formData.buddy_id ? "opacity-100" : "opacity-0")} />
                                    Nenhum
                                  </CommandItem>
                                  {buddies.map((buddy) => (
                                    <CommandItem key={buddy.id} value={`${buddy.name} ${buddy.email}`} onSelect={() => { handleBuddyChange(buddy.id); setPopoverOpen(false); }}>
                                      <Check className={cn("mr-2 h-4 w-4", formData.buddy_id === buddy.id ? "opacity-100" : "opacity-0")} />
                                      <div>
                                        <p className="font-medium">{buddy.name}</p>
                                        <p className="text-xs text-muted-foreground">{buddy.email}</p>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
                    <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Criar Utilizador'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search">Pesquisar por Nome ou Email</Label>
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
            <Label>Função</Label>
            <Select value={roleFilter ?? 'all'} onValueChange={(value) => setRoleFilter(value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Onboardee">Onboardee</SelectItem>
                <SelectItem value="Buddy">Buddy</SelectItem>
                <SelectItem value="RH">RH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[150px]">
            <Label>Departamento</Label>
            <Select value={departmentFilter ?? 'all'} onValueChange={(value) => setDepartmentFilter(value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" /> Limpar Filtros
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="whitespace-nowrap">Nome</TableHead>
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Função</TableHead>
                    <TableHead className="whitespace-nowrap">Buddy Designado</TableHead>
                    <TableHead className="whitespace-nowrap">Departamento</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{renderRoleBadge(user.role)}</TableCell>
                        <TableCell>{getBuddyName(user.buddy_id)}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell className="text-right">
                            {user.role !== 'RH' && (
                              <>
                                <Button variant="outline" size="icon" className="mr-2" onClick={() => openModal(user)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(user.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum utilizador encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}