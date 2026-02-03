import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting store (resets on cold start, but provides basic protection)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(clientIP: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  record.count++;
  return { allowed: true };
}

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert string to base64
function stringToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// Helper to convert base64 to string
function base64ToString(b64: string): string {
  return decodeURIComponent(escape(atob(b64)));
}

// Create HMAC signature for token
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return arrayBufferToBase64(signature);
}

// Create a signed token
async function createToken(username: string, secret: string): Promise<string> {
  const payload = {
    sub: username,
    iat: Date.now(),
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };
  
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = stringToBase64(payloadStr);
  const signature = await createSignature(payloadB64, secret);
  
  return `${payloadB64}.${signature}`;
}

// Validate a signed token
async function validateToken(token: string, secret: string): Promise<{ valid: boolean; username?: string }> {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) {
      return { valid: false };
    }
    
    // Verify signature
    const expectedSignature = await createSignature(payloadB64, secret);
    if (signature !== expectedSignature) {
      return { valid: false };
    }
    
    // Decode and check expiry
    const payloadStr = base64ToString(payloadB64);
    const payload = JSON.parse(payloadStr);
    
    if (Date.now() > payload.exp) {
      return { valid: false };
    }
    
    return { valid: true, username: payload.sub };
  } catch {
    return { valid: false };
  }
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
    const body = await req.json();
    const { action, username, password, token } = body;

    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!adminPassword) {
      console.error('Admin password not configured');
      return new Response(
        JSON.stringify({ error: 'Credenciais não configuradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use admin password as HMAC secret for token signing
    const tokenSecret = adminPassword;

    // Handle token validation
    if (action === 'validate') {
      if (!token) {
        return new Response(
          JSON.stringify({ valid: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const result = await validateToken(token, tokenSecret);
      return new Response(
        JSON.stringify({ valid: result.valid }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle login - apply rate limiting
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: `Muitas tentativas. Tente novamente em ${Math.ceil(rateCheck.retryAfter! / 60)} minutos.` 
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

    const adminUsername = Deno.env.get('ADMIN_USERNAME');

    if (!adminUsername) {
      console.error('Admin credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Credenciais não configuradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (username === adminUsername && password === adminPassword) {
      // Generate a signed token
      const newToken = await createToken(username, tokenSecret);
      
      console.log(`Successful login from IP: ${clientIP}`);
      
      return new Response(
        JSON.stringify({ success: true, token: newToken }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.warn(`Failed login attempt for user: ${username} from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Usuário ou senha inválidos' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar autenticação' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
