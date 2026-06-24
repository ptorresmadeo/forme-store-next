import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validarItemsOrden, crearOrdenConItems, ESTADOS_ORDEN } from '@/lib/ordenes';
import { mapearErrorSupabase } from '@/lib/apiErrors';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('ordenes')
    .select('*, orden_items(*)')
    .order('fecha', { ascending: false });

  if (error) {
    const { status, body } = mapearErrorSupabase(error);
    return NextResponse.json(body, { status });
  }

  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido (se esperaba JSON).' }, { status: 400 });
  }

  const errorItems = validarItemsOrden(body.items);
  if (errorItems) {
    return NextResponse.json({ errores: { items: errorItems } }, { status: 400 });
  }

  const estado = body.estado ?? 'pendiente';
  if (!ESTADOS_ORDEN.includes(estado)) {
    return NextResponse.json({ errores: { estado: 'Estado inválido.' } }, { status: 400 });
  }

  const { orden, error } = await crearOrdenConItems(supabase, { estado, items: body.items });

  if (error) {
    const { status, body: errBody } = mapearErrorSupabase(error);
    return NextResponse.json(errBody, { status });
  }

  return NextResponse.json(orden, { status: 201 });
}
