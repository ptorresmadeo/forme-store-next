import Link from 'next/link';

// A diferencia de SuccessPage, esta NO toca el carrito: el pago no se
// confirmó, así que los items deben seguir ahí para que el usuario reintente.
function FailurePage() {
  return (
    <section className="estado-pago" aria-label="Pago rechazado">
      <span className="estado-pago-icono fallo" aria-hidden="true">✕</span>
      <h1>EL PAGO NO PUDO PROCESARSE</h1>
      <p>Algo falló al confirmar tu pago. Tus productos siguen en el carrito, podés intentarlo de nuevo.</p>
      <Link href="/cart" className="btn-primary">REINTENTAR PAGO</Link>
    </section>
  );
}

export default FailurePage;
