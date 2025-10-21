import Dashboard from "./Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/hooks/useOnboardingState";

const DashboardPage = () => {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  const user = {
    name: profile.name,
    role: profile.role,
  };

  // O <DashboardLayout> FOI REMOVIDO DAQUI
  return (
    <OnboardingProvider>
      <Dashboard user={user} />
    </OnboardingProvider>
  );
};

export default DashboardPage;