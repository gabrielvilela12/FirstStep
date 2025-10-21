-- ============================================
-- SIMPLIFICAÇÃO COMPLETA DO BANCO DE DADOS
-- ============================================
-- Mantém apenas: profiles, user_roles, assignments, courses, course_progress, documents, accesses
-- Remove: audit_logs, messages, threads, notifications, todo sistema de stages/tasks

-- 1. Remover tabelas desnecessárias
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS task_progress CASCADE;
DROP TABLE IF EXISTS stage_tasks CASCADE;
DROP TABLE IF EXISTS user_stage CASCADE;
DROP TABLE IF EXISTS onboarding_stages CASCADE;

-- 2. Remover funções desnecessárias
DROP FUNCTION IF EXISTS update_stage_progress_and_check_advance() CASCADE;
DROP FUNCTION IF EXISTS advance_to_next_stage(uuid) CASCADE;
DROP FUNCTION IF EXISTS calculate_stage_progress(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS initialize_onboarding(uuid) CASCADE;

-- 3. Remover enums desnecessários
DROP TYPE IF EXISTS stage_status CASCADE;
DROP TYPE IF EXISTS task_type CASCADE;

-- 4. Simplificar tabela assignments
ALTER TABLE assignments DROP COLUMN IF EXISTS team_id;

-- 5. Atualizar função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'Onboardee');
  
  INSERT INTO public.profiles (id, name, email, role, must_change_password)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'),
    new.email,
    v_role::public.user_role,
    COALESCE((new.raw_user_meta_data->>'must_change_password')::boolean, true)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, v_role::public.app_role);
  
  RETURN new;
END;
$$;

-- 6. Recriar RLS policies simplificadas

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "RH can view all profiles" ON profiles;
DROP POLICY IF EXISTS "RH can update all profiles" ON profiles;
DROP POLICY IF EXISTS "RH can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Buddies can view their onboardees" ON profiles;
DROP POLICY IF EXISTS "Buddies can update their onboardees" ON profiles;
DROP POLICY IF EXISTS "RH can manage all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "RH can view all profiles" ON profiles
FOR SELECT USING (get_user_role(auth.uid()) = 'RH'::app_role);

CREATE POLICY "RH can manage all profiles" ON profiles
FOR ALL USING (get_user_role(auth.uid()) = 'RH'::app_role);

CREATE POLICY "Buddies can view their onboardees" ON profiles
FOR SELECT USING (
  get_user_role(auth.uid()) = 'Buddy'::app_role 
  AND id IN (SELECT onboardee_id FROM assignments WHERE buddy_id = auth.uid())
);

-- COURSES
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
DROP POLICY IF EXISTS "RH can manage courses" ON courses;

CREATE POLICY "Everyone can view courses" ON courses
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "RH can manage courses" ON courses
FOR ALL USING (get_user_role(auth.uid()) = 'RH'::app_role);

-- COURSE_PROGRESS
DROP POLICY IF EXISTS "Users can view own progress" ON course_progress;
DROP POLICY IF EXISTS "Users can manage own progress" ON course_progress;
DROP POLICY IF EXISTS "Buddies can view onboardees progress" ON course_progress;
DROP POLICY IF EXISTS "RH can manage all progress" ON course_progress;

CREATE POLICY "Users can view own progress" ON course_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress" ON course_progress
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Buddies can view onboardees progress" ON course_progress
FOR SELECT USING (
  get_user_role(auth.uid()) = 'Buddy'::app_role 
  AND user_id IN (SELECT onboardee_id FROM assignments WHERE buddy_id = auth.uid())
);

CREATE POLICY "RH can manage all progress" ON course_progress
FOR ALL USING (get_user_role(auth.uid()) = 'RH'::app_role);

-- DOCUMENTS
DROP POLICY IF EXISTS "Everyone can view documents" ON documents;
DROP POLICY IF EXISTS "RH can manage documents" ON documents;

CREATE POLICY "Everyone can view documents" ON documents
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "RH can manage documents" ON documents
FOR ALL USING (get_user_role(auth.uid()) = 'RH'::app_role);

-- ACCESSES
DROP POLICY IF EXISTS "Everyone can view accesses" ON accesses;
DROP POLICY IF EXISTS "RH can manage accesses" ON accesses;

CREATE POLICY "Everyone can view accesses" ON accesses
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "RH can manage accesses" ON accesses
FOR ALL USING (get_user_role(auth.uid()) = 'RH'::app_role);

-- ASSIGNMENTS
DROP POLICY IF EXISTS "Users can view own assignments" ON assignments;
DROP POLICY IF EXISTS "RH can manage assignments" ON assignments;

CREATE POLICY "Users can view own assignments" ON assignments
FOR SELECT USING (auth.uid() = onboardee_id OR auth.uid() = buddy_id);

CREATE POLICY "RH can manage assignments" ON assignments
FOR ALL USING (get_user_role(auth.uid()) = 'RH'::app_role);

-- USER_ROLES
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "RH can manage roles" ON user_roles;

CREATE POLICY "Users can view own role" ON user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "RH can manage roles" ON user_roles
FOR ALL USING (get_user_role(auth.uid()) = 'RH'::app_role);