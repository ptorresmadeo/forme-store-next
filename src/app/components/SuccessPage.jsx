'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

function SuccessPage() {
  const { vaciarCarrito, hidratado } = useCart();

  // Mercado Pago redirige con una navegación completa (no un <Link> interno),
  // así que CartContext se remonta de cero y recién termina de leer
  // localStorage DESPUÉS del primer render. Si vaciáramos en un efecto "solo
  // al montar" (deps: []), esa lectura de hidratación llegaría más tarde y
  // pisaría el vaciado con el carrito viejo. Por eso esperamos "hidratado".
  useEffect(() => {
    if (hidratado) {
      vaciarCarrito();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidratado]);

  return (
    <section className="estado-pago" aria-label="Pago confirmado">
      <span className="estado-pago-icono exito" aria-hidden="true">✓</span>
      <h1>¡PAGO CONFIRMADO!</h1>
      <p>Tu pedido ya está siendo procesado. Te vamos a contactar para coordinar la entrega.</p>
      <Link href="/productos" className="btn-primary">VOLVER A LA TIENDA</Link>
    </section>
  );
}

export default SuccessPage;
