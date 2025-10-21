// supabase/functions/create-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userData } = await req.json()
    
    if (!userData || !userData.email || !userData.password || !userData.name) {
      throw new Error('Dados essenciais (nome, email, senha) estão faltando.')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Cria o usuário na autenticação
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    })

    if (authError) {
      // Se o erro for de usuário já existente, retorna uma mensagem mais clara
      if (authError.message.includes('User already exists')) {
        throw new Error('Este endereço de e-mail já está em uso.');
      }
      throw authError;
    }

    // *** CORREÇÃO APLICADA AQUI: Verificação de segurança ***
    // Garante que o objeto do usuário foi retornado antes de prosseguir
    if (!authData?.user) {
      throw new Error('Falha crítica: O usuário não foi criado no sistema de autenticação.');
    }
    const { user } = authData;

    const userProfile = {
      id: user.id, // Usa o 'user' que foi verificado
      name: userData.name,
      email: userData.email,
      phone: userData.phone || null,
      avatar: userData.avatar || null,
      department: userData.department,
      role: userData.role,
      start_date: userData.start_date || null,
      deadline: userData.deadline || null,
      buddy_id: userData.buddy_id || null,
    }

    // 2. Insere os dados na tabela 'onboardees'
    const { data: insertData, error: dbError } = await supabaseAdmin
      .from('onboardees')
      .insert(userProfile)
      .select()
      .single()

    // 3. Se houver erro, deleta o usuário da autenticação
    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id) // Usa o 'user.id' verificado
      throw dbError
    }

    // Retorna o perfil do usuário criado com sucesso
    return new Response(JSON.stringify({ user: insertData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // Retorna o erro com status 400 para o cliente
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})