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

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUsuario(data.user));

    // Reacciona a login/logout/registro de inmediato, sin esperar a que
    // este componente (que vive en el layout y no se desmonta al navegar)
    // vuelva a montarse.
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUsuario(null);
    router.push('/');
    router.refresh();
  };

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
  );
}

export default Navbar;
