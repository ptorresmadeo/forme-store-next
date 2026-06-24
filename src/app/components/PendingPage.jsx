import Link from 'next/link';

// Tampoco vacía el carrito: el pago todavía puede resolverse (aprobarse o
// rechazarse) más tarde — el webhook es quien actualiza la orden cuando
// Mercado Pago confirme el resultado final.
function PendingPage() {
  return (
    <section className="estado-pago" aria-label="Pago pendiente">
      <span className="estado-pago-icono pendiente" aria-hidden="true">⏱</span>
      <h1>TU PAGO ESTÁ PENDIENTE</h1>
      <p>
        Mercado Pago todavía está procesando tu pago (puede pasar con algunos medios de pago).
        Tus productos siguen en el carrito.
      </p>
      <Link href="/cart" className="btn-primary">VOLVER AL CARRITO</Link>
    </section>
  );
}

export default PendingPage;
