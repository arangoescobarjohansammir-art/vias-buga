import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Camera, Copy, LocateFixed, ShieldCheck, X } from "lucide-react";
import EncabezadoPantalla from "../../components/ui/EncabezadoPantalla.jsx";
import IconoTipo from "../../components/ui/IconoTipo.jsx";
import InsigniaEstado from "../../components/ui/InsigniaEstado.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Mapa from "../../components/Mapa.jsx"; // el mapa que ya tenías: no se modificó
import { boton, campo } from "../../components/ui/estilos.js";
import { TIPOS, dentroDeBuga, formatearCoordenadas } from "../../data/catalogos.js";
import { useAuth } from "../../contexto/auth.js";
import { MAX_FOTO_ORIGINAL_BYTES, TIPOS_FOTO, subirFoto } from "../../servicios/fotos.js";
import { apoyarReporte, crearReporte, reportesCercanos } from "../../servicios/reportes.js";
import { mensajeError } from "../../servicios/errores.js";

const RADIO_DUPLICADO_M = 25; // el mismo radio de la función reportes_cercanos()

function NuevoReporte() {
  const navegar = useNavigate();
  const { asegurarSesion } = useAuth();

  const [tipo, setTipo] = useState("");
  const [ubicacion, setUbicacion] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState(null); // { archivo, url }
  const [error, setError] = useState("");
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [duplicado, setDuplicado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Libera la vista previa de la foto cuando cambia o se sale de la pantalla.
  useEffect(() => {
    const url = foto?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [foto]);

  const elegirFoto = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (!TIPOS_FOTO.includes(archivo.type)) {
      setError("La foto debe ser JPG, PNG o WebP.");
    } else if (archivo.size > MAX_FOTO_ORIGINAL_BYTES) {
      setError("La foto pesa más de 25 MB. Elige una más liviana.");
    } else {
      setError("");
      setFoto({ archivo, url: URL.createObjectURL(archivo) });
    }
    e.target.value = "";
  };

  const usarMiUbicacion = () => {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no permite obtener la ubicación.");
      return;
    }
    setBuscandoGps(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUbicacion({ lat: coords.latitude, lng: coords.longitude });
        setBuscandoGps(false);
      },
      () => {
        setError("No pudimos obtener tu ubicación. Toca el mapa para marcarla.");
        setBuscandoGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Crea el reporte en Supabase, sube la foto y pasa a la pantalla de confirmación.
  const terminar = async () => {
    setEnviando(true);
    setError("");
    try {
      await asegurarSesion();
      const id = await crearReporte({ tipo, descripcion, lat: ubicacion.lat, lng: ubicacion.lng });
      let fotoFallo = false;
      if (foto) {
        try {
          await subirFoto(id, foto.archivo, "antes");
        } catch {
          fotoFallo = true; // el reporte ya quedó guardado; solo falló la foto
        }
      }
      navegar("/app/reportar/enviado", { state: { id, tipo, fotoFallo }, replace: true });
    } catch (e) {
      setDuplicado(null);
      setError(mensajeError(e, "No pudimos enviar tu reporte. Inténtalo de nuevo."));
      setEnviando(false);
    }
  };

  const apoyarExistente = async () => {
    setEnviando(true);
    try {
      await asegurarSesion();
      await apoyarReporte(duplicado.ref);
      navegar(`/app/reporte/${duplicado.ref}`);
    } catch (e) {
      setDuplicado(null);
      setError(mensajeError(e, "No pudimos registrar tu apoyo. Inténtalo de nuevo."));
      setEnviando(false);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    if (!tipo) return setError("Elige el tipo de daño.");
    if (!ubicacion) return setError("Toca el mapa para marcar dónde está el daño.");
    if (!dentroDeBuga(ubicacion)) return setError("Esa ubicación queda fuera de Guadalajara de Buga.");
    if (descripcion.trim().length === 0) return setError("Cuéntanos un poco más sobre el daño.");
    setError("");
    setEnviando(true);

    // Aviso de duplicados: la base de datos busca reportes del mismo tipo a menos de 25 m.
    try {
      const cercanos = await reportesCercanos({ lat: ubicacion.lat, lng: ubicacion.lng, tipo, metros: RADIO_DUPLICADO_M });
      if (cercanos.length > 0) {
        setDuplicado(cercanos[0]);
        setEnviando(false);
        return;
      }
    } catch {
      // Si la comprobación falla, no bloqueamos el reporte.
    }
    await terminar();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 md:px-6">
      <EncabezadoPantalla titulo="Nuevo reporte" volverA="/app" />

      <form onSubmit={enviar} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-8">
          <fieldset>
            <legend className="mb-3 text-base font-bold">¿Qué tipo de daño es?</legend>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-3">
              {Object.entries(TIPOS).map(([valor, { etiqueta }]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setTipo(valor)}
                  aria-pressed={tipo === valor}
                  className={`flex h-[5.25rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 text-[13px] font-semibold transition ${
                    tipo === valor
                      ? "border-texto bg-primario/20 text-texto"
                      : "border-borde bg-superficie text-texto hover:border-borde-fuerte"
                  }`}
                >
                  <IconoTipo tipo={valor} />
                  {etiqueta}
                </button>
              ))}
            </div>
          </fieldset>

          <section aria-labelledby="titulo-donde">
            <h2 id="titulo-donde" className="mb-3 text-base font-bold">
              ¿Dónde está?
            </h2>
            <div className="mapa-ajustable relative h-64 overflow-hidden rounded-2xl border border-borde sm:h-80 lg:h-96">
              <Mapa ubicacion={ubicacion} onSeleccionar={(p) => setUbicacion({ lat: p.lat, lng: p.lng })} reportes={[]} />
              <button
                type="button"
                onClick={usarMiUbicacion}
                disabled={buscandoGps}
                className="absolute bottom-3 left-3 z-[500] inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-borde bg-superficie px-4 text-sm font-bold text-texto shadow-flotante hover:bg-superficie-3 disabled:opacity-60"
              >
                <LocateFixed className="size-5" aria-hidden="true" />
                {buscandoGps ? "Buscando..." : "Usar mi ubicación"}
              </button>
            </div>
            <p className="mt-2 text-sm text-texto-2" aria-live="polite">
              {ubicacion
                ? `Ubicación elegida: ${formatearCoordenadas(ubicacion.lat, ubicacion.lng)}`
                : "Toca el mapa para marcar el daño."}
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section aria-labelledby="titulo-foto">
            <h2 id="titulo-foto" className="mb-3 text-base font-bold">
              Foto del daño
            </h2>
            {foto ? (
              <div className="relative overflow-hidden rounded-2xl border border-borde">
                <img src={foto.url} alt="Vista previa de la foto del daño" className="max-h-72 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  className="absolute right-2.5 top-2.5 flex size-9 cursor-pointer items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                  aria-label="Quitar la foto"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex min-h-24 cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-borde-fuerte bg-superficie-2 p-4 transition hover:border-primario">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primario text-sobre-primario">
                  <Camera className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[15px] font-bold">Tomar o subir una foto</span>
                  <span className="block text-sm text-texto-2">Ayuda a identificar el daño más rápido</span>
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={elegirFoto}
                  className="sr-only"
                />
              </label>
            )}
            <p className="mt-2 text-xs text-texto-3">JPG, PNG o WebP. La foto se optimiza sola antes de subirla.</p>
            <p className="mt-2 flex items-start gap-2 text-xs leading-snug text-texto-3">
              <ShieldCheck className="mt-px size-4 shrink-0" aria-hidden="true" />
              Al subir la foto, asegúrate de no registrar rostros ni placas de vehículos. Tus datos
              están protegidos por la Ley 1581 de 2012.
            </p>
          </section>

          <section>
            <label htmlFor="descripcion" className="mb-3 block text-base font-bold">
              Cuéntanos más
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Por ejemplo: hueco profundo en el carril derecho, peligroso para motos"
              className={`${campo} h-auto resize-none py-3`}
            />
            <p className="mt-1 text-right text-xs text-texto-3">{descripcion.length}/500</p>
          </section>

          <div>
            <p role="alert" className={`mb-3 text-sm font-semibold text-peligro ${error ? "" : "hidden"}`}>
              {error}
            </p>
            <button type="submit" disabled={enviando} className={`${boton.primario} h-14 w-full text-base`}>
              {enviando ? "Enviando..." : "Enviar reporte"}
            </button>
          </div>
        </div>
      </form>

      <Modal titulo="Posible reporte duplicado" abierto={Boolean(duplicado)} onCerrar={() => setDuplicado(null)}>
        {duplicado && (
          <>
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primario text-sobre-primario">
                <Copy className="size-6" aria-hidden="true" />
              </span>
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight">Posible reporte duplicado</h2>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-texto-2">
              Este daño ya fue reportado a menos de {RADIO_DUPLICADO_M} metros de ti. ¿Quieres apoyarlo
              para darle más prioridad?
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-superficie-2 p-3.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-superficie">
                <IconoTipo tipo={duplicado.tipo} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {TIPOS[duplicado.tipo].etiqueta} · a {duplicado.distancia} m de ti
                </p>
                <p className="text-sm text-texto-2">
                  Ref. {duplicado.refCorta} · {duplicado.apoyos} apoyos
                </p>
              </div>
              <InsigniaEstado estado={duplicado.estado} />
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <button type="button" onClick={apoyarExistente} disabled={enviando} className={boton.primario}>
                Apoyar reporte existente
              </button>
              <button type="button" onClick={terminar} disabled={enviando} className={boton.secundario}>
                Es otro daño, continuar
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default NuevoReporte;
