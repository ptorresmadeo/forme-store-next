// El frontend solo manda (id, talla, cantidad) — nunca un precio. El precio real
// se busca server-side en Supabase dentro del Route Handler, para que nadie pueda
// manipular montos editando el payload del fetch desde el navegador.
export function validarItemsCheckout(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'El carrito está vacío.';
  }

  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !item.id) {
      return 'Cada item necesita un id de producto válido.';
    }
    if (typeof item.talla !== 'string' || !item.talla) {
      return 'Cada item necesita un talle.';
    }
    if (typeof item.cantidad !== 'number' || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      return 'La cantidad de cada item debe ser un entero mayor a 0.';
    }
  }

  return null;
}
