import Link from 'next/link';

export default function ProductoNoEncontrado() {
  return (
    <section className="producto-no-encontrado">
      <h1>PRODUCTO NO ENCONTRADO</h1>
      <p>El producto que buscás no existe o ya no está disponible.</p>
      <Link href="/productos" className="btn-primary">VOLVER A LA TIENDA</Link>
    </section>
  );
}
