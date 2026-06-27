// lib/db.js
// Supabase client — used for all PostgreSQL database operations.
// Supabase wraps PostgreSQL with a REST API + realtime + auth helpers.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

// 1. Client-side / public operations (respects Row-Level Security)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Server-side / admin operations (bypasses Row-Level Security)
// Configured with no session persistence or token refresh since it is a stateless server context.
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

if (!supabaseAdmin && typeof window === 'undefined') {
  console.warn(
    '[db] SUPABASE_SERVICE_ROLE_KEY is missing. ' +
    'Server-side admin operations relying on RLS bypass will fail.'
  );
}

export { supabase, supabaseAdmin };
