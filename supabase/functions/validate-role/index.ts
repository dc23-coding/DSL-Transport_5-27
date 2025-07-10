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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { 
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    // Extract JWT from header
    const authHeader = req.headers.get('Authorization')!
    const jwt = authHeader.replace('Bearer ', '')

    // Verify the JWT and get user
    const { data: { user }, error } = await supabase.auth.getUser(jwt)
    if (error || !user) throw new Error('Invalid auth token')

    // Check role in both metadata locations
    const currentRole = user.app_metadata?.role || user.user_metadata?.role
    
    if (!currentRole || !VALID_ROLES.includes(currentRole)) {
      // Revoke invalid roles
      await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { role: null },
        user_metadata: { ...(user.user_metadata || {}), role: null }
      })

      return new Response(
        JSON.stringify({ valid: false, error: 'INVALID_ROLE' }),
        { status: 403, headers }
      )
    }

    return new Response(
      JSON.stringify({ valid: true, role: currentRole }),
      { status: 200, headers }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers }
    )
  }
})
