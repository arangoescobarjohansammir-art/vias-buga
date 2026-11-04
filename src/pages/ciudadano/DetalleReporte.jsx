import { useState } from "react";
import { Link, useParams } from "react-router";
import { Calendar, MapPin, ThumbsUp } from "lucide-react";
import EncabezadoPantalla from "../../components/ui/EncabezadoPantalla.jsx";
import FotoEjemplo from "../../components/ui/FotoEjemplo.jsx";
import InsigniaEstado from "../../components/ui/InsigniaEstado.jsx";
import LineaTiempo from "../../components/ui/LineaTiempo.jsx";
import AvisoEjemplo from "../../components/ui/AvisoEjemplo.jsx";
import { boton } from "../../components/ui/estilos.js";
import { TIPOS, formatearCoordenadas } from "../../data/catalogos.js";
import { buscarReporte } from "../../data/ejemplo.js";

function NoEncontrado({ ref_ }) {
  return (
    <div className="mx-auto max-w-lg px-4 pb-10">
      <EncabezadoPantalla titulo={`Ref. ${ref_}`} volverA="/app/mis-reportes" />
      <div className="rounded-2xl border border-dashed border-borde-fuerte p-8 text-center">
        <p className="font-bold">Este reporte no está en los datos de ejemplo</p>
        <p className="mt-2 text-sm text-texto-2">
          Los reportes nuevos se guardarán de verdad cuando conectemos la base de datos.
        </p>
        <Link to="/app" className={`${boton.primario} mt-5`}>
          Volver al mapa
        </Link>
      </div>
    </div>
  );
}

function DetalleReporte() {
  const { ref } = useParams();
  const reporte = buscarReporte(ref);
  const [apoyado, setApoyado] = useState(false);

  if (!reporte) return <NoEncontrado ref_={ref} />;

  const resuelto = reporte.estado === "resuelto";
  const totalApoyos = reporte.apoyos + (apoyado ? 1 : 0);
  const coordenadas = formatearCoordenadas(reporte.lat, reporte.lng);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 md:px-6">
      <EncabezadoPantalla titulo={`Ref. ${reporte.ref}`} volverA="/app/mis-reportes" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          {resuelto ? (
            <div className="grid grid-cols-2 gap-3">
              <FotoEjemplo variante="antes" etiqueta={`Antes · ${reporte.fecha}`} className="aspect-square" />
              <FotoEjemplo variante="despues" etiqueta={`Después · ${reporte.resueltoEn}`} className="aspect-square" />
            </div>
          ) : (
            <div className="relative">
              <FotoEjemplo variante="antes" className="aspect-[4/3]" />
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
          <AvisoEjemplo className="mt-3" />
        </div>

        <div>
          <InsigniaEstado estado={reporte.estado} />
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">
            {TIPOS[reporte.tipo].etiqueta} · Barrio {reporte.barrio}
          </h2>
          <p className="mt-1.5 text-sm text-texto-2">
            {resuelto
              ? `Resuelto ${reporte.diasParaResolver} días después de tu reporte · ${coordenadas}`
              : `Reportado el ${reporte.fecha} · ${reporte.comuna}`}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-texto">{reporte.descripcion}</p>

          <h3 className="mb-4 mt-8 text-lg font-extrabold">Seguimiento</h3>
          <LineaTiempo estadoActual={reporte.estado} historial={reporte.historial} />

          {resuelto ? (
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-borde bg-superficie p-4 shadow-tarjeta">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primario/20 text-acento">
                <ThumbsUp className="size-6" aria-hidden="true" />
              </span>
              <p className="text-sm leading-snug text-texto-2">
                Este reporte sumó <strong className="text-texto">{totalApoyos} apoyos</strong> de vecinos.
                Gracias por ayudar a mejorar Buga.
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setApoyado((v) => !v)}
                aria-pressed={apoyado}
                className={`${apoyado ? boton.primario : boton.secundario} w-full`}
              >
                <ThumbsUp className="size-5" aria-hidden="true" />
                {apoyado ? "Apoyaste este reporte" : "Apoyar este reporte"}
              </button>
              <p className="mt-2 text-center text-sm text-texto-3">{totalApoyos} apoyos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalleReporte;
