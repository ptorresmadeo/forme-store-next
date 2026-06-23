import { NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { validarItemsCheckout } from '@/lib/checkout';
import { getMercadoPagoClient } from '@/lib/mercadopago';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido (se esperaba JSON).' }, { status: 400 });
  }

  const errorItems = validarItemsCheckout(body.items);
  if (errorItems) {
    return NextResponse.json({ error: errorItems }, { status: 400 });
  }

  const supabase = await createClient();
  const idsUnicos = [...new Set(body.items.map(item => item.id))];

  const { data: productosDb, error } = await supabase
    .from('productos')
    .select('*')
    .in('id', idsUnicos);

  if (error) {
    return NextResponse.json({ error: 'No se pudo validar el carrito.' }, { status: 500 });
  }

  const productosPorId = new Map(productosDb.map(p => [p.id, p]));

  // Acá está la validación estricta que evita manipular precios desde el cliente:
  // el unit_price que se manda a Mercado Pago viene SIEMPRE de "producto.precio"
  // (Supabase), nunca de algo que haya mandado el frontend.
  const itemsMercadoPago = [];
  for (const item of body.items) {
    const producto = productosPorId.get(item.id);
    if (!producto) {
      return NextResponse.json({ error: `El producto ${item.id} no existe o fue eliminado.` }, { status: 400 });
    }

    const stockTalla = producto.stock_por_talle?.[item.talla] ?? 0;
    if (stockTalla < item.cantidad) {
      return NextResponse.json(
        { error: `No hay stock suficiente de "${producto.titulo}" en talle ${item.talla}.` },
        { status: 409 }
      );
    }

    itemsMercadoPago.push({
      id: producto.id,
      title: `${producto.titulo} (Talle ${item.talla})`,
      picture_url: producto.imagen_url || undefined,
      quantity: item.cantidad,
      unit_price: Number(producto.precio),
      currency_id: 'ARS',
    });
  }

  let client;
  try {
    client = getMercadoPagoClient();
  } catch (e) {
    console.error(e.message);
    return NextResponse.json({ error: 'El pago no está configurado correctamente.' }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  // Mercado Pago rechaza "auto_return" si back_urls no es una URL pública
  // alcanzable (ej. localhost): "auto_return invalid. back_url.success must be
  // defined". Solo lo activamos cuando el sitio corre en una URL https pública.
  const esUrlPublicaHttps = siteUrl.startsWith('https://');
  const preference = new Preference(client);

  try {
    const resultado = await preference.create({
      body: {
        items: itemsMercadoPago,
        back_urls: {
          success: `${siteUrl}/cart?pago=exito`,
          failure: `${siteUrl}/cart?pago=fallo`,
          pending: `${siteUrl}/cart?pago=pendiente`,
        },
        ...(esUrlPublicaHttps && { auto_return: 'approved' }),
        notification_url: `${siteUrl}/api/webhook`,
      },
    });

    return NextResponse.json({ init_point: resultado.init_point });
  } catch (e) {
    console.error('Error creando preferencia de Mercado Pago:', e);
    return NextResponse.json({ error: 'No se pudo iniciar el pago. Intentá de nuevo.' }, { status: 500 });
  }
}
