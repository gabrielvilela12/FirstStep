-- Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "Authenticated users can view accesses" ON accesses;
DROP POLICY IF EXISTS "Everyone can view accesses" ON accesses;
DROP POLICY IF EXISTS "RH can manage accesses" ON accesses;

DROP POLICY IF EXISTS "Users can view their own assignments" ON assignments;
DROP POLICY IF EXISTS "RH can manage all assignments" ON assignments;
DROP POLICY IF EXISTS "Users can view own assignments" ON assignments;
DROP POLICY IF EXISTS "RH can manage assignments" ON assignments;

DROP POLICY IF EXISTS "Users can view their own course progress" ON course_progress;
DROP POLICY IF EXISTS "Users can update their own course progress" ON course_progress;
DROP POLICY IF EXISTS "Buddies can view their onboardees course progress" ON course_progress;
DROP POLICY IF EXISTS "RH can manage all course progress" ON course_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON course_progress;
DROP POLICY IF EXISTS "Users can manage own progress" ON course_progress;
DROP POLICY IF EXISTS "Buddies can view onboardees progress" ON course_progress;
DROP POLICY IF EXISTS "RH can manage all progress" ON course_progress;

DROP POLICY IF EXISTS "Authenticated users can view courses" ON courses;
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
DROP POLICY IF EXISTS "RH can manage courses" ON courses;

DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;
DROP POLICY IF EXISTS "Everyone can view documents" ON documents;
DROP POLICY IF EXISTS "RH can manage documents" ON documents;

DROP POLICY IF EXISTS "Gestores can view their team" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "RH can view all profiles" ON profiles;
DROP POLICY IF EXISTS "RH can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Buddies can view their onboardees" ON profiles;

DROP POLICY IF EXISTS "Authenticated users can view teams" ON teams;

DROP POLICY IF EXISTS "RH can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "RH can manage roles" ON user_roles;

-- Desabilitar RLS em todas as tabelas
ALTER TABLE accesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;