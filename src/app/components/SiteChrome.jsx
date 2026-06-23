'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Contacto from './Contacto';
import Footer from './Footer';

// El panel /admin no debe mostrar la navegación/contacto/footer de la tienda.
function SiteChrome({ children }) {
  const pathname = usePathname();
  const esAdmin = pathname.startsWith('/admin');

  if (esAdmin) {
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
