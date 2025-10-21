import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { profile, session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Se ainda estiver carregando os dados da sessão/perfil, não faz nada
    if (loading) {
      return;
    }

    const isLoggedIn = !!session;
    const userRole = profile?.role;
    const isLoginPage = location.pathname === '/';

    // 2. Lógica para quem NÃO está logado
    if (!isLoggedIn && !isLoginPage) {
      navigate('/');
      return;
    }

    // 3. Lógica para quem ESTÁ logado
    if (isLoggedIn) {
      // Se o usuário logado está na página de login, redireciona ele para o dashboard certo
      if(isLoginPage) {
        switch (userRole) {
          case 'RH':
            navigate('/rh/dashboard');
            break;
          case 'Buddy':
            navigate('/buddy/dashboard');
            break;
          case 'Onboardee':
          default:
            navigate('/dashboard');
            break;
        }
      }
    }
  }, [session, profile, loading, navigate, location]);

  // Enquanto carrega, mostra uma tela em branco ou um spinner para evitar "piscadas"
  if (loading && location.pathname !== '/') {
    return <div>Carregando...</div>;
  }

  return <>{children}</>;
}