// src/pages/Index.tsx

import { LoginForm } from "@/components/ui/login-form";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setError("");
    setLoading(true);

    // ALTERAÇÃO PRINCIPAL: Usamos try/finally para garantir que o loading termine.
    try {
      const { error: signInError } = await signIn(email, password);
    
      if (signInError) {
        // Lógica de erro aprimorada para mensagens mais claras.
        if (signInError.name === "ProfileNotFound") {
          setError("Perfil não encontrado no banco de dados.");
        } else if (signInError.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos. Tente novamente.");
        }
        else {
          setError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
        }
      }
    } catch (e) {
        console.error("Erro não capturado no fluxo de login:", e);
        setError("Ocorreu um erro crítico. Por favor, contate o suporte.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <LoginForm onLogin={handleLogin} error={error} loading={loading} />
      </div>
      <div className="p-4 border-t border-border bg-background">
        <div className="text-center text-muted-foreground text-xs">
          © 2025 FirstStep. Desenvolvido por <strong>Skill Builders</strong>. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Index;