-- Esquema inicial: productos, ordenes, orden_items + RLS.
create extension if not exists pgcrypto;

create table productos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  precio numeric(10,2) not null check (precio > 0),
  descripcion text,
  stock_por_talle jsonb not null default '{}'::jsonb,
  categoria text not null check (categoria in ('him', 'her')),
  imagen_url text,
  creado_en timestamptz not null default now()
);

create table ordenes (
  id uuid primary key default gen_random_uuid(),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagado', 'cancelado')),
  total numeric(10,2) not null check (total >= 0),
  fecha timestamptz not null default now()
);

-- on delete restrict: no se puede borrar un producto referenciado por una orden existente
-- (el Route Handler mapea esa violación a 409, no a un 500 genérico).
create table orden_items (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references ordenes(id) on delete cascade,
  producto_id uuid not null references productos(id) on delete restrict,
  talla text not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null check (precio_unitario >= 0)
);

alter table productos enable row level security;
alter table ordenes enable row level security;
alter table orden_items enable row level security;

-- productos: lectura pública, escritura solo para usuarios autenticados (el admin).
create policy "productos_select_public" on productos
  for select using (true);

create policy "productos_insert_auth" on productos
  for insert to authenticated with check (true);

create policy "productos_update_auth" on productos
  for update to authenticated using (true) with check (true);

create policy "productos_delete_auth" on productos
  for delete to authenticated using (true);

-- ordenes / orden_items: sin acceso público en absoluto.
-- Nota: con un solo admin autenticado no hace falta acotar "orden_items" a la
-- orden a la que pertenece; si en el futuro hubiera multi-usuario, esta policy
-- debería validar pertenencia con un "exists (select 1 from ordenes ...)".
create policy "ordenes_all_auth" on ordenes
  for all to authenticated using (true) with check (true);

create policy "orden_items_all_auth" on orden_items
  for all to authenticated using (true) with check (true);
