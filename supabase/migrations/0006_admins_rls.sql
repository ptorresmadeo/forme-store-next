-- Requiere haber corrido 0005_admins.sql Y haber confirmado (select * from
-- admins;) que la fila del admin actual existe. Si se corre esta migración
-- antes de eso, el admin pierde acceso a /admin hasta corregir la tabla.

-- "ordenes" necesita asociar al comprador para que pueda ver sus propias
-- compras en /mis-ordenes. Nullable porque el checkout sigue siendo guest:
-- un comprador sin sesión deja este campo en null, igual que hasta ahora.
alter table ordenes add column email text;

-- ===== productos: las policies de escritura pasaban "to authenticated"
-- (cualquier sesión), ahora exigen además ser admin. La lectura pública no
-- cambia. =====
drop policy "productos_insert_auth" on productos;
create policy "productos_insert_auth" on productos
  for insert to authenticated
  with check (exists (select 1 from admins where user_id = auth.uid()));

drop policy "productos_update_auth" on productos;
create policy "productos_update_auth" on productos
  for update to authenticated
  using (exists (select 1 from admins where user_id = auth.uid()))
  with check (exists (select 1 from admins where user_id = auth.uid()));

drop policy "productos_delete_auth" on productos;
create policy "productos_delete_auth" on productos
  for delete to authenticated
  using (exists (select 1 from admins where user_id = auth.uid()));

-- ===== ordenes: la policy vieja daba acceso total a cualquier autenticado.
-- Se reemplaza por "admin: todo" + "cliente: solo ver las propias por email". =====
drop policy "ordenes_all_auth" on ordenes;

create policy "ordenes_admin_all" on ordenes
  for all to authenticated
  using (exists (select 1 from admins where user_id = auth.uid()))
  with check (exists (select 1 from admins where user_id = auth.uid()));

-- Sin el email no hay nada para hacer match — un cliente jamás ve una orden
-- de un comprador anónimo (email null). Solo "select": un cliente no puede
-- modificar ni borrar, ni sus propias órdenes.
create policy "ordenes_select_propia" on ordenes
  for select to authenticated
  using (email is not null and email = auth.jwt() ->> 'email');

-- ===== orden_items: mismo criterio, vía la orden a la que pertenecen. =====
drop policy "orden_items_all_auth" on orden_items;

create policy "orden_items_admin_all" on orden_items
  for all to authenticated
  using (exists (select 1 from admins where user_id = auth.uid()))
  with check (exists (select 1 from admins where user_id = auth.uid()));

create policy "orden_items_select_propia" on orden_items
  for select to authenticated
  using (
    exists (
      select 1 from ordenes
      where ordenes.id = orden_items.orden_id
        and ordenes.email is not null
        and ordenes.email = auth.jwt() ->> 'email'
    )
  );

-- ===== contactos: la lectura era "cualquier autenticado", ahora solo admin.
-- No se agrega "ver mis propios contactos": nada asocia hoy un contacto a
-- un usuario, y no fue pedido. =====
drop policy "contactos_select_auth" on contactos;
create policy "contactos_select_auth" on contactos
  for select to authenticated
  using (exists (select 1 from admins where user_id = auth.uid()));
