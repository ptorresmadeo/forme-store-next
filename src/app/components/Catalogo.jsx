import { useState } from 'react';
import { useRouter } from 'next/navigation';

const productos = {
  him: [
    { id: 1, nombre: 'Zip Hoodie Forme', precio: 89000, img: '/hoodie-him.jpg', imgHover: null, badge: 'NUEVO', tallas: ['S','M','L','XL'], categoria: 'him' },
    { id: 2, nombre: 'Short Cuadrillé', precio: 65000, img: '/short-him.jpg', imgHover: '/short-him-back.jpg', badge: 'NUEVO', tallas: ['S','M','L','XL'], categoria: 'him' },
  ],
  her: [
    { id: 3, nombre: 'Zip Hoodie Forme', precio: 89000, img: '/campera-her.jpg', imgHover: null, badge: 'NUEVO', tallas: ['XS','S','M','L'], categoria: 'her' },
    { id: 4, nombre: 'Short Cuadrillé', precio: 65000, img: '/short-her.jpg', imgHover: null, badge: 'NUEVO', tallas: ['XS','S','M','L'], categoria: 'her' },
  ]
};

const todosLosProductos = [...productos.him, ...productos.her];

function ProductCard({ p, agregarAlCarrito }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="producto-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
      <div className="producto-info">
        <p className="producto-nombre">{p.nombre}</p>
        <p className="producto-precio">${p.precio.toLocaleString('es-AR')}</p>
        <div className="producto-tallas">
          {p.tallas.map(t => <span key={t} className="talla">{t}</span>)}
        </div>
        <button
          className="btn-agregar"
          onClick={() => agregarAlCarrito(p)}
          disabled={p.badge === 'SOLD OUT'}
        >
          {p.badge === 'SOLD OUT' ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
        </button>
      </div>
    </article>
  );
}

function Catalogo({ categoria, cambiarCategoria, agregarAlCarrito }) {
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
  style={categoria === 'him' ? {fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '4px', fontSize: '16px'} : {}}
>
  <span className="cat-label">FOR HIM</span>
</button>
<button
  className={`cat-btn ${categoria === 'her' ? 'activo' : ''}`}
  onClick={() => { cambiarCategoria('her'); router.replace('/productos/her', { scroll: false }); }}
  style={categoria === 'her' ? {fontFamily: "'Cormorant Garamond', serif", letterSpacing: '4px', fontSize: '16px'} : {}}
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
          <span>VER TODO →</span>
        </div>
        <div className="productos-grid">
          {productosFiltrados.map(p => (
            <ProductCard key={p.id} p={p} agregarAlCarrito={agregarAlCarrito} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Catalogo;