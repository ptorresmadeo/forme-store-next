'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

function ProductoDetalle({ producto }) {
  const { agregarAlCarrito } = useCart();
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [agregado, setAgregado] = useState(false);
  const [errorTalla, setErrorTalla] = useState(false);

  const handleSeleccionarTalla = (t) => {
    setTallaSeleccionada(t);
    setErrorTalla(false);
  };

  const handleAgregar = () => {
    if (!tallaSeleccionada) {
      setErrorTalla(true);
      return;
    }
    agregarAlCarrito(producto, tallaSeleccionada);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <section className={`producto-detalle ${producto.categoria}`} aria-label={`Detalle de ${producto.nombre}`}>
      <Link href="/productos" className="volver-tienda">← VOLVER A LA TIENDA</Link>

      <div className="producto-detalle-grid">
        <div className="producto-detalle-img">
          <span className={`producto-badge ${producto.badge === 'SOLD OUT' ? 'sold' : ''}`}>
            {producto.badge}
          </span>
          <img src={producto.img} alt={producto.nombre} className="producto-detalle-foto" />
        </div>

        <div className="producto-detalle-info">
          <p className="producto-detalle-categoria">{producto.categoria === 'him' ? 'FOR HIM' : 'FOR HER'}</p>
          <h1 className="producto-detalle-nombre">{producto.nombre}</h1>
          <p className="producto-detalle-precio">${producto.precio.toLocaleString('es-AR')}</p>
          {producto.descripcion && (
            <p className="producto-detalle-descripcion">{producto.descripcion}</p>
          )}

          <div className={`producto-detalle-tallas ${errorTalla ? 'talla-error' : ''}`}>
            <p className="tallas-label">TALLE</p>
            <div className="producto-tallas">
              {producto.tallas.map(t => {
                const sinStock = (producto.stockPorTalla?.[t] ?? 1) <= 0;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`talla talla-seleccionable ${tallaSeleccionada === t ? 'seleccionada' : ''} ${sinStock ? 'sin-stock' : ''}`}
                    onClick={() => handleSeleccionarTalla(t)}
                    disabled={sinStock}
                    aria-pressed={tallaSeleccionada === t}
                    aria-label={`Talle ${t}${sinStock ? ' (sin stock)' : ''}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {errorTalla && (
              <p className="talla-error-msg" role="alert">Elegí un talle antes de agregar al carrito.</p>
            )}
          </div>

          <button
            className="btn-agregar btn-agregar-detalle"
            onClick={handleAgregar}
            disabled={producto.badge === 'SOLD OUT'}
          >
            {producto.badge === 'SOLD OUT' ? 'AGOTADO' : agregado ? 'AGREGADO ✓' : 'AGREGAR AL CARRITO'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductoDetalle;
