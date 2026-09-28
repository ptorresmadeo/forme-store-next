'use client';
import { useState } from 'react';
import { validarEmail } from '@/lib/validacion';
import styles from '../coming-soon.module.css';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('inicial'); // inicial | enviando | ok

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorEmail = validarEmail(email);
    if (errorEmail) {
      setError(errorEmail);
      return;
    }

    setError('');
    setEstado('enviando');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.errores?.email || data.error || 'No pudimos suscribirte. Probá de nuevo.');
        setEstado('inicial');
        return;
      }
      setEstado('ok');
    } catch {
      setError('Sin conexión. Probá de nuevo en un momento.');
      setEstado('inicial');
    }
  };

  if (estado === 'ok') {
    return (
      <p className={styles.exito} role="status">
        ¡Listo! Ya estás en la lista. Te avisamos antes que a nadie cuando lancemos el drop.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor="newsletter-email" className={styles.srOnly}>Email</label>
      <input
        id="newsletter-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError('');
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'newsletter-error' : undefined}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <p id="newsletter-error" className={styles.error} role="alert">{error}</p>}
      <button type="submit" className={styles.boton} disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Enviando…' : 'Suscribirme'}
      </button>
    </form>
  );
}
