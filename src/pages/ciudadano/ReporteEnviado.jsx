import { Link, Navigate, useLocation } from "react-router";
import { AlertTriangle, Bell, Check, FileText, Map as IconoMapa } from "lucide-react";
import BotonTema from "../../components/ui/BotonTema.jsx";
import IconoTipo from "../../components/ui/IconoTipo.jsx";
import InsigniaEstado from "../../components/ui/InsigniaEstado.jsx";
import { boton } from "../../components/ui/estilos.js";
import { ESTADOS, ORDEN_ESTADOS, TIPOS } from "../../data/catalogos.js";

function ReporteEnviado() {
  const { state } = useLocation();
  // Esta pantalla solo tiene sentido justo después de enviar un reporte.
  if (!state?.id || !TIPOS[state.tipo]) return <Navigate to="/app" replace />;
  const { id, tipo, fotoFallo } = state;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col px-4 pb-10">
      <div className="flex h-16 items-center justify-end md:hidden">
        <BotonTema />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-exito/15">
          <span className="flex size-16 items-center justify-center rounded-full bg-exito text-white shadow-lg">
            <Check className="size-9" strokeWidth={3} aria-hidden="true" />
          </span>
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">¡Reporte enviado con éxito!</h1>
        <p className="mt-2 text-[15px] text-texto-2">Tu reporte quedó registrado como Recibido.</p>
        {fotoFallo && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-peligro/40 bg-peligro-suave p-3 text-left text-sm text-texto">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-peligro" aria-hidden="true" />
            El reporte se guardó, pero no pudimos subir la foto. Puedes crear otro reporte con la foto si la necesitas.
          </p>
        )}

        <div className="mt-8 w-full rounded-3xl border border-borde bg-superficie p-5 text-left shadow-tarjeta">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-texto-2">Ref. {id.slice(0, 8)}</p>
            <InsigniaEstado estado="recibido" />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-superficie-3">
              <IconoTipo tipo={tipo} className="size-8" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-acento">Afectación vial</p>
              <p className="text-lg font-bold">{TIPOS[tipo].etiqueta}</p>
              <p className="text-sm text-texto-2">Hoy, hace un momento</p>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-superficie-2 p-3 text-sm leading-snug text-texto-2">
            <Bell className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden="true" />
            Te notificaremos dentro de la app cuando una cuadrilla inicie la revisión técnica.
          </p>
          <ol className="mt-5 grid grid-cols-4 gap-1 text-center text-[11px] font-semibold">
            {ORDEN_ESTADOS.map((estado, i) => (
              <li key={estado} className={i === 0 ? "text-texto" : "text-texto-3"}>
                <span
                  aria-hidden="true"
                  className={`mx-auto mb-1.5 block h-1.5 rounded-full ${i === 0 ? "bg-primario" : "bg-borde"}`}
                />
                {ESTADOS[estado].etiqueta}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex w-full flex-col gap-3">
          <Link to={`/app/reporte/${id}`} className={boton.secundario}>
            <FileText className="size-5" aria-hidden="true" />
            Ver mi reporte
          </Link>
          <Link to="/app" className={boton.primario}>
            <IconoMapa className="size-5" aria-hidden="true" />
            Volver al mapa
          </Link>
        </div>
        <p className="mt-6 text-sm text-texto-3">Gracias por construir una Guadalajara de Buga más segura.</p>
      </div>
    </div>
  );
}

export default ReporteEnviado;
