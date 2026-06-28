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
  // TaxBandits client secret is base64-encoded; decode before HMAC signing
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
    if (!returnId) {
      return new Response(JSON.stringify({ error: 'returnId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: ir, error: irErr } = await supabase
      .from('information_returns')
      .select('*')
      .eq('id', returnId)
      .single();
    if (irErr || !ir) {
      return new Response(JSON.stringify({ error: 'Return not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userToken = Deno.env.get('TAXBANDITS_USER_TOKEN')!;
    const clientSecret = Deno.env.get('TAXBANDITS_CLIENT_SECRET')!;
    const jwt = await buildJWT(userToken, clientSecret);

    const baseUrl = ir.environment === 'production' ? TAXBANDITS_PROD : TAXBANDITS_SANDBOX;

    const payload = {
      ReturnHeader: {
        Business: {
          BusinessNm: ir.payer_name,
          EIN: ir.payer_ein.replace(/-/g, ''),
          Email: '',
          BusinessType: 'LLC',
          USAddress: {
            Address1: ir.payer_address1,
            City: ir.payer_city,
            State: ir.payer_state,
            ZipCd: ir.payer_zip,
          },
        },
      },
      ReturnData: [
        {
          SequenceId: '1',
          Recipient: {
            RecipientId: ir.id,
            TINType: ir.recipient_tin_type,
            TIN: ir.recipient_tin.replace(/-/g, ''),
            FirstNm: ir.recipient_name.split(' ')[0],
            LastNm: ir.recipient_name.split(' ').slice(1).join(' ') || ir.recipient_name,
            Email: ir.recipient_email ?? '',
            USAddress: {
              Address1: ir.recipient_address1,
              City: ir.recipient_city,
              State: ir.recipient_state,
              ZipCd: ir.recipient_zip,
            },
          },
          NECFormData: {
            B1NonEmpCompensation: Number(ir.nonemployee_compensation),
            B4FedIncomeTaxWH: Number(ir.federal_tax_withheld),
            ...(ir.state_code
              ? {
                  States: [
                    {
                      B5StateTaxWH: Number(ir.state_tax_withheld),
                      B6StatePayerStateNo: ir.state_id ?? '',
                      B7StateIncome: Number(ir.nonemployee_compensation),
                      State: ir.state_code,
                    },
                  ],
                }
              : {}),
          },
        },
      ],
    };

    const body = {
      SubmissionManifest: {
        SubmissionId: crypto.randomUUID(),
        TaxYear: String(ir.taxx_year),
        IsFederalFiling: true,
        IsStateFiling: !!ir.state_code,
        IsPostal: false,
        IsOnlineAccess: !!ir.recipient_email,
        IsTINMatching: false,
      },
      FormNEC: payload,
    };

    const res = await fetch(`${baseUrl}/Form1099NEC/Create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();

    if (!res.ok || result?.StatusCode >= 300) {
      await supabase
        .from('information_returns')
        .update({ status: 'error', error_message: JSON.stringify(result).slice(0, 1000) })
        .eq('id', ir.id);
      return new Response(JSON.stringify({ error: 'TaxBandits error', detail: result }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subId = result?.SubmissionId ?? body.SubmissionManifest.SubmissionId;
    const recId = result?.FormNEC?.[0]?.RecordId ?? null;

    await supabase
      .from('information_returns')
      .update({
        status: 'submitted',
        submission_id: subId,
        record_id: recId,
        submitted_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('id', ir.id);

    return new Response(JSON.stringify({ ok: true, submissionId: subId, raw: result }), {
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
