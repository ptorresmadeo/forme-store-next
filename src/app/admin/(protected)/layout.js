import AdminHeader from '@/app/components/admin/AdminHeader';

export default function AdminProtectedLayout({ children }) {
  return (
    <div className="admin-shell">
      <AdminHeader />
      <main className="admin-main">{children}</main>
    </div>
  );
}
