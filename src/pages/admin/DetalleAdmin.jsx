import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ChevronDown, Eye, EyeOff, ImagePlus, ThumbsUp } from "lucide-react";
import Cargando from "../../components/ui/Cargando.jsx";
import ErrorCarga from "../../components/ui/ErrorCarga.jsx";
import Foto from "../../components/ui/Foto.jsx";
import InsigniaEstado from "../../components/ui/InsigniaEstado.jsx";
import MapaEstados from "../../components/mapa/MapaEstados.jsx";
import { boton, campo, tarjeta } from "../../components/ui/estilos.js";
import { ESTADOS, ORDEN_ESTADOS, TIPOS, formatearCoordenadas } from "../../data/catalogos.js";
import { useConsulta } from "../../hooks/useConsulta.js";
import { mensajeError } from "../../servicios/errores.js";
import { MAX_FOTO_ORIGINAL_BYTES, TIPOS_FOTO, subirFoto } from "../../servicios/fotos.js";
import {
  agregarNota,
  asignarCuadrilla,
  cambiarEstado,
  etiquetaUbicacion,
  listarCuadrillas,
  obtenerReporte,
  ocultarFoto,
} from "../../servicios/reportes.js";

function Seccion({ titulo, children, className = "" }) {
  return (
    <section className={`${tarjeta} p-5 sm:p-6 ${className}`}>
      <h2 className="mb-4 text-base font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

function Panel({ datos, recargar }) {
  const { reporte, historial, fotos, cuadrillas } = datos;

  const [estado, setEstado] = useState(reporte.estado);
  const [observaciones, setObservaciones] = useState("");
  const [cuadrilla, setCuadrilla] = useState(reporte.cuadrillaId ? String(reporte.cuadrillaId) : "");
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");
  const [moderando, setModerando] = useState(false);

  const marcarCambio = (fn) => (valor) => {
    fn(valor);
    setGuardado(false);
  };

  const elegirArchivo = (e) => {
    const elegido = e.target.files?.[0];
    e.target.value = "";
    if (!elegido) return;
    if (!TIPOS_FOTO.includes(elegido.type)) return setError("La foto debe ser JPG, PNG o WebP.");
    if (elegido.size > MAX_FOTO_ORIGINAL_BYTES) return setError("La foto pesa más de 25 MB.");
    setError("");
    marcarCambio(setArchivo)(elegido);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    setGuardado(false);
    setGuardando(true);
    try {
      const nuevaCuadrilla = cuadrilla === "" ? null : Number(cuadrilla);
      if (nuevaCuadrilla !== reporte.cuadrillaId) await asignarCuadrilla([reporte.ref], nuevaCuadrilla);

      const nota = observaciones.trim();
      if (estado !== reporte.estado) await cambiarEstado(reporte.ref, estado, nota || null);
      else if (nota) await agregarNota(reporte.ref, nota);

      if (archivo) await subirFoto(reporte.ref, archivo, "despues");

      setGuardado(true);
      recargar(); // el formulario se reinicia con los datos nuevos
    } catch (err) {
      setError(mensajeError(err, "No pudimos guardar los cambios. Inténtalo de nuevo."));
    } finally {
      setGuardando(false);
    }
  };

  const alternarFoto = async (foto) => {
    setError("");
    setModerando(true);
    try {
      await ocultarFoto(foto.id, !foto.oculta);
      recargar();
    } catch (err) {
      setError(mensajeError(err, "No pudimos moderar la foto."));
    } finally {
      setModerando(false);
    }
  };

  const idCuadrillaActual = reporte.cuadrillaId ? String(reporte.cuadrillaId) : "";
  const faltaActual = idCuadrillaActual && !cuadrillas.some((c) => String(c.id) === idCuadrillaActual);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link to="/admin" className="inline-flex items-center gap-1.5 font-semibold text-texto-2 hover:text-texto">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al listado
        </Link>
        <span className="text-texto-3">Reportes / Ref. {reporte.refCorta}</span>
      </div>

      <header className={`${tarjeta} mt-4 p-5 sm:p-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <InsigniaEstado estado={reporte.estado} conPunto />
          <span className="inline-flex items-center gap-1.5 text-sm text-texto-2">
            <ThumbsUp className="size-4" aria-hidden="true" />
            {reporte.apoyos} apoyos recibidos
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Ref. {reporte.refCorta} · {TIPOS[reporte.tipo].etiqueta} · {etiquetaUbicacion(reporte)}
        </h1>
        <p className="mt-1 text-sm text-texto-2">
          {reporte.comuna ? `${reporte.comuna} · ` : ""}Reportado el {reporte.fecha} ·{" "}
          {formatearCoordenadas(reporte.lat, reporte.lng)}
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Seccion titulo="Fotos y ubicación">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-4">
                {fotos.length === 0 && <Foto className="aspect-[4/3]" />}
                {fotos.map((foto) => (
                  <div key={foto.id}>
                    <div className={foto.oculta ? "opacity-50" : ""}>
                      <Foto
                        url={foto.url}
                        etiqueta={foto.tipo === "antes" ? "Foto del ciudadano" : "Reparación"}
                        className="aspect-[4/3]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => alternarFoto(foto)}
                      disabled={moderando}
                      aria-pressed={foto.oculta}
                      className={`${boton.secundario} mt-2 h-10 w-full text-sm`}
                    >
                      {foto.oculta ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                      {foto.oculta ? "Oculta al público · mostrar de nuevo" : "Ocultar (rostros o placas)"}
                    </button>
                  </div>
                ))}
              </div>
              <div className="h-56 overflow-hidden rounded-2xl border border-borde sm:h-auto sm:min-h-52">
                <MapaEstados reportes={[reporte]} seleccionado={reporte.ref} zoom={16} />
              </div>
            </div>
            <p className="mt-3 text-xs text-texto-3">
              Oculta una foto si contiene datos personales o matrículas visibles. Deja de verse en la parte pública.
            </p>
          </Seccion>

          <Seccion titulo="Descripción del ciudadano">
            <p className="whitespace-pre-line break-words text-[15px] leading-relaxed">“{reporte.descripcion}”</p>
          </Seccion>

          <Seccion titulo="Historial de estados">
            <ol className="space-y-3">
              {historial.map((h) => (
                <li key={h.id} className="flex items-start gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-2.5 shrink-0 rounded-full"
                    style={{ background: `var(--est-${h.estado}-dot)` }}
                  />
                  <span className="flex-1">
                    <span className="font-bold">
                      {ESTADOS[h.estado].etiqueta}
                      {h.esNota && <span className="ml-2 text-xs font-semibold text-texto-3">(nota)</span>}
                    </span>
                    <span className="block break-words text-texto-2">{h.nota}</span>
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
                {faltaActual && <option value={idCuadrillaActual}>{reporte.cuadrilla} (inactiva)</option>}
                {cuadrillas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
            </span>
            {cuadrillas.length === 0 && (
              <p className="mt-2 text-xs text-texto-3">
                Aún no hay cuadrillas. Créalas desde el listado de reportes (“Nueva cuadrilla”).
              </p>
            )}
          </Seccion>

          <Seccion titulo="Foto de reparación (“Después”)">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-borde-fuerte bg-superficie-2 p-5 text-center transition hover:border-primario">
              <ImagePlus className="size-7 text-texto-2" aria-hidden="true" />
              <span className="break-all text-sm font-bold">{archivo?.name || "Subir foto de reparación finalizada"}</span>
              <span className="text-xs text-texto-3">JPG, PNG o WebP. Se optimiza sola antes de subirla.</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={elegirArchivo} />
            </label>
          </Seccion>

          <div>
            {error && (
              <p role="alert" className="mb-3 text-sm font-semibold text-peligro">
                {error}
              </p>
            )}
            <button type="submit" disabled={guardando} className={`${boton.primario} h-14 w-full text-base`}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            <p role="status" className={`mt-3 text-center text-sm font-semibold text-exito ${guardado ? "" : "hidden"}`}>
              Cambios guardados
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetalleAdmin() {
  const { ref } = useParams();
  const { datos, error, cargando, recargar } = useConsulta(async () => {
    const [detalle, cuadrillas] = await Promise.all([obtenerReporte(ref), listarCuadrillas()]);
    return detalle ? { ...detalle, cuadrillas } : { vacio: true };
  }, [ref]);

  if (error) return <ErrorCarga error={error} onReintentar={recargar} />;
  if (cargando && !datos) return <Cargando texto="Cargando el reporte" />;
  if (!datos || datos.vacio) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-borde-fuerte p-8 text-center">
        <p className="font-bold">No encontramos el reporte Ref. {ref.slice(0, 8)}</p>
        <Link to="/admin" className={`${boton.primario} mt-5`}>
          Volver al listado
        </Link>
      </div>
    );
  }

  const { reporte, historial, fotos } = datos;
  // La "key" reinicia el formulario cuando llegan datos nuevos tras guardar.
  const clave = `${reporte.estado}|${reporte.cuadrillaId}|${historial.length}|${fotos.map((f) => `${f.id}${f.oculta}`).join(",")}`;
  return <Panel key={clave} datos={datos} recargar={recargar} />;
}

export default DetalleAdmin;
