import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validarEmail } from '@/lib/validacion';
import { mapearErrorSupabase } from '@/lib/apiErrors';

// 42P01 = la tabla no existe en Postgres; PGRST205 = PostgREST no la encuentra
// en su schema cache. Pasa mientras no se haya corrido 0007_newsletter.sql.
const TABLA_INEXISTENTE = ['42P01', 'PGRST205'];

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido (se esperaba JSON).' }, { status: 400 });
  }

  const errorEmail = validarEmail(body.email);
  if (errorEmail) {
    return NextResponse.json({ errores: { email: errorEmail } }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('suscriptores_newsletter')
    .insert({ email: body.email.trim().toLowerCase() });

  if (error) {
    // 23505 = email ya suscripto. Para quien se suscribe el resultado es el
    // mismo, y no revelamos si un email ya estaba en la lista.
    if (error.code === '23505') {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    // Temporal hasta crear la tabla: la landing no se rompe, pero el email
    // no se guarda en ningún lado.
    if (TABLA_INEXISTENTE.includes(error.code)) {
      console.warn('[newsletter] Falta la tabla suscriptores_newsletter — suscripción simulada.');
      return NextResponse.json({ ok: true, simulado: true }, { status: 200 });
    }
    const { status, body: errBody } = mapearErrorSupabase(error);
    return NextResponse.json(errBody, { status });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
