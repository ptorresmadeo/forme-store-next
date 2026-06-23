'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

// Agrupa las líneas del carrito (id + talla) por producto para mostrar
// "Nombre xN total" con el desglose de talles debajo.
function agruparPorProducto(carrito) {
  const grupos = [];
  for (const item of carrito) {
    let grupo = grupos.find(g => g.id === item.id);
    if (!grupo) {
      grupo = { id: item.id, nombre: item.nombre, img: item.img, lineas: [] };
      grupos.push(grupo);
    }
    grupo.lineas.push(item);
  }
  return grupos;
}

function CartPage() {
  const { carrito, eliminarItem, incrementarCantidad, decrementarCantidad, vaciarCarrito } = useCart();
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const grupos = agruparPorProducto(carrito);

  const [procesandoPago, setProcesandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  const handleFinalizarCompra = async () => {
    setProcesandoPago(true);
    setErrorPago('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Solo mandamos id/talla/cantidad — el precio lo calcula el servidor
        // a partir de la base, nunca confiamos en lo que ya está en el Context.
        body: JSON.stringify({
          items: carrito.map(item => ({ id: item.id, talla: item.talla, cantidad: item.cantidad })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorPago(data.error || 'No se pudo iniciar el pago.');
        setProcesandoPago(false);
        return;
      }

      window.location.href = data.init_point;
    } catch {
      setErrorPago('No se pudo conectar con Mercado Pago. Intentá de nuevo.');
      setProcesandoPago(false);
    }
  };

  return (
    <section className="cart-page" aria-label="Carrito de compras">
      <Link href="/productos" className="volver-tienda">← VOLVER A LA TIENDA</Link>
      <h1>TU CARRITO</h1>

      {carrito.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío.</p>
      ) : (
        <>
          <div className="cart-page-items">
            {grupos.map(grupo => {
              const totalGrupo = grupo.lineas.reduce((acc, l) => acc + l.cantidad, 0);
              const subtotalGrupo = grupo.lineas.reduce((acc, l) => acc + l.precio * l.cantidad, 0);

              return (
                <div key={grupo.id} className="cart-page-grupo">
                  <div className="cart-page-grupo-header">
                    <img src={grupo.img} alt={grupo.nombre} />
                    <div className="cart-page-grupo-info">
                      <p className="cart-page-item-nombre">{grupo.nombre}</p>
                      <p className="cart-page-item-cantidad">
                        {totalGrupo} unidad{totalGrupo > 1 ? 'es' : ''} en total
                      </p>
                    </div>
                    <span className="cart-page-item-precio">
                      ${subtotalGrupo.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="cart-page-lineas">
                    {grupo.lineas.map(linea => (
                      <div key={`${linea.id}-${linea.talla}`} className="cart-page-linea">
                        <span className="cart-page-linea-talla">Talle {linea.talla}</span>

                        <div className="cart-page-qty">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => decrementarCantidad(linea.id, linea.talla)}
                            disabled={linea.cantidad <= 1}
                            aria-label={`Restar unidad de ${grupo.nombre} talle ${linea.talla}`}
                          >
                            −
                          </button>
                          <span className="qty-valor">{linea.cantidad}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => incrementarCantidad(linea.id, linea.talla)}
                            aria-label={`Sumar unidad de ${grupo.nombre} talle ${linea.talla}`}
                          >
                            +
                          </button>
                        </div>

                        <span className="cart-page-linea-precio">
                          ${(linea.precio * linea.cantidad).toLocaleString('es-AR')}
                        </span>

                        <button
                          type="button"
                          className="btn-eliminar"
                          onClick={() => eliminarItem(linea.id, linea.talla)}
                          aria-label={`Eliminar ${grupo.nombre} talle ${linea.talla} del carrito`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-page-footer">
            <p className="carrito-total">TOTAL: ${total.toLocaleString('es-AR')}</p>
            <button className="btn-vaciar" onClick={vaciarCarrito}>VACIAR CARRITO</button>
          </div>

          {errorPago && <p className="error cart-page-error-pago" role="alert">{errorPago}</p>}

          <button
            className="btn-primary cart-page-checkout"
            onClick={handleFinalizarCompra}
            disabled={procesandoPago}
          >
            {procesandoPago ? 'REDIRIGIENDO...' : 'FINALIZAR COMPRA'}
          </button>
        </>
      )}
    </section>
  );
}

export default CartPage;
