import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true); // carga inicial desde la API
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // transición visual al cambiar de categoría
  const timeoutRef = useRef(null);

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
  const seleccionarCategoria = (nuevaCategoria, ruta) => {
    cambiarCategoria(nuevaCategoria);
    router.replace(ruta, { scroll: false });

    setIsLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setProductosFiltrados(filtrarPorCategoria(productos, nuevaCategoria));
      setIsLoading(false);
    }, RETRASO_FILTRO_MS);
  };

  return (
    <div>
      <section className="categorias" id="categorias" aria-label="Categorías">
        <button
          className={`cat-btn ${categoria === 'him' ? 'activo' : ''}`}
          onClick={() => seleccionarCategoria('him', '/productos/him')}
          style={categoria === 'him' ? { fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '4px', fontSize: '16px' } : {}}
        >
          <span className="cat-label">FOR HIM</span>
        </button>
        <button
          className={`cat-btn ${categoria === 'her' ? 'activo' : ''}`}
          onClick={() => seleccionarCategoria('her', '/productos/her')}
          style={categoria === 'her' ? { fontFamily: "'Cormorant Garamond', serif", letterSpacing: '4px', fontSize: '16px' } : {}}
        >
          <span className="cat-label">FOR HER</span>
        </button>
        <button
          className={`cat-btn ${categoria === 'todos' ? 'activo' : ''}`}
          onClick={() => seleccionarCategoria('todos', '/productos')}
        >
          <span className="cat-label">VER TODO</span>
        </button>
      </section>

      <section className={`productos ${categoria !== 'todos' ? categoria : ''}`} id="productos" aria-label="Catálogo de productos">
        <div className="section-header">
          <h2>LATEST DROP</h2>
        </div>

        {(loading || isLoading) && <p className="catalogo-estado">Cargando productos...</p>}

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
      </section>
    </div>
  );
}

export default Catalogo;
