import Link from 'next/link';
import AuthShell from '../components/auth/AuthShell';
import RegistroForm from '../components/auth/RegistroForm';

export const metadata = {
  title: 'Crear cuenta — For Me Studios',
};

export default function RegistroPage() {
  return (
    <AuthShell
      titulo="Creá tu cuenta"
      bajada="Seguí tus órdenes y enterate primero de cada drop."
      pie={<>¿Ya tenés cuenta? <Link href="/login">Iniciá sesión</Link></>}
    >
      <RegistroForm />
    </AuthShell>
  );
}
