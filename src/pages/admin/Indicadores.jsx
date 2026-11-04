import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import AvisoEjemplo from "../../components/ui/AvisoEjemplo.jsx";
import InsigniaEstado from "../../components/ui/InsigniaEstado.jsx";
import { boton, campo, tarjeta } from "../../components/ui/estilos.js";
import { ESTADOS, TIPOS, formatearCoordenadas } from "../../data/catalogos.js";
import { COMUNAS, INDICADORES, PERIODOS, REPORTES } from "../../data/ejemplo.js";
import { descargarCsv } from "../../data/exportarCsv.js";

function Selector({ etiqueta, valor, onCambio, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-texto-2">{etiqueta}</span>
      <span className="relative block">
        <select value={valor} onChange={(e) => onCambio(e.target.value)} className={`${campo} h-11 appearance-none pr-10`}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
      </span>
    </label>
  );
}

function Indicador({ titulo, valor, detalle, color }) {
  return (
    <div className={`${tarjeta} p-5`}>
      <p className="text-sm text-texto-2">{titulo}</p>
      <p className={`mt-2 text-4xl font-extrabold tracking-tight ${color ?? ""}`}>{valor}</p>
      <p className="mt-1 text-xs text-texto-3">{detalle}</p>
    </div>
  );
}

function Indicadores() {
  const [comuna, setComuna] = useState("todas");
  const [periodo, setPeriodo] = useState(PERIODOS[1]);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const { total, resueltos, pendientes, diasPromedio, porTipo, porEstado } = INDICADORES;
  const maximo = Math.max(...porTipo.map((t) => t.total));
  const recientes = REPORTES.filter((r) => comuna === "todas" || r.comuna === comuna);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <AvisoEjemplo />
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Indicadores de mantenimiento</h1>
          <p className="mt-1.5 text-[15px] text-texto-2">Qué se reporta, qué se está atendiendo y qué ya se resolvió.</p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={menuAbierto}
            className={`${boton.primario} h-11 bg-texto! text-fondo! hover:opacity-90`}
          >
            <Download className="size-4" aria-hidden="true" />
            Exportar informe
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
          {menuAbierto && (
            <ul className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-borde bg-superficie py-1 shadow-flotante">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    descargarCsv(recientes);
                    setMenuAbierto(false);
                  }}
                  className="w-full cursor-pointer px-4 py-2.5 text-left text-sm font-semibold hover:bg-superficie-3"
                >
                  CSV (.csv)
                </button>
              </li>
              {["Excel (.xlsx)", "PDF"].map((formato) => (
                <li key={formato}>
                  <button type="button" disabled className="w-full px-4 py-2.5 text-left text-sm text-texto-3">
                    {formato} <span className="text-xs">· próximamente</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section aria-label="Filtros" className={`${tarjeta} mt-6 grid gap-4 p-4 sm:grid-cols-2 sm:p-5`}>
        <Selector etiqueta="Comuna / Corregimiento" valor={comuna} onCambio={setComuna}>
          <option value="todas">Todas</option>
          {COMUNAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Selector>
        <Selector etiqueta="Período" valor={periodo} onCambio={setPeriodo}>
          {PERIODOS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </Selector>
      </section>

      <section aria-label="Resumen" className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Indicador titulo="Reportes totales" valor={total} detalle="en el período seleccionado" />
        <Indicador titulo="Resueltos" valor={resueltos} color="text-exito" detalle={`${Math.round((resueltos / total) * 100)} % del total`} />
        <Indicador titulo="Pendientes" valor={pendientes} detalle="entre recibidos, en revisión y en reparación" />
        <Indicador titulo="Tiempo promedio de resolución" valor={`${diasPromedio} días`} detalle="desde que se recibe el reporte" />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={`${tarjeta} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold">Reportes por tipo de daño</h2>
          <ul className="mt-5 space-y-3.5">
            {porTipo.map(({ tipo, total: cantidad }, i) => (
              <li key={tipo} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="text-texto-2">{TIPOS[tipo].plural}</span>
                <span className="h-3 overflow-hidden rounded-full bg-superficie-3">
                  <span
                    className={`block h-full rounded-full ${i === 0 ? "bg-primario" : "bg-slate-700 dark:bg-slate-400"}`}
                    style={{ width: `${(cantidad / maximo) * 100}%` }}
                  />
                </span>
                <span className="text-right font-bold tabular-nums">{cantidad}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${tarjeta} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold">Estado de los reportes</h2>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full" role="img" aria-label="Distribución por estado">
            {porEstado.map(({ estado, total: cantidad }) => (
              <span
                key={estado}
                style={{ width: `${(cantidad / total) * 100}%`, background: `var(--est-${estado}-dot)` }}
              />
            ))}
          </div>
          <ul className="mt-5 space-y-3">
            {porEstado.map(({ estado, total: cantidad }) => (
              <li key={estado} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: `var(--est-${estado}-dot)` }} aria-hidden="true" />
                <span className="flex-1 text-texto-2">{ESTADOS[estado].etiqueta}</span>
                <span className="font-bold tabular-nums">{cantidad}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={`${tarjeta} mt-6 p-5 sm:p-6`}>
        <h2 className="text-lg font-extrabold">Reportes recientes</h2>

        {/* Escritorio: tabla */}
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-borde text-xs font-semibold text-texto-3">
                <th className="py-3 pr-4 font-semibold">Ref.</th>
                <th className="py-3 pr-4 font-semibold">Tipo</th>
                <th className="py-3 pr-4 font-semibold">Ubicación</th>
                <th className="py-3 pr-4 font-semibold">Estado</th>
                <th className="py-3 pr-4 font-semibold">Fecha</th>
                <th className="py-3 font-semibold">Responsable / Cuadrilla</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((r) => (
                <tr key={r.ref} className="border-b border-borde/60 last:border-0">
                  <td className="py-3.5 pr-4 font-bold">Ref. {r.ref}</td>
                  <td className="py-3.5 pr-4">{TIPOS[r.tipo].etiqueta}</td>
                  <td className="py-3.5 pr-4 text-texto-2">
                    Barrio {r.barrio} · {formatearCoordenadas(r.lat, r.lng)}
                  </td>
                  <td className="py-3.5 pr-4">
                    <InsigniaEstado estado={r.estado} />
                  </td>
                  <td className="py-3.5 pr-4 text-texto-2">{r.fecha}</td>
                  <td className="py-3.5 text-texto-2">{r.cuadrilla ?? "Sin asignar"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Celular: tarjetas */}
        <ul className="mt-4 space-y-3 md:hidden">
          {recientes.map((r) => (
            <li key={r.ref} className="rounded-xl border border-borde bg-superficie-2 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">
                  {TIPOS[r.tipo].etiqueta} · Barrio {r.barrio}
                </p>
                <InsigniaEstado estado={r.estado} />
              </div>
              <p className="mt-1 text-xs text-texto-2">
                Ref. {r.ref} · {r.fecha} · {r.cuadrilla ?? "Sin asignar"}
              </p>
            </li>
          ))}
        </ul>
        {recientes.length === 0 && <p className="mt-4 text-sm text-texto-2">No hay reportes en esa comuna.</p>}
      </section>
    </div>
  );
}

export default Indicadores;
