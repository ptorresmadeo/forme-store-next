-- Mensajes del formulario de contacto. Cualquiera puede enviar uno (insert
-- público, sin login), pero solo un usuario autenticado (el admin) puede
-- leerlos — son datos personales (nombre, email, mensaje) de visitantes.
create table contactos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  mensaje text not null,
  creado_en timestamptz not null default now()
);

alter table contactos enable row level security;

create policy "contactos_insert_public" on contactos
  for insert to anon, authenticated with check (true);

create policy "contactos_select_auth" on contactos
  for select to authenticated using (true);
