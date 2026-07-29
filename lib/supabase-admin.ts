// Server-side Supabase client (bypasses RLS)
import { createClient } from '@supabase/supabase-js'

let adminInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!adminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Supabase admin environment variables are not set. ' +
        'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured.'
      )
    }

    adminInstance = createClient(supabaseUrl, supabaseServiceKey)
  }
  return adminInstance
}

// Convenience export — proxy defers client creation until first use
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient>]
  }
})