-- Marca una orden como pagada y descuenta el stock de sus items en una sola
-- transacción (una función PL/pgSQL corre dentro de una transacción implícita:
-- si algo falla a mitad de camino, Postgres revierte todo). Esto evita el
-- problema de "leer stock en JS, restar, volver a escribir" bajo concurrencia
-- (dos webhooks llegando casi al mismo tiempo podrían pisarse el resultado).
--
-- "where estado <> 'pagado'" + get diagnostics hace que la función sea
-- idempotente A NIVEL DB (no solo en el chequeo que hace el webhook en JS):
-- si Mercado Pago reenvía la misma notificación, o dos llegan casi en
-- simultáneo, el UPDATE toma un lock de fila y solo la PRIMERA llamada afecta
-- una fila — las siguientes ven 0 filas afectadas y no tocan el stock de nuevo.
create or replace function confirmar_pago_orden(p_orden_id uuid)
returns void
language plpgsql
as $$
declare
  item record;
  filas_actualizadas int;
begin
  update ordenes set estado = 'pagado' where id = p_orden_id and estado <> 'pagado';
  get diagnostics filas_actualizadas = row_count;

  if filas_actualizadas = 0 then
    -- Ya estaba pagada (o no existe la orden): no se vuelve a descontar stock.
    return;
  end if;

  for item in
    select producto_id, talla, cantidad from orden_items where orden_id = p_orden_id
  loop
    update productos
    set stock_por_talle = jsonb_set(
      stock_por_talle,
      array[item.talla],
      to_jsonb(greatest(coalesce((stock_por_talle ->> item.talla)::int, 0) - item.cantidad, 0))
    )
    where id = item.producto_id;
  end loop;
end;
$$;
