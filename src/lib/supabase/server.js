import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cliente para Route Handlers: cookies().set() sí puede escribir la respuesta saliente,
// así que el refresh de token funciona de punta a punta.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
