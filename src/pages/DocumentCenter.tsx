// src/pages/DocumentCenter.tsx

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Heart,
  Check,
  FileText,
  Folder,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function DocumentCenter() {
  const [documents, setDocuments] = useState<any[]>([]); // Alterado para buscar do Supabase
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("data_created", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar documentos", variant: "destructive" });
    } else {
      setDocuments(data || []);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewDocument = (docId: number) => {
    const document = documents.find((doc) => doc.id === docId);
    if (document) {
      window.open(document.file_url, "_blank");
      toast({
        title: "Abrindo documento",
        description: "O documento será aberto em uma nova aba",
      });
    }
  };

  const handleDownload = (docName: string) => {
    toast({
      title: "Download iniciado",
      description: `${docName} está sendo baixado`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            Central de Documentos
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {filteredDocuments.length} documentos
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground">
          Acesse documentos importantes da empresa, políticas internas e
          materiais de apoio.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <Input
            placeholder="Buscar documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          {" "}
          {/* Alterado para uma única aba */}
          
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <Card
                key={document.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {document.name}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {document.description}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary text-white hover:bg-primary/90"
                      onClick={() => window.open(document.file_url, "_blank")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast({
                          title: "Download iniciado",
                          description: `${document.name} está sendo baixado`,
                        })
                      }
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou o termo de busca.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DocumentCenter;
