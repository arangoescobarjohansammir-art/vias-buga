import { useState } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import TarjetaReporte from "../../components/ui/TarjetaReporte.jsx";
import AvisoEjemplo from "../../components/ui/AvisoEjemplo.jsx";
import BotonTema from "../../components/ui/BotonTema.jsx";
import { boton } from "../../components/ui/estilos.js";
import { ESTADOS } from "../../data/catalogos.js";
import { MIS_APOYADOS, MIS_CREADOS, buscarReporte } from "../../data/ejemplo.js";

// Reportes con un cambio de estado que la persona aún no ha visto.
const SIN_LEER = { "3f9a1c": "en_reparacion" };

function MisReportes() {
  const [pestana, setPestana] = useState("creados");

  const refs = pestana === "creados" ? MIS_CREADOS : MIS_APOYADOS;
  const reportes = refs.map(buscarReporte).filter(Boolean);

  const pestanas = [
    ["creados", `Creados · ${MIS_CREADOS.length}`],
    ["apoyados", `Apoyados · ${MIS_APOYADOS.length}`],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 pt-4 md:px-6 md:pt-8">
      <header className="flex h-12 items-center gap-3">
        <h1 className="flex-1 text-3xl font-extrabold tracking-tight">Mis reportes</h1>
        <BotonTema className="md:hidden" />
        <div className="hidden md:block">
          <Link to="/app/reportar" className={boton.chicoPrimario}>
            <Plus className="size-4" aria-hidden="true" />
            Reportar un daño
          </Link>
        </div>
      </header>

      <div role="tablist" aria-label="Mis reportes" className="mt-4 grid grid-cols-2 rounded-2xl bg-superficie-3 p-1.5">
        {pestanas.map(([valor, etiqueta]) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={pestana === valor}
            onClick={() => setPestana(valor)}
            className={`h-11 cursor-pointer rounded-xl text-[15px] font-bold transition ${
              pestana === valor ? "bg-texto text-fondo shadow-sm" : "text-texto-2 hover:text-texto"
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-texto-2">
        Te avisaremos cuando cambie el estado de tus reportes.
      </p>
      <AvisoEjemplo className="mt-2" />

      {reportes.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-borde-fuerte p-8 text-center text-sm text-texto-2">
          Aún no tienes reportes en esta lista.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {reportes.map((reporte) => (
            <li key={reporte.ref}>
              <TarjetaReporte
                reporte={reporte}
                aviso={
                  pestana === "creados" && SIN_LEER[reporte.ref]
                    ? `¡Tu reporte pasó a '${ESTADOS[SIN_LEER[reporte.ref]].etiqueta}'!`
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MisReportes;
