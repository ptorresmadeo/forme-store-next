import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ESTADOS_ORDEN } from '@/lib/ordenes';
import { mapearErrorSupabase } from '@/lib/apiErrors';

const SIN_FILAS = 'PGRST116';

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

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
