export const ESTADOS_ORDEN = ['pendiente', 'pagado', 'cancelado'];

// Valida el body de POST /api/ordenes ANTES de insertar nada, para que el
// rollback manual (borrar la orden si fallan los items) sea la excepción rara
// y no el camino esperado.
export function validarItemsOrden(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'La orden debe tener al menos un item.';
  }

  for (const item of items) {
    if (!item || typeof item.producto_id !== 'string' || !item.producto_id) {
      return 'Cada item necesita un producto_id válido.';
    }
    if (typeof item.talla !== 'string' || !item.talla) {
      return 'Cada item necesita un talle.';
    }
    if (typeof item.cantidad !== 'number' || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      return 'La cantidad de cada item debe ser un entero mayor a 0.';
    }
    if (typeof item.precio_unitario !== 'number' || item.precio_unitario < 0) {
      return 'El precio unitario de cada item debe ser un número mayor o igual a 0.';
    }
  }

  return null;
}

export function calcularTotal(items) {
  return items.reduce((acc, item) => acc + item.cantidad * item.precio_unitario, 0);
}

// Compartido entre POST /api/ordenes (admin) y POST /api/checkout (público):
// inserta la orden y sus items, con rollback manual si fallan los items
// (ver nota en cada caller sobre por qué no es una transacción real).
// "items" ya viene normalizado como [{producto_id, talla, cantidad, precio_unitario}].
// "email" es opcional (null en compras de invitado) y SIEMPRE tiene que venir
// ya derivado de una sesión validada server-side, nunca de un body sin
// verificar — quien llama a esta función es responsable de eso.
export async function crearOrdenConItems(supabase, { estado = 'pendiente', items, email }) {
  const total = calcularTotal(items);

  const { data: orden, error: errorOrden } = await supabase
    .from('ordenes')
    .insert({ estado, total, ...(email && { email }) })
    .select()
    .single();

  if (errorOrden) {
    return { error: errorOrden };
  }

  const { data: ordenItems, error: errorItems } = await supabase
    .from('orden_items')
    .insert(items.map(item => ({ ...item, orden_id: orden.id })))
    .select();

  if (errorItems) {
    await supabase.from('ordenes').delete().eq('id', orden.id);
    return { error: errorItems };
  }

  return { orden: { ...orden, orden_items: ordenItems } };
}
