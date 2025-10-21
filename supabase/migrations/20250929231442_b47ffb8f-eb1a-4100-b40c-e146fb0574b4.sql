-- Limpar todas as tabelas de dados (mantém estrutura)
TRUNCATE TABLE course_progress CASCADE;
TRUNCATE TABLE assignments CASCADE;
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE accesses CASCADE;

-- Inserir cursos de exemplo
INSERT INTO courses (title, description, video_url, duration_minutes) VALUES
('Boas-vindas à FirstStep', 'Vídeo de boas-vindas e apresentação da empresa, cultura e valores.', 'https://www.youtube.com/watch?v=example1', 15),
('Políticas e Normas Internas', 'Conheça as principais políticas, código de conduta e normas da empresa.', 'https://www.youtube.com/watch?v=example2', 30),
('Ferramentas e Sistemas', 'Tutorial sobre as principais ferramentas e sistemas utilizados no dia a dia.', 'https://www.youtube.com/watch?v=example3', 45),
('Segurança da Informação', 'Boas práticas de segurança, proteção de dados e LGPD.', 'https://www.youtube.com/watch?v=example4', 25),
('Treinamento Técnico - React', 'Introdução ao React e principais conceitos para desenvolvimento frontend.', 'https://www.youtube.com/watch?v=example5', 60),
('Comunicação Corporativa', 'Como se comunicar efetivamente dentro da organização.', 'https://www.youtube.com/watch?v=example6', 20),
('Trabalho em Equipe', 'Dinâmicas e melhores práticas para trabalho colaborativo.', 'https://www.youtube.com/watch?v=example7', 30),
('Gestão de Tempo', 'Técnicas de produtividade e organização pessoal.', 'https://www.youtube.com/watch?v=example8', 25);

-- Inserir documentos de exemplo
INSERT INTO documents (title, description, url, mandatory) VALUES
('Manual do Colaborador', 'Documento completo com todas as informações importantes sobre a empresa.', 'https://docs.example.com/manual-colaborador.pdf', true),
('Política de Privacidade', 'Política de privacidade e tratamento de dados pessoais.', 'https://docs.example.com/politica-privacidade.pdf', true),
('Código de Conduta', 'Código de ética e conduta profissional da empresa.', 'https://docs.example.com/codigo-conduta.pdf', true),
('Benefícios', 'Guia completo de benefícios oferecidos aos colaboradores.', 'https://docs.example.com/beneficios.pdf', false),
('Organograma', 'Estrutura organizacional da empresa.', 'https://docs.example.com/organograma.pdf', false),
('Guia de Férias', 'Procedimentos para solicitação e gestão de férias.', 'https://docs.example.com/guia-ferias.pdf', false),
('Política de Home Office', 'Regras e diretrizes para trabalho remoto.', 'https://docs.example.com/home-office.pdf', false),
('Regulamento Interno', 'Normas e regulamentos internos da organização.', 'https://docs.example.com/regulamento.pdf', true);

-- Inserir acessos de exemplo
INSERT INTO accesses (name, description) VALUES
('Email Corporativo', 'Acesso ao email @firststep.com.br através do Gmail. Credenciais serão enviadas por email.'),
('Sistema ERP', 'Acesso ao sistema de gestão empresarial. Login: seu email corporativo. Senha inicial será enviada.'),
('VPN Corporativa', 'Conexão VPN para acesso remoto aos sistemas internos. Baixar cliente em https://vpn.firststep.com.br'),
('Portal RH', 'Portal de autoatendimento de RH para solicitações, holerites e documentos. Acesso via SSO.'),
('Slack/Teams', 'Canal de comunicação interna da empresa. Convite será enviado por email.'),
('Sistema de Ponto', 'Registro de ponto eletrônico. Acesso via app móvel ou web.'),
('Google Drive Corporativo', 'Acesso à pasta compartilhada da equipe no Google Drive.'),
('Jira/Trello', 'Ferramenta de gestão de projetos e tarefas. Convite será enviado pelo gerente.');