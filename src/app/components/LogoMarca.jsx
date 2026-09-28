import styles from './LogoMarca.module.css';

// logo-forme.png es un cuadrado con mucho aire blanco alrededor del wordmark;
// este wrapper lo recorta para que el tamaño que se le da sea el del logo real.
export default function LogoMarca({ className = '', priority = false }) {
  return (
    <span className={`${styles.wrap} ${className}`}>
      <img
        src="/logo-forme.png"
        alt="For Me Studios"
        className={styles.img}
        fetchPriority={priority ? 'high' : undefined}
      />
    </span>
  );
}
