import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import newLogo from "/lovable-uploads/f78b02a1-6a42-48dc-bc39-72bae554ad9d.png";
interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  error?: string;
  loading?: boolean;
}
export function LoginForm({
  onLogin,
  error,
  loading
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
    theme,
    setTheme
  } = useTheme();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };
  return <div className="w-full max-w-md space-y-8">
      {/* Theme Toggle */}
      <div className="flex justify-end">
        
      </div>
      
      {/* Logo */}
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6">
          <img src={newLogo} alt="FirstStep Logo" className="w-full h-full object-contain" />
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-foreground text-3xl font-bold">
            {showForgotPassword ? "Redefina sua senha" : "Entre em sua área"}
          </h1>
          <h2 className="text-primary text-3xl font-bold">
            FirstStep!
          </h2>
          {!showForgotPassword && <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
              FirstStep ajuda você a iniciar sua jornada na empresa, acompanhar seu progresso e se conectar com sua equipe desde o primeiro dia.
            </p>}
        </div>
      </div>

      {/* Form Content with Border */}
      <div className="bg-card border border-border rounded-lg p-8 shadow-card">
        <div className="space-y-6">
          {error && <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>}

          {!showForgotPassword ? <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="pl-12 h-14 border-border focus:border-primary focus:ring-primary" required />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="pl-12 pr-12 h-14 border-border focus:border-primary focus:ring-primary" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="text-left">
                <button type="button" onClick={handleForgotPassword} className="text-sm text-primary hover:text-primary-hover transition-colors underline">
                  Esqueceu sua senha? Clique aqui
                </button>
              </div>

              <Button type="submit" className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-hover font-medium" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form> : <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-muted-foreground text-sm">
                  Digite seu e-mail corporativo abaixo e enviaremos um código para redefinir sua senha.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input id="reset-email" type="email" placeholder="Digite seu e-mail corporativo" className="pl-12 h-14 border-border focus:border-primary focus:ring-primary" />
                </div>
              </div>

              <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-hover font-medium">
                Enviar Código de Recuperação
              </Button>

              <div className="text-center">
                <button type="button" onClick={() => setShowForgotPassword(false)} className="text-sm text-primary hover:text-primary-hover transition-colors">
                  Voltar ao login
                </button>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}