// Clases de Tailwind reutilizables. Se guardan aquí (y no en cada componente)
// para que botones, campos y tarjetas se vean igual en todas las pantallas.

const baseBoton =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 " +
  "cursor-pointer select-none";

export const boton = {
  primario: `${baseBoton} h-12 px-6 text-[15px] bg-primario text-sobre-primario shadow-sm hover:bg-primario-hover`,
  secundario: `${baseBoton} h-12 px-6 text-[15px] border border-borde-fuerte bg-transparent text-texto hover:bg-superficie-3`,
  suave: `${baseBoton} h-12 px-6 text-[15px] bg-superficie-3 text-texto hover:bg-borde`,
  peligro: `${baseBoton} h-12 px-6 text-[15px] border border-peligro/40 bg-peligro-suave text-peligro hover:border-peligro`,
  chico: `${baseBoton} h-9 px-4 text-sm bg-superficie-3 text-texto hover:bg-borde`,
  chicoPrimario: `${baseBoton} h-9 px-4 text-sm bg-primario text-sobre-primario hover:bg-primario-hover`,
  icono: `${baseBoton} size-10 shrink-0 bg-superficie text-texto border border-borde hover:bg-superficie-3`,
};

export const campo =
  "h-12 w-full rounded-xl border-[1.5px] border-borde bg-superficie px-4 text-[15px] " +
  "text-texto placeholder:text-texto-3 outline-none transition " +
  "focus:border-primario focus:ring-4 focus:ring-primario/20 " +
  "disabled:cursor-not-allowed disabled:opacity-70";

export const tarjeta =
  "rounded-2xl border border-borde bg-superficie shadow-tarjeta";

// Chip de filtro (Todos, Huecos, etc.)
export const chip = (activo) =>
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition " +
  (activo
    ? "border-texto bg-texto text-fondo"
    : "border-borde bg-superficie text-texto hover:bg-superficie-3");
