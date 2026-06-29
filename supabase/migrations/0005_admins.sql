-- Tabla de admins: necesaria desde que va a existir signup público de
-- clientes. Hasta ahora "estar logueado" y "ser el admin" eran lo mismo
-- porque no había otra forma de loguearse — esto deja de ser cierto en
-- cuanto un cliente puede crear su propia cuenta.
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admins enable row level security;

-- Un usuario solo puede ver SU PROPIA fila (no la lista de admins). Esto
-- alcanza para que las subconsultas "exists(select 1 from admins where
-- user_id = auth.uid())" de las demás policies funcionen — sin esta policy,
-- "admins" no sería visible ni para el propio admin (RLS sin policies =
-- nadie ve nada, ni en subconsultas desde otra tabla).
create policy "admins_select_self" on admins
  for select to authenticated using (user_id = auth.uid());

-- ⚠️ IMPORTANTE: reemplazar el email de abajo por el del admin actual antes
-- de correr esta migración. Sin esta fila, la migración 0006 (que exige ser
-- admin para todo lo que hoy hace el panel /admin) deja al admin sin acceso.
insert into admins (user_id)
select id from auth.users where email = 'REEMPLAZAR_CON_EMAIL_DEL_ADMIN';
