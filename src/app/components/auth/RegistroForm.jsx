'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { validarEmail, validarPasswordNueva, PASSWORD_MIN_REGISTRO } from '@/lib/validacion';
import CampoAuth from './CampoAuth';
import BotonGoogle from './BotonGoogle';
import styles from './auth.module.css';

function validar({ email, password, confirmacion }) {
  const errores = {};
  const errorEmail = validarEmail(email);
  const errorPassword = validarPasswordNueva(password);
  if (errorEmail) errores.email = errorEmail;
  if (errorPassword) errores.password = errorPassword;
  if (!confirmacion) {
    errores.confirmacion = 'Repetí la contraseña.';
  } else if (confirmacion !== password) {
    errores.confirmacion = 'Las contraseñas no coinciden.';
  }
  return errores;
}

function mensajeSupabase(error) {
  if (error.code === 'user_already_exists') {
    return 'Ya existe una cuenta con ese email. Probá iniciar sesión.';
  }
  if (error.code === 'weak_password') {
    return 'Esa contraseña es demasiado débil. Probá con una más larga.';
  }
  if (error.status === 429) {
    return 'Demasiados intentos. Esperá un momento y probá de nuevo.';
  }
  return 'No pudimos crear tu cuenta. Probá de nuevo.';
}

export default function RegistroForm() {
  const router = useRouter();
  const [valores, setValores] = useState({ email: '', password: '', confirmacion: '' });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [intentado, setIntentado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState('');

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
    const email = valores.email.trim();
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password: valores.password });

    if (error) {
      setCargando(false);
      setErrorGeneral(mensajeSupabase(error));
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

    setCargando(false);
    setEmailEnviado(email);
  };

  if (emailEnviado) {
    return (
      <div className={styles.confirmacion} role="status">
        <span className={styles.confirmacionIcono} aria-hidden="true">✉</span>
        <p className={styles.confirmacionTitulo}>Revisá tu email</p>
        <p className={styles.confirmacionTexto}>
          Te mandamos un link de confirmación a <strong>{emailEnviado}</strong>. Abrilo para activar tu cuenta.
        </p>
        <Link href="/login" className={styles.submit}>Ir a iniciar sesión</Link>
      </div>
    );
  }

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
          autoComplete="new-password"
          placeholder={`Mínimo ${PASSWORD_MIN_REGISTRO} caracteres`}
          value={valores.password}
          onChange={handleChange}
          error={errores.password}
          ayuda={`Al menos ${PASSWORD_MIN_REGISTRO} caracteres, con una letra y un número.`}
        />
        <CampoAuth
          id="confirmacion"
          name="confirmacion"
          type="password"
          label="Repetir contraseña"
          autoComplete="new-password"
          placeholder="Repetí tu contraseña"
          value={valores.confirmacion}
          onChange={handleChange}
          error={errores.confirmacion}
        />

        {errorGeneral && <p className={styles.alerta} role="alert">{errorGeneral}</p>}

        <button type="submit" className={styles.submit} disabled={cargando}>
          {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </>
  );
}
