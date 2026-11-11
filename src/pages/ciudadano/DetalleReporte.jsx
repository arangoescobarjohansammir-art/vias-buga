import { useState } from "react";
import { Link, useParams } from "react-router";
import { Calendar, MapPin, ThumbsUp } from "lucide-react";
import EncabezadoPantalla from "../../components/ui/EncabezadoPantalla.jsx";
import Foto from "../../components/ui/Foto.jsx";
import Cargando from "../../components/ui/Cargando.jsx";
import ErrorCarga from "../../components/ui/ErrorCarga.jsx";
import InsigniaEstado from "../../components/ui/InsigniaEstado.jsx";
import LineaTiempo from "../../components/ui/LineaTiempo.jsx";
import { boton } from "../../components/ui/estilos.js";
import { TIPOS, formatearCoordenadas } from "../../data/catalogos.js";
import { useAuth } from "../../contexto/auth.js";
import { useConsulta } from "../../hooks/useConsulta.js";
import { mensajeError } from "../../servicios/errores.js";
import {
  apoyarReporte,
  etiquetaUbicacion,
  marcarAvisosLeidos,
  obtenerReporte,
  quitarApoyo,
} from "../../servicios/reportes.js";

function NoEncontrado({ refCorta }) {
  return (
    <div className="mx-auto max-w-lg px-4 pb-10">
      <EncabezadoPantalla titulo={`Ref. ${refCorta}`} volverA="/app" />
      <div className="rounded-2xl border border-dashed border-borde-fuerte p-8 text-center">
        <p className="font-bold">No encontramos este reporte</p>
        <p className="mt-2 text-sm text-texto-2">Puede que el enlace esté incompleto o que el reporte ya no exista.</p>
        <Link to="/app" className={`${boton.primario} mt-5`}>
          Volver al mapa
        </Link>
      </div>
    </div>
  );
}

function BotonApoyo({ reporte, apoyado, esMio, recargar }) {
  const { uid, asegurarSesion } = useAuth();
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState("");

  const alternar = async () => {
    setError("");
    setTrabajando(true);
    try {
      const usuario = await asegurarSesion();
      if (apoyado) await quitarApoyo(reporte.ref, uid ?? usuario.id);
      else await apoyarReporte(reporte.ref);
      recargar();
    } catch (e) {
      setError(mensajeError(e, "No pudimos registrar tu apoyo. Inténtalo de nuevo."));
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <div className="mt-8">
      {esMio ? (
        <p className="rounded-2xl border border-borde bg-superficie-2 p-4 text-center text-sm text-texto-2">
          Este es tu reporte. Tus vecinos pueden apoyarlo para darle prioridad.
        </p>
      ) : (
        <button
          type="button"
          onClick={alternar}
          disabled={trabajando}
          aria-pressed={apoyado}
          className={`${apoyado ? boton.primario : boton.secundario} w-full`}
        >
          <ThumbsUp className="size-5" aria-hidden="true" />
          {apoyado ? "Apoyaste este reporte" : "Apoyar este reporte"}
        </button>
      )}
      <p className="mt-2 text-center text-sm text-texto-3">
        {reporte.apoyos} {reporte.apoyos === 1 ? "apoyo" : "apoyos"}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm font-semibold text-peligro">
          {error}
        </p>
      )}
    </div>
  );
}

function DetalleReporte() {
  const { ref } = useParams();
  const { uid } = useAuth();
  const { datos, error, cargando, recargar } = useConsulta(async () => {
    const resultado = await obtenerReporte(ref, uid);
    // Si la persona tenía un aviso de este reporte, ya lo está viendo: se marca como leído.
    if (resultado && uid) await marcarAvisosLeidos(ref).catch(() => {});
    return resultado ?? { vacio: true };
  }, [ref, uid]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-10">
        <EncabezadoPantalla titulo={`Ref. ${ref.slice(0, 8)}`} volverA="/app" />
        <ErrorCarga error={error} onReintentar={recargar} />
      </div>
    );
  }
  if (cargando && !datos) return <Cargando texto="Cargando el reporte" />;
  if (!datos || datos.vacio) return <NoEncontrado refCorta={ref.slice(0, 8)} />;

  const { reporte, historial, fotos, apoyado } = datos;
  const resuelto = reporte.estado === "resuelto";
  const coordenadas = formatearCoordenadas(reporte.lat, reporte.lng);
  const fotoAntes = fotos.find((f) => f.tipo === "antes" && !f.oculta);
  const fotoDespues = fotos.find((f) => f.tipo === "despues" && !f.oculta);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 md:px-6">
      <EncabezadoPantalla titulo={`Ref. ${reporte.refCorta}`} volverA="/app" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          {resuelto && fotoDespues ? (
            <div className="grid grid-cols-2 gap-3">
              <Foto url={fotoAntes?.url} etiqueta={`Antes · ${reporte.fecha}`} className="aspect-square" />
              <Foto url={fotoDespues.url} etiqueta={`Después · ${reporte.resueltoEn}`} className="aspect-square" />
            </div>
          ) : (
            <div className="relative">
              <Foto url={fotoAntes?.url} className="aspect-[4/3]" prioridad />
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white">
                <MapPin className="size-3.5 text-primario" aria-hidden="true" />
                {coordenadas}
              </span>
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white">
                <Calendar className="size-3.5" aria-hidden="true" />
                Captura: {reporte.fecha}
              </span>
            </div>
          )}
        </div>

        <div>
          <InsigniaEstado estado={reporte.estado} />
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">
            {TIPOS[reporte.tipo].etiqueta} · {etiquetaUbicacion(reporte)}
          </h2>
          <p className="mt-1.5 text-sm text-texto-2">
            {resuelto
              ? `Resuelto ${reporte.diasParaResolver} ${reporte.diasParaResolver === 1 ? "día" : "días"} después del reporte · ${coordenadas}`
              : `Reportado el ${reporte.fecha}${reporte.comuna ? ` · ${reporte.comuna}` : ""}`}
          </p>
          <p className="mt-4 whitespace-pre-line break-words text-[15px] leading-relaxed text-texto">
            {reporte.descripcion}
          </p>

          <h3 className="mb-4 mt-8 text-lg font-extrabold">Seguimiento</h3>
          <LineaTiempo estadoActual={reporte.estado} historial={historial} />

          {resuelto ? (
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-borde bg-superficie p-4 shadow-tarjeta">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primario/20 text-acento">
                <ThumbsUp className="size-6" aria-hidden="true" />
              </span>
              <p className="text-sm leading-snug text-texto-2">
                Este reporte sumó <strong className="text-texto">{reporte.apoyos} apoyos</strong> de vecinos.
                Gracias por ayudar a mejorar Buga.
              </p>
            </div>
          ) : (
            <BotonApoyo
              reporte={reporte}
              apoyado={apoyado}
              esMio={Boolean(uid) && reporte.usuarioId === uid}
              recargar={recargar}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalleReporte;
