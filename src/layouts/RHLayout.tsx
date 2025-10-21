import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RHSidebar } from "@/components/RHSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "../assets/firststep-logo.png";

interface RHLayoutProps {
  children: React.ReactNode;
  user: {
    id?: string;
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export function RHLayout({ children, user, onLogout }: RHLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <RHSidebar user={user} onLogout={onLogout} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 md:h-14 flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center space-x-2">
              <SidebarTrigger />
              <a href="/rh/dashboard">
                <img className="h-10 w-auto object-contain" src={logo} alt="Logo" />
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
