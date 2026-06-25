import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Loader from './Loader';

function ProductCard({ p }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="producto-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/producto/${p.id}`} className="producto-img-link">
        <div className="producto-img">
          <span className={`producto-badge ${p.badge === 'SOLD OUT' ? 'sold' : ''}`}>
            {p.badge}
          </span>
          <img
            src={hovered && p.imgHover ? p.imgHover : p.img}
            alt={p.nombre}
            className="producto-foto"
          />
        </div>
      </Link>
      <div className="producto-info">
        <Link href={`/producto/${p.id}`} className="producto-nombre-link">
          <p className="producto-nombre">{p.nombre}</p>
          <p className="producto-precio">${p.precio.toLocaleString('es-AR')}</p>
        </Link>
        <div className="producto-tallas">
          {p.tallas.map(t => <span key={t} className="talla">{t}</span>)}
        </div>
        {p.badge === 'SOLD OUT' ? (
          <button className="btn-agregar" disabled>AGOTADO</button>
        ) : (
          // El talle es obligatorio para agregar al carrito y solo se elige en /producto/[id];
          // desde el catálogo el CTA lleva al detalle en vez de agregar directo.
          <Link href={`/producto/${p.id}`} className="btn-agregar">VER PRODUCTO</Link>
        )}
      </div>
    </article>
  );
}

const RETRASO_FILTRO_MS = 500;

function filtrarPorCategoria(productos, categoria) {
  return categoria === 'todos' ? productos : productos.filter(p => p.categoria === categoria);
}

function Catalogo({ categoria, cambiarCategoria }) {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true); // carga inicial desde la API
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // transición visual al cambiar de categoría
  const [alturaReservada, setAlturaReservada] = useState(null);
  const timeoutRef = useRef(null);
  const contenidoRef = useRef(null);

  const cargarProductos = () => {
    setLoading(true);
    setError(false);
    fetch('/api/productos')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setProductosFiltrados(filtrarPorCategoria(data, categoria));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarProductos();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1) El loader se activa de inmediato y queda pintado en pantalla durante
  // RETRASO_FILTRO_MS; el filtrado real (setProductosFiltrados) recién pasa
  // DESPUÉS de ese retraso, para que nunca se pisen en el mismo render.
  //
  // Antes de ocultar el grid, medimos su altura actual y la "clavamos" como
  // min-height del contenedor: sin esto, el grid se reemplaza por un párrafo
  // corto de "Cargando...", el documento se desploma, y el navegador fuerza
  // el scroll hacia abajo porque la posición actual ya no entra en la página
  // (y no se recupera solo cuando el contenido real vuelve). Reservar la
  // altura evita que el documento colapse durante la transición.
  //
  // La URL se sincroniza con history.replaceState (no con el router de
  // Next.js): el cambio de categoría ya lo maneja el estado local de arriba,
  // y un router.replace() acá navega a una ruta distinta (/productos/[categoria])
  // que remonta este componente entero — reseteando el estado y volviendo a
  // pedir /api/productos — repitiendo el mismo colapso por otra vía.
  const seleccionarCategoria = (nuevaCategoria, ruta) => {
    if (contenidoRef.current) {
      setAlturaReservada(contenidoRef.current.offsetHeight);
    }

    cambiarCategoria(nuevaCategoria);
    window.history.replaceState(null, '', ruta);

    setIsLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setProductosFiltrados(filtrarPorCategoria(productos, nuevaCategoria));
      setIsLoading(false);
      setAlturaReservada(null); // el grid nuevo ya tiene su propia altura real
    }, RETRASO_FILTRO_MS);
  };

  return (
    <div>
      <section className={`categorias ${categoria === 'him' ? 'him' : ''}`} id="categorias" aria-label="Categorías">
        <button
          className={`cat-btn ${categoria === 'him' ? 'activo' : ''}`}
          onClick={() => seleccionarCategoria('him', '/productos/him')}
          style={categoria === 'him' ? { fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '4px', fontSize: '16px' } : {}}
          aria-pressed={categoria === 'him'}
        >
          <span className="cat-label">FOR HIM</span>
        </button>
        <button
          className={`cat-btn ${categoria === 'her' ? 'activo' : ''}`}
          onClick={() => seleccionarCategoria('her', '/productos/her')}
          style={categoria === 'her' ? { fontFamily: "'Cormorant Garamond', serif", letterSpacing: '4px', fontSize: '16px' } : {}}
          aria-pressed={categoria === 'her'}
        >
          <span className="cat-label">FOR HER</span>
        </button>
        <button
          className={`cat-btn ${categoria === 'todos' ? 'activo' : ''}`}
          onClick={() => seleccionarCategoria('todos', '/productos')}
          aria-pressed={categoria === 'todos'}
        >
          <span className="cat-label">VER TODO</span>
        </button>
      </section>

      <section className={`productos ${categoria !== 'todos' ? categoria : ''}`} id="productos" aria-label="Catálogo de productos">
        <div className="section-header">
          <h2>LATEST DROP</h2>
        </div>

        <div
          className={`productos-contenido ${(loading || isLoading) ? 'centrado' : ''}`}
          ref={contenidoRef}
          style={alturaReservada ? { minHeight: `${alturaReservada}px` } : undefined}
        >
          {(loading || isLoading) && <Loader pantallaCompleta={false} />}

          {error && (
            <div className="catalogo-estado catalogo-error">
              <p>No pudimos cargar el catálogo.</p>
              <button className="btn-ghost" onClick={cargarProductos}>REINTENTAR</button>
            </div>
          )}

          {!loading && !error && !isLoading && (
            <div className="productos-grid">
              {productosFiltrados.map(p => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Catalogo;
