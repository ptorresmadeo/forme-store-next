// Mismas reglas que la validación del lado del cliente en Contacto.jsx —
// nunca confiamos solo en esa validación, el servidor la repite.
export function validarContacto(body) {
  const errores = {};

  if (!body || typeof body !== 'object') {
    return { _general: 'Cuerpo de la petición inválido.' };
  }

  if (!body.nombre || typeof body.nombre !== 'string' || !body.nombre.trim()) {
    errores.nombre = 'El nombre es obligatorio.';
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errores.email = 'El email es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errores.email = 'Ingresá un email válido.';
  }

  if (!body.mensaje || typeof body.mensaje !== 'string' || !body.mensaje.trim()) {
    errores.mensaje = 'El mensaje es obligatorio.';
  } else if (body.mensaje.trim().length < 10) {
    errores.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
  }

  return errores;
}
