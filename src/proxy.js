import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { esAdmin } from '@/lib/admin';

export async function proxy(request) {
  // Esta es la response que createServerClient va a mutar con las cookies
  // refrescadas — hay que devolver ESTA, no una NextResponse.next() nueva,
  // o el refresh de token nunca llega al browser.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const esRutaAdmin = pathname.startsWith('/admin');
  const esLogin = pathname.startsWith('/admin/login');

  // Desde que existe el login de clientes, "hay sesión" ya no implica "es el
  // admin" — antes alcanzaba con !user porque no había otra forma de
  // loguearse. Ahora hay que confirmar membresía real contra la tabla
  // "admins" (esAdmin() es fail-closed: si la consulta falla, no es admin).
  const admin = user ? await esAdmin(supabase, user.id) : false;

  if (esRutaAdmin && !esLogin && !admin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Importante: esto chequea "admin", no "user" — un cliente logueado (no
  // admin) que visita /admin/login debe seguir viendo el formulario, no
  // entrar en un loop de redirects con el chequeo de arriba.
  if (esLogin && admin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // Mismo patrón que /admin, para clientes: /mis-ordenes requiere sesión,
  // y estando logueado no tiene sentido ver /login o /registro de nuevo.
  const esMisOrdenes = pathname.startsWith('/mis-ordenes');
  const esLoginORegistroCliente = pathname === '/login' || pathname === '/registro';

  if (esMisOrdenes && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (esLoginORegistroCliente && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/mis-ordenes';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*', '/mis-ordenes/:path*', '/login', '/registro'],
};
