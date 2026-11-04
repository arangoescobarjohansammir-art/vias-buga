import { Link } from "react-router";
import { Bell } from "lucide-react";
import { TIPOS } from "../../data/catalogos.js";
import IconoTipo from "./IconoTipo.jsx";
import InsigniaEstado from "./InsigniaEstado.jsx";

// Tarjeta de un reporte (listas de Inicio y Mis reportes).
// "aviso" muestra la franja roja de "¡Tu reporte pasó a ...!".
function TarjetaReporte({ reporte, aviso, destacado = false }) {
  const titulo = `${TIPOS[reporte.tipo].etiqueta} · Barrio ${reporte.barrio}`;

  return (
    <Link
      to={`/app/reporte/${reporte.ref}`}
      className={`block overflow-hidden rounded-2xl border bg-superficie shadow-tarjeta transition hover:border-borde-fuerte ${
        aviso ? "border-peligro" : destacado ? "border-primario" : "border-borde"
      }`}
    >
      {aviso && (
        <div className="flex items-center gap-2 bg-red-600 px-4 py-2 text-sm font-bold text-white">
          <Bell className="size-4" aria-hidden="true" />
          {aviso}
        </div>
      )}
      <div className="flex items-center gap-3.5 p-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-superficie-3 text-texto">
          <IconoTipo tipo={reporte.tipo} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-texto">{titulo}</p>
          <p className="truncate text-sm text-texto-2">
            Ref. {reporte.ref} · {reporte.hace}
          </p>
        </div>
        <InsigniaEstado estado={reporte.estado} />
      </div>
    </Link>
  );
}

export default TarjetaReporte;
