'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validarEmail, validarPassword, PASSWORD_MIN_LOGIN } from '@/lib/validacion';
import CampoAuth from './CampoAuth';
import BotonGoogle from './BotonGoogle';
import styles from './auth.module.css';

function validar({ email, password }) {
  const errores = {};
  const errorEmail = validarEmail(email);
  const errorPassword = validarPassword(password, PASSWORD_MIN_LOGIN);
  if (errorEmail) errores.email = errorEmail;
  if (errorPassword) errores.password = errorPassword;
  return errores;
}

function mensajeSupabase(error) {
  if (error.code === 'email_not_confirmed') {
    return 'Todavía no confirmaste tu email. Revisá tu bandeja de entrada.';
  }
  if (error.status === 429) {
    return 'Demasiados intentos. Esperá un momento y probá de nuevo.';
  }
  return 'Email o contraseña incorrectos.';
}

export default function LoginForm({ errorInicial = '' }) {
  const router = useRouter();
  const [valores, setValores] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(errorInicial);
  const [intentado, setIntentado] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Después del primer intento de envío, los errores se recalculan en vivo
  // para que desaparezcan apenas el campo queda bien.
  const handleChange = (e) => {
    const nuevos = { ...valores, [e.target.name]: e.target.value };
    setValores(nuevos);
    if (intentado) setErrores(validar(nuevos));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIntentado(true);
    setErrorGeneral('');

    const erroresForm = validar(valores);
    setErrores(erroresForm);
    if (Object.keys(erroresForm).length > 0) return;

    setCargando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: valores.email.trim(),
      password: valores.password,
    });

    if (error) {
      setCargando(false);
      setErrorGeneral(mensajeSupabase(error));
      return;
    }

    router.push('/mis-ordenes');
    router.refresh();
  };

  return (
    <>
      <BotonGoogle onError={setErrorGeneral} />

      <div className={styles.divisor}><span>o con tu email</span></div>

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <CampoAuth
          id="email"
          name="email"
          type="email"
          label="Email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={valores.email}
          onChange={handleChange}
          error={errores.email}
        />
        <CampoAuth
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={valores.password}
          onChange={handleChange}
          error={errores.password}
        />

        {errorGeneral && <p className={styles.alerta} role="alert">{errorGeneral}</p>}

        <button type="submit" className={styles.submit} disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>
    </>
  );
}
