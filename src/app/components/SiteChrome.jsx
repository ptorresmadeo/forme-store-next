'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Contacto from './Contacto';
import Footer from './Footer';

// Pantallas que ya traen su propio layout de página completa.
const RUTAS_SIN_CHROME = ['/', '/login', '/registro'];

// El panel /admin, la landing de "Próximamente" y las páginas de auth no
// deben mostrar la navegación/contacto/footer de la tienda.
function SiteChrome({ children }) {
  const pathname = usePathname();
  const esAdmin = pathname.startsWith('/admin');

  if (esAdmin || RUTAS_SIN_CHROME.includes(pathname)) {
    return children;
  }

  return (
    <>
      <Navbar />
      {children}
      <Contacto />
      <Footer />
    </>
  );
}

export default SiteChrome;
