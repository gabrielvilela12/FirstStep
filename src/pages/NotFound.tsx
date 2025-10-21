import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Página não encontrada</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Oops! A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <Button asChild size="lg" className="gap-2">
          <a href="/">
            <Home className="h-4 w-4" />
            Voltar ao Início
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
