import { NextResponse } from 'next/server';

// Stub: por ahora solo registra lo que manda Mercado Pago y responde 200.
// El manejo real (confirmar el pago con la API de Payments y actualizar la
// orden/stock) queda para una próxima vuelta.
export async function POST(request) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const body = await request.json().catch(() => null);

  console.log('[webhook mercadopago] notificación recibida:', { searchParams, body });

  return NextResponse.json({ received: true }, { status: 200 });
}

export async function GET(request) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  console.log('[webhook mercadopago] verificación GET:', searchParams);
  return NextResponse.json({ received: true }, { status: 200 });
}
