import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronDown, List, Map as IconoMapa, Search, ThumbsUp, X } from "lucide-react";
import FiltrosReportes from "../../components/ui/FiltrosReportes.jsx";
import TarjetaReporte from "../../components/ui/TarjetaReporte.jsx";
import InsigniaEstado from "../../components/ui/InsigniaEstado.jsx";
import IconoTipo from "../../components/ui/IconoTipo.jsx";
import Cargando from "../../components/ui/Cargando.jsx";
import ErrorCarga from "../../components/ui/ErrorCarga.jsx";
import BotonTema from "../../components/ui/BotonTema.jsx";
import MapaEstados from "../../components/mapa/MapaEstados.jsx";
import { campo, boton } from "../../components/ui/estilos.js";
import { ESTADOS, ORDEN_ESTADOS, TIPOS } from "../../data/catalogos.js";
import { useConsulta } from "../../hooks/useConsulta.js";
import { etiquetaUbicacion, listarReportes, listarZonas } from "../../servicios/reportes.js";

// Quita tildes y mayúsculas para que "señal" encuentre "Señalización".
const normalizar = (texto) =>
  texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function Leyenda() {
  return (
    <div className="absolute bottom-3 left-3 z-[500] rounded-xl border border-borde bg-superficie/95 p-3 text-xs shadow-flotante backdrop-blur">
      <p className="mb-1.5 font-bold uppercase tracking-wider text-texto-3">Convenciones</p>
      <ul className="space-y-1">
        {ORDEN_ESTADOS.map((estado) => (
          <li key={estado} className="flex items-center gap-2 font-medium text-texto">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full"
              style={{ background: `var(--est-${estado}-dot)` }}
            />
            {ESTADOS[estado].etiqueta}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResumenSeleccionado({ reporte, onCerrar }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-borde bg-superficie p-4 shadow-flotante">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-superficie-3">
        <IconoTipo tipo={reporte.tipo} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-texto-3">
          Reporte Ref. {reporte.refCorta}
        </p>
        <p className="font-bold">
          {TIPOS[reporte.tipo].etiqueta} · {etiquetaUbicacion(reporte)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <InsigniaEstado estado={reporte.estado} conPunto />
          <span className="inline-flex items-center gap-1 text-sm text-texto-2">
            <ThumbsUp className="size-4" aria-hidden="true" />
            {reporte.apoyos} apoyos
          </span>
          <Link to={`/app/reporte/${reporte.ref}`} className="text-sm font-bold text-acento hover:underline">
            Ver reporte
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={onCerrar}
        className="flex size-8 cursor-pointer items-center justify-center rounded-full text-texto-3 hover:bg-superficie-3"
        aria-label="Cerrar resumen"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function MapaReportes() {
  const [parametros, setParametros] = useSearchParams();
  const vista = parametros.get("vista") === "lista" ? "lista" : "mapa";

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [comuna, setComuna] = useState("todas");
  const [seleccionado, setSeleccionado] = useState(null);

  const { datos, error, cargando, recargar } = useConsulta(() => listarReportes({ limite: 500 }), ["mapa"]);
  const { datos: zonas } = useConsulta(() => listarZonas().catch(() => []), ["zonas"]);
  const reportes = useMemo(() => datos ?? [], [datos]);

  // Filtros que no dependen del tipo (sirven para contar en cada chip).
  const baseFiltrada = useMemo(() => {
    const q = normalizar(busqueda.replace("#", "").trim());
    return reportes.filter((r) => {
      const texto = normalizar(`${TIPOS[r.tipo].etiqueta} ${r.barrio ?? ""} ${r.comuna ?? ""} ${r.ref}`);
      return (
        (q === "" || texto.includes(q)) &&
        (estado === "todos" || r.estado === estado) &&
        (comuna === "todas" || r.comuna === comuna)
      );
    });
  }, [reportes, busqueda, estado, comuna]);

  const conteos = useMemo(() => {
    const c = { todos: baseFiltrada.length };
    baseFiltrada.forEach((r) => {
      c[r.tipo] = (c[r.tipo] ?? 0) + 1;
    });
    return c;
  }, [baseFiltrada]);

  const visibles = baseFiltrada.filter((r) => tipo === "todos" || r.tipo === tipo);
  const reporteSeleccionado = visibles.find((r) => r.ref === seleccionado);

  const cambiarVista = (nueva) => setParametros(nueva === "lista" ? { vista: "lista" } : {});

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-4 md:px-6">
      <header className="flex items-center gap-3">
        <h1 className="flex-1 text-2xl font-extrabold tracking-tight">Mapa de reportes</h1>
        <div role="group" aria-label="Tipo de vista" className="flex rounded-full border border-borde bg-superficie p-1">
          {[
            ["mapa", "Mapa", IconoMapa],
            ["lista", "Lista", List],
          ].map(([valor, etiqueta, Icono]) => (
            <button
              key={valor}
              type="button"
              onClick={() => cambiarVista(valor)}
              aria-pressed={vista === valor}
              className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition ${
                vista === valor ? "bg-texto text-fondo" : "text-texto-2 hover:text-texto"
              }`}
            >
              <Icono className="size-4" aria-hidden="true" />
              {etiqueta}
            </button>
          ))}
        </div>
        <BotonTema className="md:hidden" />
      </header>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Buscar reportes</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-texto-3" aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por barrio o tipo de daño"
            className={`${campo} pl-12`}
          />
        </label>
        {(zonas ?? []).length > 0 && (
        <label className="relative block md:w-56">
          <span className="sr-only">Comuna o corregimiento</span>
          <select
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            className={`${campo} appearance-none pr-10 font-semibold`}
          >
            <option value="todas">Todas las comunas</option>
            {(zonas ?? []).map((z) => (
              <option key={z.id} value={z.nombre}>
                {z.nombre}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
        </label>
        )}
      </div>

      <div className="-mx-4 mt-1 md:mx-0 md:mt-3">
        <FiltrosReportes tipo={tipo} estado={estado} onTipo={setTipo} onEstado={setEstado} conteos={conteos} />
      </div>

      {error ? (
        <ErrorCarga className="mt-4" error={error} onReintentar={recargar} />
      ) : cargando && !datos ? (
        <Cargando texto="Cargando reportes" />
      ) : visibles.length === 0 && vista === "lista" ? (
        <p className="mt-4 rounded-2xl border border-dashed border-borde-fuerte p-8 text-center text-sm text-texto-2">
          {reportes.length ? "No encontramos reportes con esos filtros." : "Aún no hay reportes en el mapa."}
        </p>
      ) : vista === "mapa" ? (
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_22rem]">
          <div className="relative h-[55dvh] min-h-80 overflow-hidden rounded-2xl border border-borde lg:h-[34rem]">
            <MapaEstados reportes={visibles} seleccionado={seleccionado} onSeleccionar={setSeleccionado} conUbicacion />
            <Leyenda />
          </div>
          <div className="flex flex-col gap-3">
            {reporteSeleccionado && (
              <ResumenSeleccionado reporte={reporteSeleccionado} onCerrar={() => setSeleccionado(null)} />
            )}
            <ul className="hidden flex-col gap-3 lg:flex lg:max-h-[26rem] lg:overflow-y-auto lg:pr-1">
              {visibles.map((r) => (
                <li key={r.ref}>
                  <TarjetaReporte reporte={r} destacado={r.ref === seleccionado} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibles.map((r) => (
            <li key={r.ref}>
              <TarjetaReporte reporte={r} />
            </li>
          ))}
        </ul>
      )}

      <Link to="/app/reportar" className={`${boton.primario} mt-6 w-full md:hidden`}>
        Reportar un daño
      </Link>
    </div>
  );
}

export default MapaReportes;
