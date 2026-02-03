import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

// In-memory token store - shared with admin-auth conceptually, but we validate via admin-auth function
async function validateAdminToken(token: string): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ action: 'validate', token }),
    });
    
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const adminToken = req.headers.get('x-admin-token');
    
    if (!adminToken) {
      return new Response(
        JSON.stringify({ error: 'Token de administrador não fornecido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate admin token
    const isValidToken = await validateAdminToken(adminToken);
    if (!isValidToken) {
      return new Response(
        JSON.stringify({ error: 'Token de administrador inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ guests: data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'add': {
        const { name, phone } = params;
        
        if (!name || !phone) {
          return new Response(
            JSON.stringify({ error: 'Nome e telefone são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate input
        if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
          return new Response(
            JSON.stringify({ error: 'Nome inválido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const cleanPhone = String(phone).replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
          return new Response(
            JSON.stringify({ error: 'Telefone inválido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('guests')
          .insert({ name: name.trim(), phone: cleanPhone })
          .select()
          .single();

        if (error) throw error;

        console.log(`Admin added guest: ${name}`);
        
        return new Response(
          JSON.stringify({ success: true, guest: data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const { id } = params;
        
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'ID do convidado é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('guests')
          .delete()
          .eq('id', id);

        if (error) throw error;

        console.log(`Admin deleted guest: ${id}`);
        
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação inválida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Admin guests error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar operação' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
