import Link from 'next/link';
import LogoMarca from '../LogoMarca';
import styles from './auth.module.css';

// Layout compartido de /login y /registro: panel con la imagen del hero a la
// izquierda (solo desktop) y, a la derecha, el mismo esquema que la landing
// (logo + título + card, todo centrado en una columna).
export default function AuthShell({ titulo, bajada, children, pie }) {
  return (
    <main className={styles.pagina}>
      <aside className={styles.panelMarca} aria-hidden="true">
        <div className={styles.panelOverlay} />
      </aside>

      <div className={styles.panelForm}>
        <div className={styles.contenedor}>
          <Link href="/" aria-label="Ir al inicio" className={styles.logoLink}>
            <LogoMarca className={styles.logo} />
          </Link>

          <h1 className={styles.titulo}>{titulo}</h1>

          <section className={styles.card}>
            {bajada && <p className={styles.bajada}>{bajada}</p>}
            {children}
          </section>

          {pie && <p className={styles.pie}>{pie}</p>}

          <Link href="/" className={styles.volver}>← Volver al inicio</Link>
        </div>
      </div>
    </main>
  );
}
