import { Home, Users, BookOpen, FileText, Shield, LogOut, Settings } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface RHSidebarProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout: () => void;
}

const menuItems = [
  { title: "Painel de Controle", url: "/rh/dashboard", icon: Settings},
  //{ title: "Usuários", url: "/rh/usuarios", icon: Users },
  //{ title: "Cursos", url: "/rh/cursos", icon: BookOpen },
  //{ title: "Documentos", url: "/rh/documentos", icon: FileText },
  //{ title: "Acessos", url: "/rh/acessos", icon: Shield },
];

export function RHSidebar({ user, onLogout }: RHSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const getNavClass = (isActive: boolean) =>
    isActive
      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
      : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <div className="p-4 flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              RH
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
    </Sidebar>
  );
}
