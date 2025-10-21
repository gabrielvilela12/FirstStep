// src/layouts/BuddyLayout.tsx
import { Outlet } from "react-router-dom";
import { BuddySidebar } from "@/components/BuddySidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import logo from "../assets/firststep-logo.png"; // Importando o logo

export function BuddyLayout() {
  const { profile, signOut } = useAuth();

  // Aguarda o perfil ser carregado para evitar erros
  if (!profile) {
    return null; 
  }
  
  // Mapeia os dados do perfil para as propriedades da sidebar
  const user = {
    name: profile.name,
    role: profile.role,
    avatar: profile.avatar_url,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* A BuddySidebar agora recebe os dados do usuário e a função de logout */}
        <BuddySidebar user={user} onLogout={signOut} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 md:h-14 flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center space-x-2">
              <SidebarTrigger />
              <a href="/buddy/dashboard">
                <img className="h-10 w-auto object-contain" src={logo} alt="Logo FirstStep" />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}