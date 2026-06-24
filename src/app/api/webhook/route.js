import { NextResponse } from 'next/server';
import { Payment } from 'mercadopago';
import { getMercadoPagoClient } from '@/lib/mercadopago';
import { createAdminClient } from '@/lib/supabase/admin';

// Mercado Pago necesita una respuesta 200 rápida para no reintentar la
// notificación — por eso TODO error propio (de nuestra DB, de la API de MP,
// lo que sea) se loguea con console.error y nunca se devuelve como 4xx/5xx.
export async function POST(request) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const body = await request.json().catch(() => null);

    const tipo = body?.type ?? body?.topic ?? searchParams.type ?? searchParams.topic;
    const paymentId = body?.data?.id ?? searchParams['data.id'] ?? searchParams.id;

    console.log('[webhook mercadopago] notificación recibida:', { tipo, paymentId, searchParams, body });

    if (tipo !== 'payment' || !paymentId) {
      // Mercado Pago manda otros tipos de notificación (merchant_order, etc.)
      // que no nos interesan acá — se ignoran sin tratarlas como error.
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await procesarNotificacionDePago(paymentId);
  } catch (e) {
    console.error('[webhook mercadopago] error procesando la notificación:', e);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export async function GET(request) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  console.log('[webhook mercadopago] verificación GET:', searchParams);
  return NextResponse.json({ received: true }, { status: 200 });
}

async function procesarNotificacionDePago(paymentId) {
  // Nunca confiamos en el "status" que venga en el body de la notificación:
  // se vuelve a pedir el pago directo a la API de Mercado Pago con nuestro
  // Access Token, que es la única fuente confiable de si el pago es real.
  const client = getMercadoPagoClient();
  const payment = await new Payment(client).get({ id: paymentId });

  if (payment.status !== 'approved') {
    console.log(`[webhook mercadopago] pago ${paymentId} con estado "${payment.status}" — no se procesa.`);
    return;
  }

  const ordenId = payment.external_reference;
  if (!ordenId) {
    console.error(`[webhook mercadopago] pago ${paymentId} aprobado pero sin external_reference.`);
    return;
  }

  const supabase = createAdminClient();

  const { data: orden, error: errorBusqueda } = await supabase
    .from('ordenes')
    .select('id, estado')
    .eq('id', ordenId)
    .single();

  if (errorBusqueda || !orden) {
    console.error(`[webhook mercadopago] no se encontró la orden ${ordenId}:`, errorBusqueda);
    return;
  }

  if (orden.estado === 'pagado') {
    // Mercado Pago puede reenviar la misma notificación más de una vez —
    // si ya la procesamos, no volvemos a descontar stock.
    console.log(`[webhook mercadopago] orden ${ordenId} ya estaba pagada, se ignora (notificación duplicada).`);
    return;
  }

  const { error: errorRpc } = await supabase.rpc('confirmar_pago_orden', { p_orden_id: ordenId });
  if (errorRpc) {
    console.error(`[webhook mercadopago] error confirmando el pago de la orden ${ordenId}:`, errorRpc);
    return;
  }

  console.log(`[webhook mercadopago] orden ${ordenId} marcada como pagada y stock actualizado.`);
}
