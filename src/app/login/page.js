'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const supabase = createClient();
    const { error: errorLogin } = await supabase.auth.signInWithPassword({ email, password });

    setCargando(false);

    if (errorLogin) {
      setError('Email o contraseña incorrectos.');
      return;
    }

    router.push('/mis-ordenes');
    router.refresh();
  };

  return (
    <section className="auth-page">
      <h1>INICIAR SESIÓN</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? 'INGRESANDO...' : 'INGRESAR'}
        </button>
      </form>
      <p>¿No tenés cuenta? <Link href="/registro">Creá una</Link></p>
    </section>
  );
}
