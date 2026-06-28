import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const TAXBANDITS_SANDBOX = 'https://testapi.taxbandits.com/v1.7.3';
const TAXBANDITS_PROD = 'https://api.taxbandits.com/v1.7.3';

function b64decode(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function buildJWT(userToken: string, clientSecret: string) {
  const keyBytes = b64decode(clientSecret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  return await create(
    { alg: 'HS256', typ: 'JWT' },
    { iss: userToken, iat: getNumericDate(0), exp: getNumericDate(60 * 10) },
    key,
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: authErr } = await supabase.auth.getClaims(
      authHeader.replace('Bearer ', ''),
    );
    if (authErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { returnId } = await req.json();
    const { data: ir, error: irErr } = await supabase
      .from('information_returns')
      .select('*')
      .eq('id', returnId)
      .single();
    if (irErr || !ir?.submission_id) {
      return new Response(JSON.stringify({ error: 'No submission to check' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = await buildJWT(
      Deno.env.get('TAXBANDITS_USER_TOKEN')!,
      Deno.env.get('TAXBANDITS_CLIENT_SECRET')!,
    );
    const baseUrl = ir.environment === 'production' ? TAXBANDITS_PROD : TAXBANDITS_SANDBOX;

    const res = await fetch(
      `${baseUrl}/Form1099NEC/Status?SubmissionId=${ir.submission_id}`,
      { headers: { Authorization: `Bearer ${jwt}` } },
    );
    const result = await res.json();
    const irsStatus = result?.FormNEC?.[0]?.RecordStatus ?? result?.Status ?? 'unknown';

    const normalized =
      String(irsStatus).toLowerCase().includes('accept') ? 'accepted'
        : String(irsStatus).toLowerCase().includes('reject') ? 'rejected'
        : String(irsStatus).toLowerCase().includes('transmit') ? 'transmitted'
        : ir.status;

    await supabase
      .from('information_returns')
      .update({ status: normalized })
      .eq('id', ir.id);

    return new Response(JSON.stringify({ ok: true, status: normalized, raw: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
