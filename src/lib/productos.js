// Traduce una fila de la tabla "productos" al shape que ya consumen los
// componentes existentes (Catalogo, ProductoDetalle, CartContext), para no
// tener que tocarlos más de lo necesario.
export function mapProducto(row) {
  const stockPorTalla = row.stock_por_talle ?? {};
  const tallas = Object.keys(stockPorTalla);
  const stockTotal = Object.values(stockPorTalla).reduce((acc, n) => acc + n, 0);

  return {
    id: row.id,
    nombre: row.titulo,
    descripcion: row.descripcion ?? '',
    precio: Number(row.precio),
    img: row.imagen_url,
    categoria: row.categoria,
    tallas,
    stockPorTalla,
    badge: stockTotal > 0 ? 'NUEVO' : 'SOLD OUT',
  };
}

const CATEGORIAS_VALIDAS = ['him', 'her'];

// Valida el body de POST/PUT /api/productos, que usa los nombres de columna
// reales de la tabla (titulo, precio, stock_por_talle, etc.), no el shape de
// lectura que devuelve mapProducto.
export function validarProducto(body) {
  const errores = {};

  if (!body || typeof body !== 'object') {
    return { _general: 'Cuerpo de la petición inválido.' };
  }

  if (!body.titulo || typeof body.titulo !== 'string' || !body.titulo.trim()) {
    errores.titulo = 'El título es obligatorio.';
  }

  if (typeof body.precio !== 'number' || !Number.isFinite(body.precio) || body.precio <= 0) {
    errores.precio = 'El precio debe ser un número mayor a 0.';
  }

  if (!CATEGORIAS_VALIDAS.includes(body.categoria)) {
    errores.categoria = 'La categoría debe ser "him" o "her".';
  }

  if (body.descripcion != null && typeof body.descripcion !== 'string') {
    errores.descripcion = 'La descripción debe ser texto.';
  }

  if (body.imagen_url != null && typeof body.imagen_url !== 'string') {
    errores.imagen_url = 'La URL de imagen debe ser texto.';
  }

  if (
    !body.stock_por_talle ||
    typeof body.stock_por_talle !== 'object' ||
    Array.isArray(body.stock_por_talle) ||
    Object.keys(body.stock_por_talle).length === 0
  ) {
    errores.stock_por_talle = 'Debés indicar el stock de al menos un talle.';
  } else {
    for (const [talla, stock] of Object.entries(body.stock_por_talle)) {
      if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
        errores.stock_por_talle = `Stock inválido para el talle "${talla}": debe ser un entero ≥ 0.`;
        break;
      }
    }
  }

  return errores;
}

export const CATEGORIAS_PRODUCTO = CATEGORIAS_VALIDAS;
