import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.error('URL:', supabaseUrl ? 'Present' : 'Missing')
  console.error('Key:', supabaseKey ? 'Present' : 'Missing')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // We're not using Supabase Auth
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
})

// Test the connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('Connection test failed:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Connection test exception:', err)
    return false
  }
}