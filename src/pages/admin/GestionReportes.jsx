import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronDown, Download, Plus, Search, UserPlus } from "lucide-react";
import Cargando from "../../components/ui/Cargando.jsx";
import ErrorCarga from "../../components/ui/ErrorCarga.jsx";
import InsigniaEstado from "../../components/ui/InsigniaEstado.jsx";
import IconoTipo from "../../components/ui/IconoTipo.jsx";
import { boton, campo, tarjeta } from "../../components/ui/estilos.js";
import { ESTADOS, TIPOS } from "../../data/catalogos.js";
import { descargarCsv } from "../../data/exportarCsv.js";
import { useConsulta } from "../../hooks/useConsulta.js";
import { mensajeError } from "../../servicios/errores.js";
import {
  asignarCuadrilla,
  cambiarEstadoLote,
  crearCuadrilla,
  etiquetaUbicacion,
  listarCuadrillas,
  listarReportes,
  listarZonas,
} from "../../servicios/reportes.js";

const LIMITE = 1000;

const normalizar = (t) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function Filtro({ etiqueta, valor, onCambio, opciones, todas }) {
  return (
    <label className="relative block">
      <span className="sr-only">{etiqueta}</span>
      <select value={valor} onChange={(e) => onCambio(e.target.value)} className={`${campo} h-11 appearance-none pr-9 text-sm font-semibold`}>
        <option value="todos">{todas}</option>
        {opciones.map(([v, e]) => (
          <option key={v} value={v}>
            {e}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
    </label>
  );
}

function GestionReportes() {
  const { datos, error, cargando, recargar } = useConsulta(() => listarReportes({ limite: LIMITE }), ["admin-reportes"]);
  const { datos: cuadrillasDatos, recargar: recargarCuadrillas } = useConsulta(() => listarCuadrillas(), ["cuadrillas"]);
  const { datos: zonasDatos } = useConsulta(() => listarZonas().catch(() => []), ["zonas"]);
  const reportes = useMemo(() => datos ?? [], [datos]);
  const cuadrillas = cuadrillasDatos ?? [];
  const zonas = zonasDatos ?? [];

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [comuna, setComuna] = useState("todos");
  const [cuadrilla, setCuadrilla] = useState("todos");
  const [seleccion, setSeleccion] = useState([]);
  const [cuadrillaLote, setCuadrillaLote] = useState("");
  const [estadoLote, setEstadoLote] = useState("en_revision");
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [nuevaCuadrilla, setNuevaCuadrilla] = useState(null); // null = cerrado, texto = abierto

  const cuadrillaElegida = cuadrillaLote || String(cuadrillas[0]?.id ?? "");

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.replace("#", "").trim());
    return reportes.filter((r) => {
      const texto = normalizar(`${r.ref} ${TIPOS[r.tipo].etiqueta} ${r.barrio ?? ""} ${r.comuna ?? ""}`);
      return (
        (q === "" || texto.includes(q)) &&
        (tipo === "todos" || r.tipo === tipo) &&
        (estado === "todos" || r.estado === estado) &&
        (comuna === "todos" || r.comuna === comuna) &&
        (cuadrilla === "todos" || (cuadrilla === "sin" ? !r.cuadrilla : r.cuadrilla === cuadrilla))
      );
    });
  }, [reportes, busqueda, tipo, estado, comuna, cuadrilla]);

  const hayFiltros = busqueda || tipo !== "todos" || estado !== "todos" || comuna !== "todos" || cuadrilla !== "todos";
  const limpiar = () => {
    setBusqueda("");
    setTipo("todos");
    setEstado("todos");
    setComuna("todos");
    setCuadrilla("todos");
  };

  const todosMarcados = visibles.length > 0 && visibles.every((r) => seleccion.includes(r.ref));
  const alternarTodos = () => setSeleccion(todosMarcados ? [] : visibles.map((r) => r.ref));
  const alternar = (ref) =>
    setSeleccion((s) => (s.includes(ref) ? s.filter((x) => x !== ref) : [...s, ref]));

  // Ejecuta una operación en lote sobre los reportes marcados y recarga la lista.
  const aplicarLote = async (operacion, textoOk) => {
    setTrabajando(true);
    setMensaje({ tipo: "", texto: "" });
    try {
      await operacion(seleccion);
      setMensaje({ tipo: "ok", texto: textoOk(seleccion.length) });
      setSeleccion([]);
      recargar();
    } catch (e) {
      setMensaje({ tipo: "error", texto: mensajeError(e, "No pudimos aplicar el cambio. Inténtalo de nuevo.") });
    } finally {
      setTrabajando(false);
    }
  };

  const guardarCuadrilla = async (e) => {
    e.preventDefault();
    if (!nuevaCuadrilla?.trim()) return;
    try {
      await crearCuadrilla(nuevaCuadrilla);
      setNuevaCuadrilla(null);
      setMensaje({ tipo: "ok", texto: "Cuadrilla creada." });
      recargarCuadrillas();
    } catch (err) {
      setMensaje({ tipo: "error", texto: mensajeError(err, "No pudimos crear la cuadrilla.") });
    }
  };

  const sinAsignar = reportes.filter((r) => !r.cuadrilla && r.estado !== "resuelto").length;
  const ahora = new Date();
  const resueltosMes = reportes.filter((r) => {
    if (!r.resueltoIso) return false;
    const f = new Date(r.resueltoIso);
    return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
  }).length;
  const conDias = reportes.filter((r) => r.diasParaResolver !== null);
  const promedioDias = conDias.length
    ? (conDias.reduce((suma, r) => suma + r.diasParaResolver, 0) / conDias.length).toFixed(1)
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-texto-3">Panel de administración</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Gestión de reportes</h1>
          <p className="mt-1.5 text-[15px] text-texto-2">Consulta, clasifica y gestiona los daños viales reportados por la ciudadanía.</p>
        </div>
        <button type="button" onClick={() => descargarCsv(visibles)} disabled={visibles.length === 0} className={`${boton.secundario} h-11`}>
          <Download className="size-4" aria-hidden="true" />
          Exportar listado (CSV)
        </button>
      </div>

      {mensaje.texto && (
        <p
          role={mensaje.tipo === "error" ? "alert" : "status"}
          className={`mt-4 rounded-xl p-3 text-sm font-semibold ${
            mensaje.tipo === "error" ? "bg-peligro-suave text-peligro" : "bg-exito/15 text-exito"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <section aria-label="Filtros" className={`${tarjeta} mt-6 p-4 sm:p-5`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          <label className="relative block sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-texto-3" aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por barrio o tipo de daño"
              className={`${campo} h-11 pl-10 text-sm`}
            />
          </label>
          <Filtro etiqueta="Categoría" valor={tipo} onCambio={setTipo} todas="Todas las categorías" opciones={Object.entries(TIPOS).map(([k, v]) => [k, v.etiqueta])} />
          <Filtro etiqueta="Estado" valor={estado} onCambio={setEstado} todas="Todos los estados" opciones={Object.entries(ESTADOS).map(([k, v]) => [k, v.etiqueta])} />
          <Filtro etiqueta="Comuna" valor={comuna} onCambio={setComuna} todas="Todas las comunas" opciones={zonas.map((z) => [z.nombre, z.nombre])} />
          <Filtro etiqueta="Cuadrilla" valor={cuadrilla} onCambio={setCuadrilla} todas="Todas las cuadrillas" opciones={[["sin", "Sin asignar"], ...cuadrillas.map((c) => [c.nombre, c.nombre])]} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-texto-2">
          <p>
            Mostrando <strong className="text-texto">{visibles.length}</strong> de {reportes.length} reportes{reportes.length >= LIMITE ? " (los más recientes)" : ""}
          </p>
          {hayFiltros && (
            <button type="button" onClick={limpiar} className="cursor-pointer font-semibold text-acento hover:underline">
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      <section aria-label="Acciones en lote" className={`${tarjeta} mt-4 flex flex-wrap items-center gap-3 p-3.5 sm:px-5`}>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input type="checkbox" checked={todosMarcados} onChange={alternarTodos} className="size-5 cursor-pointer accent-primario" />
          Seleccionar todos
          <span className="font-normal text-texto-3">({seleccion.length} seleccionados)</span>
        </label>

        {seleccion.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
            <span className="flex items-center gap-2">
              <select aria-label="Cuadrilla para asignar" value={cuadrillaElegida} onChange={(e) => setCuadrillaLote(e.target.value)} className={`${campo} h-9 w-auto text-sm`}>
                {cuadrillas.length === 0 && <option value="">Sin cuadrillas</option>}
                {cuadrillas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={trabajando || !cuadrillaElegida}
                onClick={() =>
                  aplicarLote((ids) => asignarCuadrilla(ids, Number(cuadrillaElegida)), (n) => `${n} reporte(s) asignados.`)
                }
                className={boton.chico}
              >
                <UserPlus className="size-4" aria-hidden="true" />
                Asignar en lote
              </button>
            </span>
            <span className="flex items-center gap-2">
              <select aria-label="Estado para aplicar" value={estadoLote} onChange={(e) => setEstadoLote(e.target.value)} className={`${campo} h-9 w-auto text-sm`}>
                {Object.entries(ESTADOS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.etiqueta}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={trabajando}
                onClick={() =>
                  aplicarLote((ids) => cambiarEstadoLote(ids, estadoLote, null), (n) => `Estado actualizado en ${n} reporte(s).`)
                }
                className={boton.chico}
              >
                Cambiar estado en lote
              </button>
            </span>
          </div>
        )}
      </section>

      <div className="mt-3">
        {nuevaCuadrilla === null ? (
          <button type="button" onClick={() => setNuevaCuadrilla("")} className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-acento hover:underline">
            <Plus className="size-4" aria-hidden="true" />
            Nueva cuadrilla
          </button>
        ) : (
          <form onSubmit={guardarCuadrilla} className="flex flex-wrap items-center gap-2">
            <input
              value={nuevaCuadrilla}
              onChange={(e) => setNuevaCuadrilla(e.target.value)}
              placeholder="Nombre de la cuadrilla"
              aria-label="Nombre de la nueva cuadrilla"
              maxLength={80}
              className={`${campo} h-9 w-64 text-sm`}
              autoFocus
            />
            <button type="submit" className={boton.chicoPrimario}>Crear</button>
            <button type="button" onClick={() => setNuevaCuadrilla(null)} className={boton.chico}>Cancelar</button>
          </form>
        )}
      </div>

      {error ? (
        <ErrorCarga className="mt-4" error={error} onReintentar={recargar} />
      ) : cargando && !datos ? (
        <Cargando texto="Cargando reportes" />
      ) : (
        <>
      {/* Escritorio: tabla */}
      <div className={`${tarjeta} mt-4 hidden overflow-x-auto md:block`}>
        <table className="w-full min-w-[58rem] text-left text-sm">
          <thead>
            <tr className="border-b border-borde text-xs font-bold uppercase tracking-wider text-texto-3">
              <th className="w-12 py-3.5 pl-5" />
              <th className="py-3.5 pr-4">Ref.</th>
              <th className="py-3.5 pr-4">Tipo de daño</th>
              <th className="py-3.5 pr-4">Ubicación</th>
              <th className="py-3.5 pr-4">Fecha</th>
              <th className="py-3.5 pr-4">Estado</th>
              <th className="py-3.5 pr-4">Responsable / Cuadrilla</th>
              <th className="py-3.5 pr-4">Última act.</th>
              <th className="py-3.5 pr-5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((r) => (
              <tr key={r.ref} className="border-b border-borde/60 last:border-0 hover:bg-superficie-2">
                <td className="py-4 pl-5">
                  <input type="checkbox" checked={seleccion.includes(r.ref)} onChange={() => alternar(r.ref)} aria-label={`Seleccionar reporte ${r.refCorta}`} className="size-5 cursor-pointer accent-primario" />
                </td>
                <td className="py-4 pr-4 font-bold">Ref. {r.refCorta}</td>
                <td className="py-4 pr-4">
                  <span className="flex items-center gap-2.5">
                    <IconoTipo tipo={r.tipo} className="size-5 text-texto-2" />
                    {TIPOS[r.tipo].etiqueta}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  {etiquetaUbicacion(r)}
                  <span className="block text-xs text-texto-3">{r.comuna ?? "Sin comuna asignada"}</span>
                </td>
                <td className="py-4 pr-4">
                  {r.fecha}
                  <span className="block text-xs text-texto-3">{r.hace}</span>
                </td>
                <td className="py-4 pr-4">
                  <InsigniaEstado estado={r.estado} />
                </td>
                <td className="py-4 pr-4">{r.cuadrilla ?? <span className="text-texto-3">Sin asignar</span>}</td>
                <td className="py-4 pr-4 text-texto-2">{r.actualizado}</td>
                <td className="py-4 pr-5 text-right">
                  <Link to={`/admin/reporte/${r.ref}`} className={boton.chico}>
                    {r.estado === "resuelto" ? "Ver resolución" : "Gestionar"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular: tarjetas */}
      <ul className="mt-4 space-y-3 md:hidden">
        {visibles.map((r) => (
          <li key={r.ref} className={`${tarjeta} p-4`}>
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={seleccion.includes(r.ref)} onChange={() => alternar(r.ref)} aria-label={`Seleccionar reporte ${r.refCorta}`} className="mt-1 size-5 cursor-pointer accent-primario" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold">
                    {TIPOS[r.tipo].etiqueta} · {etiquetaUbicacion(r)}
                  </p>
                  <InsigniaEstado estado={r.estado} />
                </div>
                <p className="mt-1 text-xs text-texto-2">
                  Ref. {r.refCorta}{r.comuna ? ` · ${r.comuna}` : ""} · {r.fecha}
                </p>
                <p className="mt-1 text-xs text-texto-2">{r.cuadrilla ?? "Sin asignar"} · {r.actualizado}</p>
                <Link to={`/admin/reporte/${r.ref}`} className={`${boton.chico} mt-3`}>
                  {r.estado === "resuelto" ? "Ver resolución" : "Gestionar"}
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {visibles.length === 0 && (
        <p className="mt-4 rounded-2xl border border-dashed border-borde-fuerte p-8 text-center text-sm text-texto-2">
          {reportes.length ? "No hay reportes con esos filtros." : "Todavía no hay reportes."}
        </p>
      )}
        </>
      )}

      <section aria-label="Resumen operativo" className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Pendientes de asignación", `${sinAsignar} ${sinAsignar === 1 ? "caso" : "casos"}`],
          ["Cuadrillas operativas", `${cuadrillas.length} ${cuadrillas.length === 1 ? "activa" : "activas"}`],
          ["Tiempo prom. de resolución", promedioDias ? `${promedioDias} días` : "—"],
          ["Resueltos este mes", `${resueltosMes} ${resueltosMes === 1 ? "reporte" : "reportes"}`],
        ].map(([titulo, valor]) => (
          <div key={titulo} className={`${tarjeta} p-4`}>
            <p className="text-xs text-texto-2">{titulo}</p>
            <p className="mt-1 text-xl font-extrabold">{valor}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default GestionReportes;
