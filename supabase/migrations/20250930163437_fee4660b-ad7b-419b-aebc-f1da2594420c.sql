
-- Criar usuário RH usando extensão pgcrypto para senha
-- Email: rh@firststep.com
-- Senha: RH123456

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Inserir usuário na tabela auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'rh@firststep.com',
    crypt('RH123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', 'RH Admin', 'role', 'RH', 'must_change_password', false),
    now(),
    now(),
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- O trigger handle_new_user vai criar automaticamente o profile e user_role
END $$;
