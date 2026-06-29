import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ESTADOS_ORDEN } from '@/lib/ordenes';
import { mapearErrorSupabase } from '@/lib/apiErrors';
import { esAdmin } from '@/lib/admin';

const SIN_FILAS = 'PGRST116';

// Esta ruta es de administración (gestionar cualquier orden). Ahora que un
// cliente también puede tener sesión, RLS por sí sola filtraría "sus"
// órdenes en vez de rechazar — eso convertiría silenciosamente este
// endpoint de admin en una versión incompleta de /mis-ordenes. Por eso el
// chequeo de admin es explícito acá, no delegado solo a la base.
async function exigirAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: 'No autenticado.' }, { status: 401 }) };
  }
  if (!(await esAdmin(supabase, user.id))) {
    return { error: NextResponse.json({ error: 'No autorizado.' }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { error: errorAuth } = await exigirAdmin(supabase);
  if (errorAuth) return errorAuth;

  const { data, error } = await supabase
    .from('ordenes')
    .select('*, orden_items(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === SIN_FILAS) {
      return NextResponse.json({ error: 'Orden no encontrada.' }, { status: 404 });
    }
    const { status, body } = mapearErrorSupabase(error);
    return NextResponse.json(body, { status });
  }

  return NextResponse.json(data);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { error: errorAuth } = await exigirAdmin(supabase);
  if (errorAuth) return errorAuth;

  const body = await request.json().catch(() => null);
  if (!body || !ESTADOS_ORDEN.includes(body.estado)) {
    return NextResponse.json(
      { errores: { estado: `El estado debe ser uno de: ${ESTADOS_ORDEN.join(', ')}.` } },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('ordenes')
    .update({ estado: body.estado })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === SIN_FILAS) {
      return NextResponse.json({ error: 'Orden no encontrada.' }, { status: 404 });
    }
    const { status, body: errBody } = mapearErrorSupabase(error);
    return NextResponse.json(errBody, { status });
  }

  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { error: errorAuth } = await exigirAdmin(supabase);
  if (errorAuth) return errorAuth;

  const { error } = await supabase.from('ordenes').delete().eq('id', id).select().single();

  if (error) {
    if (error.code === SIN_FILAS) {
      return NextResponse.json({ error: 'Orden no encontrada.' }, { status: 404 });
    }
    const { status, body } = mapearErrorSupabase(error);
    return NextResponse.json(body, { status });
  }

  return new Response(null, { status: 204 });
}
