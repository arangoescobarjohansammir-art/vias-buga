import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ChevronDown, EyeOff, ImagePlus, ThumbsUp } from "lucide-react";
import AvisoEjemplo from "../../components/ui/AvisoEjemplo.jsx";
import FotoEjemplo from "../../components/ui/FotoEjemplo.jsx";
import InsigniaEstado from "../../components/ui/InsigniaEstado.jsx";
import MapaEstados from "../../components/mapa/MapaEstados.jsx";
import { boton, campo, tarjeta } from "../../components/ui/estilos.js";
import { ESTADOS, ORDEN_ESTADOS, TIPOS, formatearCoordenadas } from "../../data/catalogos.js";
import { CUADRILLAS, buscarReporte } from "../../data/ejemplo.js";

function Seccion({ titulo, children, className = "" }) {
  return (
    <section className={`${tarjeta} p-5 sm:p-6 ${className}`}>
      <h2 className="mb-4 text-base font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

function DetalleAdmin() {
  const { ref } = useParams();
  const original = buscarReporte(ref);

  const [estado, setEstado] = useState(original?.estado ?? "recibido");
  const [observaciones, setObservaciones] = useState("");
  const [cuadrilla, setCuadrilla] = useState(original?.cuadrilla ?? "");
  const [historial, setHistorial] = useState(original?.historial ?? []);
  const [fotoReparacion, setFotoReparacion] = useState("");
  const [fotoOculta, setFotoOculta] = useState(false);
  const [guardado, setGuardado] = useState(false);

  if (!original) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-borde-fuerte p-8 text-center">
        <p className="font-bold">No encontramos el reporte Ref. {ref}</p>
        <Link to="/admin" className={`${boton.primario} mt-5`}>
          Volver al listado
        </Link>
      </div>
    );
  }

  const guardar = (e) => {
    e.preventDefault();
    // Más adelante: supabase.rpc("cambiar_estado_reporte", ...) y update de cuadrilla_id.
    if (estado !== historial.at(-1)?.estado) {
      setHistorial((h) => [
        ...h,
        { estado, fecha: "hoy", nota: observaciones.trim() || "Estado actualizado" },
      ]);
    }
    setObservaciones("");
    setGuardado(true);
  };

  const marcarCambio = (fn) => (valor) => {
    fn(valor);
    setGuardado(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link to="/admin" className="inline-flex items-center gap-1.5 font-semibold text-texto-2 hover:text-texto">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al listado
        </Link>
        <span className="text-texto-3">Reportes / Ref. {original.ref}</span>
        <AvisoEjemplo className="ml-auto" />
      </div>

      <header className={`${tarjeta} mt-4 p-5 sm:p-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <InsigniaEstado estado={estado} conPunto />
          <span className="inline-flex items-center gap-1.5 text-sm text-texto-2">
            <ThumbsUp className="size-4" aria-hidden="true" />
            {original.apoyos} apoyos recibidos
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Ref. {original.ref} · {TIPOS[original.tipo].etiqueta} · Barrio {original.barrio}
        </h1>
        <p className="mt-1 text-sm text-texto-2">
          {original.comuna} · Reportado el {original.fecha} · {formatearCoordenadas(original.lat, original.lng)}
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Seccion titulo="Foto del ciudadano y ubicación">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                {fotoOculta ? (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-borde-fuerte bg-superficie-2 p-4 text-center text-sm text-texto-2">
                    <EyeOff className="size-6" aria-hidden="true" />
                    Foto oculta por moderación
                  </div>
                ) : (
                  <FotoEjemplo variante="antes" etiqueta="Foto del reporte" className="aspect-[4/3]" />
                )}
              </div>
              <div className="h-56 overflow-hidden rounded-2xl border border-borde sm:h-auto sm:min-h-52">
                <MapaEstados reportes={[original]} seleccionado={original.ref} zoom={16} />
              </div>
            </div>
          </Seccion>

          <Seccion titulo="Descripción del ciudadano">
            <p className="text-[15px] leading-relaxed">“{original.descripcion}”</p>
          </Seccion>

          <Seccion titulo="Historial de estados">
            <ol className="space-y-3">
              {historial.map((h, i) => (
                <li key={`${h.estado}-${i}`} className="flex items-start gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-2.5 shrink-0 rounded-full"
                    style={{ background: `var(--est-${h.estado}-dot)` }}
                  />
                  <span className="flex-1">
                    <span className="font-bold">{ESTADOS[h.estado].etiqueta}</span>
                    <span className="block text-texto-2">{h.nota}</span>
                  </span>
                  <span className="text-xs text-texto-3">{h.fecha}</span>
                </li>
              ))}
            </ol>
          </Seccion>
        </div>

        <form onSubmit={guardar} className="flex flex-col gap-6">
          <Seccion titulo="Actualizar estado">
            <div role="radiogroup" aria-label="Estado del reporte" className="grid grid-cols-2 gap-2">
              {ORDEN_ESTADOS.map((valor) => (
                <button
                  key={valor}
                  type="button"
                  role="radio"
                  aria-checked={estado === valor}
                  onClick={() => marcarCambio(setEstado)(valor)}
                  className={`h-11 cursor-pointer rounded-xl border-2 text-sm font-bold transition ${
                    estado === valor ? "border-texto bg-primario/20" : "border-borde hover:border-borde-fuerte"
                  }`}
                >
                  {ESTADOS[valor].etiqueta}
                </button>
              ))}
            </div>

            <label htmlFor="observaciones" className="mb-1.5 mt-5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-texto-3">
              Observaciones (máx. 500 caracteres)
              <span className="font-semibold normal-case tracking-normal">{observaciones.length}/500</span>
            </label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => marcarCambio(setObservaciones)(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Escribe las observaciones que se publicarán en el historial..."
              className={`${campo} h-auto resize-none py-3 text-sm`}
            />
            <p className="mt-2 text-xs text-texto-3">Esta nota aparecerá en la línea de tiempo pública del reporte.</p>
          </Seccion>

          <Seccion titulo="Asignar cuadrilla">
            <label htmlFor="cuadrilla" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-texto-3">
              Cuadrilla responsable
            </label>
            <span className="relative block">
              <select
                id="cuadrilla"
                value={cuadrilla}
                onChange={(e) => marcarCambio(setCuadrilla)(e.target.value)}
                className={`${campo} appearance-none pr-10 text-sm`}
              >
                <option value="">Sin asignar</option>
                {CUADRILLAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
            </span>
          </Seccion>

          <Seccion titulo="Foto de reparación (“Después”)">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-borde-fuerte bg-superficie-2 p-5 text-center transition hover:border-primario">
              <ImagePlus className="size-7 text-texto-2" aria-hidden="true" />
              <span className="text-sm font-bold">{fotoReparacion || "Subir foto de reparación finalizada"}</span>
              <span className="text-xs text-texto-3">JPG, PNG o WebP (hasta 5 MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  if (archivo && archivo.size <= 5 * 1024 * 1024) marcarCambio(setFotoReparacion)(archivo.name);
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => marcarCambio(setFotoOculta)(!fotoOculta)}
              aria-pressed={fotoOculta}
              className={`${boton.secundario} mt-3 h-11 w-full text-sm`}
            >
              <EyeOff className="size-4" aria-hidden="true" />
              {fotoOculta ? "Mostrar foto de nuevo" : "Ocultar foto (moderar rostros o placas)"}
            </button>
            <p className="mt-2 text-xs text-texto-3">Usa esta opción si la imagen contiene datos personales o matrículas visibles.</p>
          </Seccion>

          <div>
            <button type="submit" className={`${boton.primario} h-14 w-full text-base`}>
              Guardar cambios
            </button>
            <p role="status" className={`mt-3 text-center text-sm font-semibold text-exito ${guardado ? "" : "hidden"}`}>
              Cambios guardados (ejemplo, aún no se envían a la base de datos)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DetalleAdmin;
