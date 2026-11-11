// Convierte errores técnicos (Supabase, red, base de datos) en mensajes claros para la persona.
export function mensajeError(error, porDefecto = "Algo salió mal. Inténtalo de nuevo.") {
  const texto = String(error?.message ?? error ?? "");

  if (/failed to fetch|networkerror|load failed|network request failed/i.test(texto)) {
    return "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.";
  }
  if (/límite de 10 reportes/i.test(texto)) return texto;
  if (/reportes_dentro_de_buga/.test(texto)) return "Esa ubicación queda fuera de Guadalajara de Buga.";
  if (/row-level security|permission denied|jwt expired|not authorized/i.test(texto)) {
    return "No tienes permiso para hacer esto, o tu sesión expiró. Vuelve a iniciar sesión.";
  }
  if (/invalid login credentials/i.test(texto)) return "Correo o contraseña incorrectos.";
  if (/email not confirmed/i.test(texto)) return "Debes confirmar tu correo antes de entrar. Revisa tu bandeja de entrada.";
  if (/anonymous sign-ins are disabled/i.test(texto)) {
    return "El acceso anónimo no está disponible en este momento. Crea una cuenta para continuar.";
  }
  if (/database error saving new user|datos_personales_invalidos|cedula_ya_registrada/i.test(texto)) {
    return "No pudimos crear tu cuenta. Revisa que la cédula y el correo no estén registrados ya y que los datos sean válidos.";
  }
  if (/user already registered|correo_ya_registrado/i.test(texto)) return "Ese correo ya tiene una cuenta. Inicia sesión.";
  if (/password should be at least/i.test(texto)) return "La contraseña debe tener al menos 8 caracteres.";
  if (/rate limit|too many requests|over_request_rate_limit/i.test(texto)) {
    return "Demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.";
  }
  if (/exceeded the maximum allowed size|payload too large|file size/i.test(texto)) {
    return "La foto es demasiado pesada (máximo 5 MB).";
  }
  return porDefecto;
}
