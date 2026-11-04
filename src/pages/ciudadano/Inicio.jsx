import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, Search } from "lucide-react";
import Logo from "../../components/ui/Logo.jsx";
import BotonTema from "../../components/ui/BotonTema.jsx";
import AvisoEjemplo from "../../components/ui/AvisoEjemplo.jsx";
import FiltrosReportes from "../../components/ui/FiltrosReportes.jsx";
import TarjetaReporte from "../../components/ui/TarjetaReporte.jsx";
import MapaEstados from "../../components/mapa/MapaEstados.jsx";
import { boton } from "../../components/ui/estilos.js";
import { REPORTES } from "../../data/ejemplo.js";

function Inicio() {
  const [tipo, setTipo] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [seleccionado, setSeleccionado] = useState(null);

  const visibles = useMemo(
    () =>
      REPORTES.filter(
        (r) => (tipo === "todos" || r.tipo === tipo) && (estado === "todos" || r.estado === estado),
      ),
    [tipo, estado],
  );

  return (
    <div className="grid grid-cols-1 md:h-[calc(100dvh-4rem)] md:grid-cols-[26rem_1fr] md:grid-rows-[auto_1fr]">
      {/* Solo celular: logo, buscar y tema */}
      <header className="flex h-16 items-center gap-3 px-4 md:hidden">
        <Logo />
        <span className="ml-auto" />
        <Link to="/app/mapa" className={boton.icono} aria-label="Buscar reportes">
          <Search className="size-5" />
        </Link>
        <BotonTema />
      </header>

      <div className="md:col-start-1 md:row-start-1 md:border-r md:border-borde md:p-4">
        <FiltrosReportes tipo={tipo} estado={estado} onTipo={setTipo} onEstado={setEstado} />
      </div>

      <div className="relative z-0 h-[42dvh] min-h-64 md:col-start-2 md:row-span-2 md:row-start-1 md:h-auto">
        <MapaEstados reportes={visibles} seleccionado={seleccionado} onSeleccionar={setSeleccionado} />
      </div>

      <section
        aria-labelledby="titulo-cerca"
        className="relative z-10 -mt-5 rounded-t-3xl border-t border-borde bg-fondo px-4 pb-28 pt-5 md:col-start-1 md:row-start-2 md:mt-0 md:min-h-0 md:overflow-y-auto md:rounded-none md:border-r md:border-t-0 md:pb-6"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-borde-fuerte md:hidden" aria-hidden="true" />
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="titulo-cerca" className="text-lg font-extrabold">
            Reportes cerca de ti
          </h2>
          <Link to="/app/mapa?vista=lista" className="text-sm font-bold text-acento hover:underline">
            Ver todos
          </Link>
        </div>
        <AvisoEjemplo className="mb-3" />

        {visibles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-borde-fuerte p-6 text-center text-sm text-texto-2">
            No hay reportes con esos filtros.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {visibles.map((reporte) => (
              <li key={reporte.ref}>
                <TarjetaReporte reporte={reporte} destacado={reporte.ref === seleccionado} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Botón principal: flota sobre la lista en celular */}
      <Link
        to="/app/reportar"
        className={`${boton.primario} fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 h-14 text-base shadow-flotante md:hidden`}
      >
        <Plus className="size-5" aria-hidden="true" />
        Reportar un daño
      </Link>
    </div>
  );
}

export default Inicio;
