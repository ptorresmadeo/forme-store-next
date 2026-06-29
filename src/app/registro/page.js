'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const supabase = createClient();
    const { data, error: errorSignup } = await supabase.auth.signUp({ email, password });

    setCargando(false);

    if (errorSignup) {
      setError(errorSignup.message || 'No pudimos crear tu cuenta.');
      return;
    }

    // Si la confirmación de email está desactivada en el proyecto, signUp ya
    // devuelve una sesión activa — en ese caso entramos directo. Si no, hay
    // que confirmar el email antes de poder loguearse.
    if (data.session) {
      router.push('/mis-ordenes');
      router.refresh();
      return;
    }

    setRegistrado(true);
  };

  if (registrado) {
    return (
      <section className="auth-page">
        <h1>CUENTA CREADA</h1>
        <p>Revisá tu email para confirmar tu cuenta antes de iniciar sesión.</p>
        <p><Link href="/login">IR A INICIAR SESIÓN</Link></p>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <h1>CREAR CUENTA</h1>
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
            minLength={6}
            required
          />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
        </button>
      </form>
      <p>¿Ya tenés cuenta? <Link href="/login">Iniciá sesión</Link></p>
    </section>
  );
}
