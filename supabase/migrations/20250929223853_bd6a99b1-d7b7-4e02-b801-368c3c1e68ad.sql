-- Seed data for testing
-- Insert teams
INSERT INTO public.teams (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Equipe TI'),
  ('22222222-2222-2222-2222-222222222222', 'Equipe Comercial')
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO public.courses (id, title, description, video_url, duration_minutes, thumbnail_url, stage_id) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Introdução à Vivo', 'Conheça a história e valores da Vivo', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 30, null, null),
  ('c2222222-2222-2222-2222-222222222222', 'Segurança da Informação', 'Aprenda sobre as políticas de segurança', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 45, null, null),
  ('c3333333-3333-3333-3333-333333333333', 'Ferramentas de Trabalho', 'Conheça as ferramentas que utilizamos', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 20, null, null)
ON CONFLICT (id) DO NOTHING;

-- Insert documents
INSERT INTO public.documents (id, title, description, url, mandatory) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Manual do Colaborador', 'Guia completo para novos colaboradores', 'https://example.com/manual.pdf', true),
  ('d2222222-2222-2222-2222-222222222222', 'Código de Conduta', 'Normas e valores da empresa', 'https://example.com/codigo.pdf', true),
  ('d3333333-3333-3333-3333-333333333333', 'Política de Férias', 'Informações sobre férias e benefícios', 'https://example.com/ferias.pdf', false)
ON CONFLICT (id) DO NOTHING;

-- Insert accesses
INSERT INTO public.accesses (id, name, description) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Slack', 'Acesso à plataforma de comunicação interna'),
  ('a2222222-2222-2222-2222-222222222222', 'GitHub', 'Acesso ao repositório de código'),
  ('a3333333-3333-3333-3333-333333333333', 'Jira', 'Acesso ao sistema de gestão de projetos')
ON CONFLICT (id) DO NOTHING;