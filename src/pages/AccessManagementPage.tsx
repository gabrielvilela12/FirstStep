import AccessManagement from "./AccessManagement";
import { useAuth } from "@/contexts/AuthContext";

const AccessManagementPage = () => {
  const { profile } = useAuth();
  if (!profile) return null;

  const user = { id: profile.id, name: profile.name, role: profile.role };

  return <AccessManagement user={user} />;
};

export default AccessManagementPage;