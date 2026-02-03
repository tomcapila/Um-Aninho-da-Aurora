import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting for phone lookups to prevent enumeration
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const MAX_LOOKUPS = 10; // Max lookups per IP per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(clientIP: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_LOOKUPS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  record.count++;
  return { allowed: true };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';

  try {
    const { action, ...params } = await req.json();

    // Create Supabase client with service role for operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case 'search': {
        // Apply rate limiting
        const rateCheck = checkRateLimit(clientIP);
        if (!rateCheck.allowed) {
          console.warn(`Rate limit exceeded for guest search from IP: ${clientIP}`);
          return new Response(
            JSON.stringify({ 
              error: 'Muitas buscas. Tente novamente mais tarde.' 
            }),
            { 
              status: 429, 
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json',
                'Retry-After': String(rateCheck.retryAfter)
              } 
            }
          );
        }

        const { phone } = params;
        
        if (!phone) {
          return new Response(
            JSON.stringify({ error: 'Telefone é obrigatório' }),
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
          .select('id, name, confirmed')
          .eq('phone', cleanPhone);

        if (error) throw error;

        // Don't reveal if phone exists or not - always succeed
        // but return empty array if not found
        console.log(`Guest search from IP: ${clientIP}, found: ${data?.length || 0}`);
        
        return new Response(
          JSON.stringify({ guests: data || [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'confirm': {
        const { guestIds } = params;
        const { phone } = params;
        
        if (!phone || !guestIds || !Array.isArray(guestIds)) {
          return new Response(
            JSON.stringify({ error: 'Dados inválidos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const cleanPhone = String(phone).replace(/\D/g, '');

        // First, verify that all guestIds belong to this phone number
        const { data: validGuests, error: validationError } = await supabase
          .from('guests')
          .select('id')
          .eq('phone', cleanPhone);

        if (validationError) throw validationError;

        const validIds = new Set(validGuests?.map(g => g.id) || []);
        const allValid = guestIds.every(id => validIds.has(id));

        if (!allValid) {
          return new Response(
            JSON.stringify({ error: 'IDs de convidados inválidos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update confirmed status for all guests with this phone
        // Set confirmed=true for selected, confirmed=false for unselected
        const allGuestIds = Array.from(validIds);
        
        for (const id of allGuestIds) {
          const confirmed = guestIds.includes(id);
          const { error: updateError } = await supabase
            .from('guests')
            .update({ confirmed })
            .eq('id', id);
          
          if (updateError) throw updateError;
        }

        console.log(`RSVP updated for phone: ${cleanPhone.slice(-4)}, confirmed: ${guestIds.length}/${allGuestIds.length}`);
        
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
    console.error('Guest RSVP error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar solicitação' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
