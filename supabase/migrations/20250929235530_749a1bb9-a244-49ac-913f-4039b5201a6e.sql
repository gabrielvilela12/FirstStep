-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

-- Policies para profiles (todos podem ler, mas apenas o próprio pode atualizar)
CREATE POLICY "Todos podem ver perfis"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir próprio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policies para courses (todos autenticados podem ler)
CREATE POLICY "Todos autenticados podem ver cursos"
ON public.courses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Todos autenticados podem criar cursos"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Todos autenticados podem atualizar cursos"
ON public.courses FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Todos autenticados podem deletar cursos"
ON public.courses FOR DELETE
TO authenticated
USING (true);

-- Policies para documents (todos autenticados podem ler)
CREATE POLICY "Todos autenticados podem ver documentos"
ON public.documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Todos autenticados podem criar documentos"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Todos autenticados podem atualizar documentos"
ON public.documents FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Todos autenticados podem deletar documentos"
ON public.documents FOR DELETE
TO authenticated
USING (true);

-- Policies para accesses (todos autenticados podem ler)
CREATE POLICY "Todos autenticados podem ver acessos"
ON public.accesses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Todos autenticados podem criar acessos"
ON public.accesses FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Todos autenticados podem atualizar acessos"
ON public.accesses FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Todos autenticados podem deletar acessos"
ON public.accesses FOR DELETE
TO authenticated
USING (true);

-- Policies para assignments (todos autenticados podem gerenciar)
CREATE POLICY "Todos autenticados podem ver assignments"
ON public.assignments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Todos autenticados podem criar assignments"
ON public.assignments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Todos autenticados podem atualizar assignments"
ON public.assignments FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Todos autenticados podem deletar assignments"
ON public.assignments FOR DELETE
TO authenticated
USING (true);

-- Policies para course_progress (todos autenticados podem gerenciar)
CREATE POLICY "Todos autenticados podem ver progresso"
ON public.course_progress FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Todos autenticados podem criar progresso"
ON public.course_progress FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Todos autenticados podem atualizar progresso"
ON public.course_progress FOR UPDATE
TO authenticated
USING (true);

-- Adicionar campo stage aos cursos (de 1 a 10)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS stage integer DEFAULT 1 CHECK (stage >= 1 AND stage <= 10);