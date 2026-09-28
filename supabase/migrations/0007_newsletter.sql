-- Suscriptores del newsletter captados en la landing de "Próximamente".
-- Mismo criterio que "contactos": cualquiera puede suscribirse (insert
-- público, sin login), pero solo el admin puede leer la lista.
create table suscriptores_newsletter (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  creado_en timestamptz not null default now()
);

alter table suscriptores_newsletter enable row level security;

create policy "newsletter_insert_public" on suscriptores_newsletter
  for insert to anon, authenticated with check (true);

create policy "newsletter_select_admin" on suscriptores_newsletter
  for select to authenticated
  using (exists (select 1 from admins where user_id = auth.uid()));
