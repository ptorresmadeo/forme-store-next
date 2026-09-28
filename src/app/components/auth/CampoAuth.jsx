'use client';
import { useState } from 'react';
import styles from './auth.module.css';

// Input con label, mensaje de error accesible y, para contraseñas, un botón
// para mostrar/ocultar lo escrito.
export default function CampoAuth({ id, label, type = 'text', error, ayuda, ...props }) {
  const [visible, setVisible] = useState(false);
  const esPassword = type === 'password';
  const idDescripcion = error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined;

  return (
    <div className={styles.campo}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
        <input
          id={id}
          type={esPassword && visible ? 'text' : type}
          className={styles.input}
          aria-invalid={Boolean(error)}
          aria-describedby={idDescripcion}
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
          >
            {visible ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className={styles.errorCampo}>{error}</p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className={styles.ayuda}>{ayuda}</p>
      ) : null}
    </div>
  );
}
