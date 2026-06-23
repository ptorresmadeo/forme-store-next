// Traduce errores de Postgres/PostgREST a una respuesta HTTP consistente.
// 42501 = violación de RLS (el usuario está autenticado pero no tiene permiso).
// 23503 = violación de foreign key (ej. borrar un producto referenciado por una orden).
export function mapearErrorSupabase(error) {
  if (error?.code === '42501') {
    return { status: 403, body: { error: 'No tenés permiso para realizar esta acción.' } };
  }
  if (error?.code === '23503') {
    return {
      status: 409,
      body: { error: 'No se puede completar la operación: el registro está referenciado por otro recurso.' },
    };
  }
  return { status: 500, body: { error: 'Ocurrió un error inesperado en el servidor.' } };
}
