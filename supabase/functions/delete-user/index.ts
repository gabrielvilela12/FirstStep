// supabase/functions/delete-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("O ID do utilizador é obrigatório.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Passo 1: Apagar o perfil da tabela 'onboardees' primeiro.
    const { error: dbError } = await supabaseAdmin
      .from('onboardees')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error("Erro ao apagar da tabela onboardees:", dbError);
      throw new Error("Falha ao apagar o perfil do utilizador.");
    }

    // Passo 2: Apagar o utilizador do sistema de autenticação.
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (authError) {
      console.error("Erro ao apagar da autenticação:", authError);
      // Mesmo que isto falhe, o perfil já foi apagado.
      // Poderia-se adicionar lógica para tentar recriar o perfil, mas por agora vamos manter simples.
      throw new Error("Falha ao apagar o utilizador do sistema de autenticação.");
    }

    return new Response(JSON.stringify({ message: 'Utilizador apagado com sucesso', user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})