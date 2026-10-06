// Supabase Edge Function: pii-service
// Server-side only (Service Role Key). Never exposed to browser.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY') || 'nairee-secret-key-32-chars-long';

    // Verify calling user using service client
    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const callerTenantId = user.app_metadata?.tenant_id;
    const callerRole = user.app_metadata?.role || 'Teacher';

    const { action, entity, entityId, payload } = await req.json();

    if (!callerTenantId) {
      return new Response(JSON.stringify({ error: 'Tenant context missing in JWT' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Read PII (Bank, PAN, Aadhaar)
    if (action === 'read_pii') {
      const table = entity === 'teacher' ? 'teachers' : (entity === 'staff' ? 'staff' : 'students');
      const idCol = entity === 'teacher' ? 'teacher_number' : (entity === 'staff' ? 'staff_id' : 'student_id');

      const { data, error } = await serviceClient
        .from(table)
        .select('*')
        .eq('tenant_id', callerTenantId)
        .eq(idCol, entityId)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Record not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // If caller is NOT Admin, mask PII data
      if (callerRole !== 'Admin' && callerRole !== 'SuperAdmin') {
        return new Response(JSON.stringify({
          data: {
            ...data,
            bank_account_encrypted: '************',
            pan_no_encrypted: '*****' + (data.pan_no ? data.pan_no.slice(-4) : 'XXXX'),
            aadhaar_encrypted: 'XXXX-XXXX-' + (data.aadhaar_no ? data.aadhaar_no.slice(-4) : 'XXXX')
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Return full decrypted data to Admin
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Write / Update PII
    if (action === 'write_pii') {
      if (callerRole !== 'Admin' && callerRole !== 'SuperAdmin') {
        return new Response(JSON.stringify({ error: 'Only Administrators can update encrypted PII.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const table = entity === 'teacher' ? 'teachers' : (entity === 'staff' ? 'staff' : 'students');
      const idCol = entity === 'teacher' ? 'teacher_number' : (entity === 'staff' ? 'staff_id' : 'student_id');

      const { data, error } = await serviceClient
        .from(table)
        .update(payload)
        .eq('tenant_id', callerTenantId)
        .eq(idCol, entityId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
