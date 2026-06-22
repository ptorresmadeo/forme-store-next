import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { todosLosProductos } from '../data/productos';

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

function Catalogo({ categoria, cambiarCategoria }) {
  const router = useRouter();
  const productosFiltrados = categoria === 'todos'
    ? todosLosProductos
    : todosLosProductos.filter(p => p.categoria === categoria);

  return (
    <div>
      <section className="categorias" id="categorias" aria-label="Categorías">
        <button
          className={`cat-btn ${categoria === 'him' ? 'activo' : ''}`}
          onClick={() => { cambiarCategoria('him'); router.replace('/productos/him', { scroll: false }); }}
          style={categoria === 'him' ? { fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '4px', fontSize: '16px' } : {}}
        >
          <span className="cat-label">FOR HIM</span>
        </button>
        <button
          className={`cat-btn ${categoria === 'her' ? 'activo' : ''}`}
          onClick={() => { cambiarCategoria('her'); router.replace('/productos/her', { scroll: false }); }}
          style={categoria === 'her' ? { fontFamily: "'Cormorant Garamond', serif", letterSpacing: '4px', fontSize: '16px' } : {}}
        >
          <span className="cat-label">FOR HER</span>
        </button>
        <button
          className={`cat-btn ${categoria === 'todos' ? 'activo' : ''}`}
          onClick={() => { cambiarCategoria('todos'); router.replace('/productos', { scroll: false }); }}
        >
          <span className="cat-label">VER TODO</span>
        </button>
      </section>

      <section className={`productos ${categoria !== 'todos' ? categoria : ''}`} id="productos" aria-label="Catálogo de productos">
        <div className="section-header">
          <h2>LATEST DROP</h2>
        </div>
        <div className="productos-grid">
          {productosFiltrados.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Catalogo;
