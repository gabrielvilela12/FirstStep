import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string; // Adicionado para consistência
  role: 'RH' | 'Buddy' | 'Onboardee';
  name: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean; // Adicionado para controlar o estado de carregamento
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      console.log("Verificando sessão existente...");
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log("Sessão encontrada. Buscando perfil...");
        const { data: profileData, error: profileError } = await supabase
          .from('onboardees')
          .select('id, role, name')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profileData) {
          console.error("Erro ao buscar perfil da sessão:", profileError);
          // Se não encontrar o perfil, força o logout para evitar um estado inconsistente
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        } else {
          console.log("Perfil da sessão carregado:", profileData);
          setUser(session.user);
          setProfile(profileData as UserProfile);
        }
      } else {
        console.log("Nenhuma sessão ativa encontrada.");
      }
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          // A busca de perfil já é feita na função signIn,
          // mas poderíamos adicionar aqui por segurança se necessário.
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          navigate('/');
        }
      }
    );
    return () => authListener?.subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    console.log("Passo 1: Tentando autenticar com Supabase...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      console.error("ERRO na autenticação:", authError);
      return { error: authError };
    }

    if (!authData.user) {
        return { error: { message: "Usuário não encontrado após login.", name: "UserNotFound", status: 404 } as AuthError };
    }
    
    console.log("Passo 2: Autenticação bem-sucedida! Buscando perfil no banco de dados...");
    const { data: profileData, error: profileError } = await supabase
      .from('onboardees')
      .select('id, role, name')
      .eq('id', authData.user.id)
      .single();
      
    if (profileError || !profileData) {
      console.error("ERRO ao buscar perfil do usuário:", profileError);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      return { error: { message: "Perfil não encontrado no banco. Verifique se o ID do usuário na tabela 'onboardees' corresponde ao da autenticação.", name: "ProfileNotFound", status: 404 } as AuthError };
    }
    
    console.log("Passo 3: Perfil encontrado com sucesso:", profileData);
    setUser(authData.user);
    setProfile(profileData as UserProfile);

    console.log("Passo 4: Redirecionando para o dashboard...");
    switch (profileData.role) {
      case 'RH':
        navigate('/rh/dashboard');
        break;
      case 'Buddy':
        navigate('/buddy/dashboard');
        break;
      case 'Onboardee':
        navigate('/dashboard');
        break;
      default:
        await supabase.auth.signOut();
        navigate('/');
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { user, profile, signIn, signOut, loading };

  // Renderiza os componentes filhos apenas quando o carregamento inicial da sessão terminar
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};