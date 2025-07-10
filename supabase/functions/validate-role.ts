import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VALID_ROLES = ['admin', 'driver', 'broker']

serve(async (req) => {
  // Set CORS headers
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type'
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  try {
    // Create authenticated Supabase client
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Extract and verify JWT
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers }
      )
    }

    // Validate role
    const currentRole = user.app_metadata?.role || user.user_metadata?.role
    
    if (!currentRole || !VALID_ROLES.includes(currentRole)) {
      // Revoke invalid roles
      await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { role: null },
        user_metadata: { 
          ...(user.user_metadata || {}), 
          role: null 
        }
      })

      return new Response(
        JSON.stringify({ error: 'INVALID_ROLE', valid: false }),
        { status: 403, headers }
      )
    }

    // Successful validation
    return new Response(
      JSON.stringify({ valid: true, role: currentRole }),
      { status: 200, headers }
    )

  } catch (err) {
    console.error('Function error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers }
    )
  }
})