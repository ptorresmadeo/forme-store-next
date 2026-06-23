import { createBrowserClient } from '@supabase/ssr';

// Cliente para componentes 'use client' (hoy solo lo usa el form de login del admin).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
