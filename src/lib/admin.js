// Compartido entre src/proxy.js y las rutas de admin (/api/ordenes). Recibe
// un cliente de Supabase ya autenticado por cookies (no el de service_role)
// para que la propia policy "admins_select_self" autorice la consulta.
//
// Fail-closed a propósito: si la consulta falla por cualquier motivo, NO se
// considera admin. Es preferible que el admin tenga que reintentar a que un
// error transitorio termine dejando pasar a alguien que no debería.
export async function esAdmin(supabase, userId) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[esAdmin] error verificando membresía de admin:', error);
    return false;
  }

  return !!data;
}
