import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AccessManagementProps {
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

interface SystemAccess {
  id: string;
  systemName: string;
  description: string;
  logo?: string;
  status: 'aprovado' | 'pendente' | 'recusado';
}

export function AccessManagement({ user }: AccessManagementProps) {
  const { toast } = useToast();
  const [accesses, setAccesses] = useState<SystemAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccesses = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('onboardee_access_permissions')
        .select(`
          status,
          accesses (
            id,
            name,
            description,
            logo
          )
        `)
        .eq('onboardee_id', user.id);

      if (error) {
        toast({ title: "Erro ao carregar acessos", description: error.message, variant: "destructive" });
      } else if (data) {
        const formattedAccesses = data
          .map((item: any) => {
            if (!item.accesses) {
              return null;
            }
            
            let status = item.status.toLowerCase();
            if (status === 'liberado') {
                status = 'aprovado';
            }

            return {
              id: item.accesses.id,
              systemName: item.accesses.name,
              description: item.accesses.description,
              logo: item.accesses.logo,
              status: status,
            };
          })
          .filter(Boolean)
          // ALTERAÇÃO: Ordena a lista para colocar 'aprovado' no topo
          .sort((a, b) => {
            if (a.status === 'aprovado' && b.status !== 'aprovado') {
              return -1; // 'a' vem primeiro
            }
            if (a.status !== 'aprovado' && b.status === 'aprovado') {
              return 1; // 'b' vem primeiro
            }
            return 0; // Mantém a ordem original para status iguais
          }) as SystemAccess[];

        setAccesses(formattedAccesses);
      }
      setLoading(false);
    };

    if (user && user.id) {
      loadAccesses();
    }
  }, [user, toast]);

    const getStatusBadge = (status: 'aprovado' | 'pendente' | 'recusado') => {
        const variants = {
          aprovado: { variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700 text-white' },
          pendente: { variant: 'secondary' as const, className: 'bg-blue-600 hover:bg-blue-700 text-white' },
          recusado: { variant: 'destructive' as const, className: '' }
        };

        const config = variants[status] || variants.pendente;
        const labels = {
          aprovado: 'Aprovado',
          pendente: 'Pendente',
          recusado: 'Recusado'
        };

        return (
          <Badge variant={config.variant} className={config.className}>
            {labels[status] || 'Pendente'}
          </Badge>
        );
    };

  const handleOpenTicket = () => {
    toast({
      title: "Suporte solicitado",
      description: "Redirecionando você para o portal de chamados...",
    });
    // Aqui seria implementada a integração com o sistema de TI
  };

  return (
    <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background to-secondary/20 min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Solicitações de Acesso</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe aqui o status de suas solicitações de acesso a sistemas e ferramentas.
          </p>
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start space-x-2">
              <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Atenção:
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Para toda solicitação <strong>Aprovada</strong>, as credenciais e as instruções para o primeiro acesso serão enviadas diretamente para o seu e-mail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access List */}
      <div className="space-y-4">
        {loading ? (
          <p>Carregando...</p>
        ) : accesses.length > 0 ? (
          accesses.map((access) => (
            <Card key={access.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-3xl">{access.logo}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{access.systemName}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {access.description}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(access.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma solicitação de acesso encontrada.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Support Section */}
      <Card className="mt-12">
        <CardContent className="p-8 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Encontrou um problema com um acesso ou tem alguma outra dúvida?
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Nossa equipe de TI está aqui para ajudar você.
          </p>
          <Button onClick={handleOpenTicket} size="lg">
            <HelpCircle className="h-4 w-4 mr-2" />
            Abrir um chamado para o TI
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccessManagement;