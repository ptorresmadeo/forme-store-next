import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validarItemsOrden, calcularTotal, ESTADOS_ORDEN } from '@/lib/ordenes';
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

  const total = calcularTotal(body.items);

  const { data: orden, error: errorOrden } = await supabase
    .from('ordenes')
    .insert({ estado, total })
    .select()
    .single();

  if (errorOrden) {
    const { status, body: errBody } = mapearErrorSupabase(errorOrden);
    return NextResponse.json(errBody, { status });
  }

  const { data: items, error: errorItemsInsert } = await supabase
    .from('orden_items')
    .insert(
      body.items.map(item => ({
        orden_id: orden.id,
        producto_id: item.producto_id,
        talla: item.talla,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      }))
    )
    .select();

  if (errorItemsInsert) {
    // Rollback manual: no dejar una orden huérfana sin items.
    await supabase.from('ordenes').delete().eq('id', orden.id);
    const { status, body: errBody } = mapearErrorSupabase(errorItemsInsert);
    return NextResponse.json(errBody, { status });
  }

  return NextResponse.json({ ...orden, orden_items: items }, { status: 201 });
}
