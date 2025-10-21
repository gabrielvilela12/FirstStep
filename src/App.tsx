// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Layouts
import { DashboardLayout } from "./layouts/DashboardLayout";
import { BuddyLayout } from "./layouts/BuddyLayout";

// Páginas
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import DocumentCenterPage from "./pages/DocumentCenterPage";
import AccessManagementPage from "./pages/AccessManagementPage";
import RHDashboardPage from "./pages/RHDashboardPage";
import BuddyDashboardPage from "./pages/BuddyDashboardPage";

// Toaster
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota de Login */}
        <Route path="/" element={<Index />} />

        {/* Rotas do Onboardee (com a sidebar principal) */}
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cursos" element={<CoursesPage />} />
          <Route path="documentos" element={<DocumentCenterPage />} />
          <Route path="acessos" element={<AccessManagementPage />} />
        </Route>

        {/* Rota do Buddy */}
        <Route element={<BuddyLayout />}>
          <Route path="/buddy/dashboard" element={<BuddyDashboardPage />} />
        </Route>

        {/* Rota do RH */}
        <Route path="/rh/dashboard" element={<RHDashboardPage />} />

        {/* Rota de Página Não Encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* 👇 Sempre ativo em qualquer página */}
      <Toaster />
    </AuthProvider>
  );
}

export default App;
