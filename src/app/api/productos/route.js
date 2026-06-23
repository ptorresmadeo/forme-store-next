import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mapProducto, validarProducto, CATEGORIAS_PRODUCTO } from '@/lib/productos';
import { mapearErrorSupabase } from '@/lib/apiErrors';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria');

  if (categoria && categoria !== 'todos' && !CATEGORIAS_PRODUCTO.includes(categoria)) {
    return NextResponse.json(
      { error: 'El parámetro "categoria" debe ser "him", "her" o "todos".' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  let query = supabase.from('productos').select('*').order('creado_en', { ascending: true });
  if (categoria && categoria !== 'todos') {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;
  if (error) {
    const { status, body } = mapearErrorSupabase(error);
    return NextResponse.json(body, { status });
  }

  return NextResponse.json(data.map(mapProducto));
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

  const errores = validarProducto(body);
  if (Object.keys(errores).length > 0) {
    return NextResponse.json({ errores }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('productos')
    .insert({
      titulo: body.titulo.trim(),
      precio: body.precio,
      descripcion: body.descripcion ?? null,
      categoria: body.categoria,
      imagen_url: body.imagen_url ?? null,
      stock_por_talle: body.stock_por_talle,
    })
    .select()
    .single();

  if (error) {
    const { status, body: errBody } = mapearErrorSupabase(error);
    return NextResponse.json(errBody, { status });
  }

  return NextResponse.json(mapProducto(data), { status: 201 });
}
