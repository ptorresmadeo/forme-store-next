import Link from 'next/link';
import { createClient } from '@/lib/supabase/serverComponent';

// El proxy ya protege esta ruta (redirige a /login sin sesión), pero el
// filtro por email se hace explícito acá también — esta pantalla nunca
// depende únicamente de RLS para no mostrar compras de otra persona.
export default async function MisOrdenesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data: ordenes } = await supabase
    .from('ordenes')
    .select('*, orden_items(*, productos(titulo))')
    .eq('email', user.email)
    .order('fecha', { ascending: false });

  return (
    <section className="cart-page" aria-label="Mis órdenes">
      <Link href="/productos" className="volver-tienda">← VOLVER A LA TIENDA</Link>
      <h1>MIS ÓRDENES</h1>

      {!ordenes?.length ? (
        <p className="carrito-vacio">Todavía no hiciste ninguna compra.</p>
      ) : (
        <div className="cart-page-items">
          {ordenes.map(orden => (
            <div key={orden.id} className="cart-page-grupo">
              <div className="cart-page-grupo-header">
                <div className="cart-page-grupo-info">
                  <p className="cart-page-item-nombre">
                    Orden del {new Date(orden.fecha).toLocaleDateString('es-AR')}
                  </p>
                  <p className="cart-page-item-cantidad">Estado: {orden.estado}</p>
                </div>
                <span className="cart-page-item-precio">
                  ${Number(orden.total).toLocaleString('es-AR')}
                </span>
              </div>

              <div className="cart-page-lineas">
                {orden.orden_items.map(item => (
                  <div key={item.id} className="cart-page-linea">
                    <span className="cart-page-linea-talla">
                      {item.productos?.titulo ?? 'Producto'} — Talle {item.talla} ×{item.cantidad}
                    </span>
                    <span className="cart-page-linea-precio">
                      ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
