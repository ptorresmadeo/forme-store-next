import './globals.css';
import './logo-responsive.css';
import { CartProvider } from './context/CartContext';
import SiteChrome from './components/SiteChrome';

export const metadata = {
  title: 'For Me Studios',
  description: 'Tienda de ropa streetwear',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head></head>
      <body>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}