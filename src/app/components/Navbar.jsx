'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useScrolled } from '../hooks/useScrolled';
import { createClient } from '@/lib/supabase/client';

function Navbar() {
  const { totalItems } = useCart();
  const scrolled = useScrolled(80);
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUsuario(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUsuario(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuAbierto]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUsuario(null);
    router.push('/');
    router.refresh();
  };

  const cerrar = () => setMenuAbierto(false);

  return (
    <>
      {/* Botón hamburguesa — fijo en la esquina superior izquierda */}
      <button
        className={`hamburger-btn ${menuAbierto ? 'oculto' : ''}`}
        onClick={() => setMenuAbierto(v => !v)}
        aria-label="Abrir menú"
        aria-expanded={menuAbierto}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay oscuro detrás del drawer */}
      <div
        className={`drawer-overlay ${menuAbierto ? 'abierto' : ''}`}
        onClick={cerrar}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <aside
        className={`drawer ${menuAbierto ? 'abierto' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className="drawer-header">
          <span className="drawer-brand">FOR ME</span>
          <button className="drawer-close" onClick={cerrar} aria-label="Cerrar menú">✕</button>
        </div>

        <div className="drawer-section">
          <p className="drawer-label">FILTRAR</p>
          <Link href="/productos/him" className="drawer-item" onClick={cerrar}>FOR HIM</Link>
          <Link href="/productos/her" className="drawer-item" onClick={cerrar}>FOR HER</Link>
          <Link href="/productos" className="drawer-item" onClick={cerrar}>VER TODO</Link>
        </div>

        <div className="drawer-section">
          <p className="drawer-label">NAVEGAR</p>
          <Link href="/quienes-somos" className="drawer-item" onClick={cerrar}>QUIÉNES SOMOS</Link>
          <a href="#contacto" className="drawer-item" onClick={cerrar}>CONTACTO</a>
        </div>

        <div className="drawer-section">
          <p className="drawer-label">COMUNIDAD</p>
          <Link href="/newsletter" className="drawer-item" onClick={cerrar}>NEWSLETTER</Link>
        </div>
      </aside>

      {/* Navbar sticky */}
      <header className="navbar" role="banner">
        <div className={`navbar-logo-wrap ${scrolled ? 'scrolled' : ''}`}>
          <Link href="/" aria-label="Ir al inicio">
            <img src="/logo-estrella.png" alt="For Me Studios" className="navbar-logo-img" />
          </Link>
        </div>
        <nav className={scrolled ? 'oculto-mobile' : ''} role="navigation" aria-label="Menú principal">
          <ul>
            <li><Link href="/productos">STORE</Link></li>
            <li><a href="#contacto">CONTACTO</a></li>
            {usuario ? (
              <>
                <li><Link href="/mis-ordenes">MIS ÓRDENES</Link></li>
                <li><button onClick={handleLogout}>CERRAR SESIÓN</button></li>
              </>
            ) : (
              <li><Link href="/login">INICIAR SESIÓN</Link></li>
            )}
            <li>
              <Link href="/cart" aria-label="Ver carrito de compras">
                CART ({totalItems})
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export default Navbar;
