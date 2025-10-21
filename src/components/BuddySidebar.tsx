// src/components/BuddySidebar.tsx
import { Users, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Propriedades para receber dados do usuário e função de logout
interface BuddySidebarProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout: () => void;
}

const menuItems = [
  { title: "Meus Onboardees", url: "/buddy/dashboard", icon: Users },
];

export function BuddySidebar({ user, onLogout }: BuddySidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  // Lógica de classes copiada da AppSidebar para garantir as mesmas cores
  const getNavClass = (isActive: boolean) =>
    isActive
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar className="border-r">
      {/* Wrapper para garantir que o rodapé fique visível */}
      <div className="flex flex-col h-full">
        <SidebarContent>
          {/* Seção de perfil idêntica à AppSidebar */}
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
            )}
          </div>

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavClass(isActive)}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Rodapé com botão de logout idêntico à AppSidebar */}
        <SidebarFooter>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}