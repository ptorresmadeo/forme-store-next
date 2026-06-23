import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cliente para Server Components (ej. /producto/[id]/page.js): a diferencia de los
// Route Handlers, un Server Component no puede mutar cookies durante el render —
// "setAll" queda en no-op y el refresh real de token ocurre en el middleware.
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
        setAll() {
          // No-op intencional: ver comentario arriba.
        },
      },
    }
  );
}
