import DocumentCenter from "./DocumentCenter";
import { useAuth } from "@/contexts/AuthContext";

const DocumentCenterPage = () => {
  const { profile } = useAuth();
  if (!profile) return null;

  return <DocumentCenter />; // Removido o envio de "user" como prop
};

export default DocumentCenterPage;