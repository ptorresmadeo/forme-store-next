// Reglas compartidas entre los formularios del cliente y las API routes.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Supabase rechaza contraseñas de menos de 6 caracteres, así que ninguna
// cuenta existente puede tener una más corta: el login valida contra este
// piso. Las cuentas nuevas exigen un mínimo más fuerte.
export const PASSWORD_MIN_LOGIN = 6;
export const PASSWORD_MIN_REGISTRO = 8;

// Devuelve el mensaje de error, o null si el email es válido.
export function validarEmail(email) {
  if (typeof email !== 'string' || !email.trim()) {
    return 'El email es obligatorio.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Ingresá un email válido.';
  }
  return null;
}

export function validarPassword(password, minimo) {
  if (typeof password !== 'string' || !password) {
    return 'La contraseña es obligatoria.';
  }
  if (password.length < minimo) {
    return `La contraseña debe tener al menos ${minimo} caracteres.`;
  }
  return null;
}

// Para cuentas nuevas: además del largo, al menos una letra y un número.
export function validarPasswordNueva(password) {
  const error = validarPassword(password, PASSWORD_MIN_REGISTRO);
  if (error) return error;
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(password) || !/\d/.test(password)) {
    return 'Usá al menos una letra y un número.';
  }
  return null;
}
