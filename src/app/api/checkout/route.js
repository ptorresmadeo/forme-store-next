import { NextResponse } from 'next/server';
import { Preference } from 'mercadopago';
import { createClient as createClientSesion } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validarItemsCheckout } from '@/lib/checkout';
import { crearOrdenConItems } from '@/lib/ordenes';
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

  // El checkout sigue siendo guest (sin login obligatorio), pero SI el
  // comprador tiene una sesión activa, asociamos la orden a su email — para
  // que después aparezca en /mis-ordenes. Esto se deriva de la sesión real
  // (cookies validadas por Supabase), NUNCA de algo que mande el body: de lo
  // contrario cualquiera podría "asignar" una compra al email de otra
  // persona con solo escribirlo en el fetch.
  const supabaseSesion = await createClientSesion();
  const { data: { user: usuarioLogueado } } = await supabaseSesion.auth.getUser();
  const emailComprador = usuarioLogueado?.email ?? null;

  // El resto del checkout (leer productos, crear la orden) usa el cliente
  // admin porque es un flujo público sin sesión de usuario obligatoria.
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    console.error(e.message);
    return NextResponse.json({ error: 'El checkout no está configurado correctamente.' }, { status: 500 });
  }

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
  // el unit_price/precio_unitario viene SIEMPRE de "producto.precio" (Supabase),
  // nunca de algo que haya mandado el frontend.
  const itemsMercadoPago = [];
  const itemsOrden = [];
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

    itemsOrden.push({
      producto_id: producto.id,
      talla: item.talla,
      cantidad: item.cantidad,
      precio_unitario: Number(producto.precio),
    });
  }

  // La orden queda "pendiente" desde ya — el webhook la marca "pagado" (y
  // descuenta stock) recién cuando Mercado Pago confirma el pago aprobado.
  const { orden, error: errorOrden } = await crearOrdenConItems(supabase, {
    estado: 'pendiente',
    items: itemsOrden,
    email: emailComprador,
  });

  if (errorOrden) {
    console.error('Error creando la orden previa al pago:', errorOrden);
    return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 500 });
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
  // Con sesión activa, el comprador vuelve directo a ver su compra impactada
  // en /mis-ordenes; de invitado, a /success (no tiene "sus" órdenes que ver).
  const urlExito = usuarioLogueado ? `${siteUrl}/mis-ordenes` : `${siteUrl}/success`;
  const preference = new Preference(client);

  try {
    const resultado = await preference.create({
      body: {
        items: itemsMercadoPago,
        external_reference: orden.id,
        back_urls: {
          success: urlExito,
          failure: `${siteUrl}/failure`,
          pending: `${siteUrl}/pending`,
        },
        ...(esUrlPublicaHttps && { auto_return: 'approved' }),
        notification_url: `${siteUrl}/api/webhook`,
      },
    });

    return NextResponse.json({ init_point: resultado.init_point });
  } catch (e) {
    // La orden queda "pendiente" sin preferencia asociada — no decrementa stock
    // ni se marca pagada nunca, así que dejarla así no genera inconsistencias.
    console.error('Error creando preferencia de Mercado Pago:', e);
    return NextResponse.json({ error: 'No se pudo iniciar el pago. Intentá de nuevo.' }, { status: 500 });
  }
}
