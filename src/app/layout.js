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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:wght@300;400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}