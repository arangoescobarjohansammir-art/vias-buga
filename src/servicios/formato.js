// Utilidades para mostrar fechas en español (hora de Colombia).

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// "2 oct"
export function fechaCorta(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

// "2 oct 2026, 3:15 p. m."
export function fechaHora(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

// "hace 5 min", "hace 3 h", "ayer", "hace 8 días"
export function haceTiempo(iso) {
  if (!iso) return "";
  const segundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const minutos = Math.floor(segundos / 60);
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ayer";
  if (dias < 60) return `hace ${dias} días`;
  return `hace ${Math.floor(dias / 30)} meses`;
}

export function diasEntre(desdeIso, hastaIso) {
  return Math.max(0, Math.round((new Date(hastaIso) - new Date(desdeIso)) / 86400000));
}
