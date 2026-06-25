import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validarContacto } from '@/lib/contacto';
import { mapearErrorSupabase } from '@/lib/apiErrors';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido (se esperaba JSON).' }, { status: 400 });
  }

  const errores = validarContacto(body);
  if (Object.keys(errores).length > 0) {
    return NextResponse.json({ errores }, { status: 400 });
  }

  // Insert público (sin sesión de usuario): el cliente con cookies alcanza
  // porque la policy de RLS habilita "insert" para el rol "anon" en esta
  // tabla específicamente — no hace falta el cliente con service_role.
  const supabase = await createClient();
  const { error } = await supabase.from('contactos').insert({
    nombre: body.nombre.trim(),
    email: body.email.trim(),
    mensaje: body.mensaje.trim(),
  });

  if (error) {
    const { status, body: errBody } = mapearErrorSupabase(error);
    return NextResponse.json(errBody, { status });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
