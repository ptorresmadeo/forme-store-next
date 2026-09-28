import Link from 'next/link';
import LogoMarca from './components/LogoMarca';
import NewsletterForm from './components/NewsletterForm';
import styles from './coming-soon.module.css';

// Landing pública mientras la tienda está en construcción. El catálogo
// completo sigue funcionando en /catalogo.
export const metadata = {
  title: 'For Me Studios — Próximamente',
  description: 'DROP 001 coming soon. Sumate a la lista y llevate 10% OFF en tu primera compra.',
};

export default function Home() {
  return (
    <main className={styles.pagina}>
      <div className={styles.contenedor}>
        <LogoMarca className={styles.logo} priority />

        <h1 className={styles.titulo}>DROP 001 coming soon...</h1>

        <section className={styles.card} aria-labelledby="newsletter-titulo">
          <h2 id="newsletter-titulo" className={styles.cardTitulo}>10% OFF en tu primera compra</h2>
          <p className={styles.cardTexto}>
            Súmate a la lista: acceso anticipado al lanzamiento y tu descuento de bienvenida
          </p>
          <NewsletterForm />
        </section>

        <Link href="/login" className={styles.login}>Iniciar sesión</Link>
      </div>
    </main>
  );
}
