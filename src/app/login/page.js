import Link from 'next/link';
import AuthShell from '../components/auth/AuthShell';
import LoginForm from '../components/auth/LoginForm';

export const metadata = {
  title: 'Iniciar sesión — For Me Studios',
};

// /auth/callback redirige acá con ?error=oauth si el login con Google falla.
const ERRORES = {
  oauth: 'No pudimos completar el inicio de sesión con Google. Probá de nuevo.',
};

export default async function LoginPage({ searchParams }) {
  const { error } = await searchParams;

  return (
    <AuthShell
      titulo="Bienvenido"
      bajada="Iniciá sesión para ver tus órdenes y comprar más rápido."
      pie={<>¿No tenés cuenta? <Link href="/registro">Creá una</Link></>}
    >
      <LoginForm errorInicial={ERRORES[error] ?? ''} />
    </AuthShell>
  );
}
