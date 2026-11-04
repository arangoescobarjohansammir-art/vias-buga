import { Check } from "lucide-react";
import { ESTADOS, ORDEN_ESTADOS } from "../../data/catalogos.js";

// Línea de tiempo del reporte: Recibido → En revisión → En reparación → Resuelto.
// "historial" viene de historial_estados (estado, fecha, nota/observaciones).
function LineaTiempo({ estadoActual, historial }) {
  const ordenActual = ESTADOS[estadoActual].orden;

  return (
    <ol className="relative">
      {ORDEN_ESTADOS.map((estado, indice) => {
        const registro = historial.find((h) => h.estado === estado);
        const orden = ESTADOS[estado].orden;
        const hecho = orden < ordenActual || (estado === "resuelto" && estadoActual === "resuelto");
        const actual = estado === estadoActual && estado !== "resuelto";
        const ultimo = indice === ORDEN_ESTADOS.length - 1;

        return (
          <li key={estado} className="relative flex gap-4 pb-6 last:pb-0">
            {!ultimo && (
              <span
                aria-hidden="true"
                className={`absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 ${
                  hecho ? "bg-exito" : "bg-borde"
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 ${
                hecho
                  ? "border-exito bg-exito text-white"
                  : actual
                    ? "border-texto bg-primario"
                    : "border-borde-fuerte bg-superficie"
              }`}
            >
              {hecho && <Check className="size-4" strokeWidth={3} />}
            </span>
            <div className={hecho || actual ? "" : "opacity-60"}>
              <p className="text-[15px] font-bold leading-7 text-texto">
                {ESTADOS[estado].etiqueta}
                {actual && (
                  <span className="ml-2 align-middle text-xs font-semibold text-acento">
                    (actual)
                  </span>
                )}
              </p>
              <p className="text-sm text-texto-2">
                {registro ? `${registro.fecha} · ${registro.nota}` : "Pendiente"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default LineaTiempo;
