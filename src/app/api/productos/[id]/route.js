import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapProducto, validarProducto } from '@/lib/productos';
import { mapearErrorSupabase } from '@/lib/apiErrors';

const SIN_FILAS = 'PGRST116';

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();

  if (error) {
    if (error.code === SIN_FILAS) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }
    const { status, body } = mapearErrorSupabase(error);
    return NextResponse.json(body, { status });
  }

  return NextResponse.json(mapProducto(data));
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido (se esperaba JSON).' }, { status: 400 });
  }

  const errores = validarProducto(body);
  if (Object.keys(errores).length > 0) {
    return NextResponse.json({ errores }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('productos')
    .update({
      titulo: body.titulo.trim(),
      precio: body.precio,
      descripcion: body.descripcion ?? null,
      categoria: body.categoria,
      imagen_url: body.imagen_url ?? null,
      stock_por_talle: body.stock_por_talle,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === SIN_FILAS) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }
    const { status, body: errBody } = mapearErrorSupabase(error);
    return NextResponse.json(errBody, { status });
  }

  return NextResponse.json(mapProducto(data));
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { error } = await supabase.from('productos').delete().eq('id', id).select().single();

  if (error) {
    if (error.code === SIN_FILAS) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }
    const { status, body } = mapearErrorSupabase(error);
    return NextResponse.json(body, { status });
  }

  return new Response(null, { status: 204 });
}
