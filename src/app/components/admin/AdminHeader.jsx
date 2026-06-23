'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="admin-header">
      <Link href="/admin" className="admin-brand">FOR ME STUDIOS — ADMIN</Link>
      <button onClick={handleLogout} className="admin-logout">CERRAR SESIÓN</button>
    </header>
  );
}

export default AdminHeader;
