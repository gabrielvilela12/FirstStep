import { RHLayout } from "@/layouts/RHLayout";
import RHDashboard from "@/pages/RHDashboard";
import { useAuth } from "@/contexts/AuthContext";

export default function RHDashboardPage() {
  const { profile, signOut, loading } = useAuth(); // Usar profile diretamente

  // Mostrar ecrã de carregamento
  if (loading || !profile) {
    return <div>Carregando...</div>;
  }

  return (
    // Passar o profile e a função signOut diretamente
    <RHLayout user={profile} onLogout={signOut}>
      <RHDashboard />
    </RHLayout>
  );
}