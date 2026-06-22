'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useScrolled } from '../hooks/useScrolled';

function Navbar() {
  const { totalItems } = useCart();
  const scrolled = useScrolled(80);

  return (
    <header className="navbar" role="banner">
      <div className={`navbar-logo-wrap ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/" aria-label="Ir al inicio">
          <img src="/logo.png" alt="For Me Studios" className="navbar-logo-img" />
        </Link>
      </div>
      <nav className={scrolled ? 'oculto-mobile' : ''} role="navigation" aria-label="Menú principal">
        <ul>
          <li><Link href="/productos">STORE</Link></li>
          <li><a href="#contacto">CONTACTO</a></li>
          <li>
            <Link href="/cart" aria-label="Ver carrito de compras">
              CART ({totalItems})
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
