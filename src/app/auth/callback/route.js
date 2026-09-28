import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Destino del login con Google (flujo PKCE): Supabase redirige acá con un
// "code" que se canjea por la sesión. createClient() de server.js escribe las
// cookies en la respuesta, así que el usuario llega logueado al destino.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  // Solo rutas internas: "//evil.com" o "/\evil.com" serían un open redirect.
  const destino = next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')
    ? next
    : '/mis-ordenes';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
