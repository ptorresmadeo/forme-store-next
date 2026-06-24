import { createClient } from '@supabase/supabase-js';

// Bypassea RLS por completo. SOLO se usa en código server-only donde no hay
// (ni puede haber) una sesión de usuario asociada: el checkout público
// (cualquier visitante, sin login) y el webhook de Mercado Pago (lo llama el
// servidor de MP, no un usuario logueado). En ambos casos la autorización la
// hace nuestro propio código (validación de stock/precio, verificación del
// pago contra la API de MP), no RLS — por eso necesita saltarla.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Falta configurar SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.');
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
