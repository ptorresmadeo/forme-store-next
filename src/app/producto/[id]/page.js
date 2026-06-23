import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/serverComponent';
import { mapProducto } from '@/lib/productos';
import ProductoDetalle from '../../components/ProductoDetalle';

// Ruta singular ("/producto/[id]") en vez de "/productos/[id]": Next.js no permite
// que "[categoria]" y "[id]" coexistan como hijos dinámicos directos de "/productos/"
// (slugs distintos al mismo nivel de ruta). El listado filtrado por categoría sigue
// viviendo en /productos/[categoria]; el detalle de un producto puntual vive acá.
export default async function ProductoPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();

  if (error || !data) {
    notFound();
  }

  return <ProductoDetalle producto={mapProducto(data)} />;
}
