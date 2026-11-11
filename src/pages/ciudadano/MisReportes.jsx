import { useState } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import TarjetaReporte from "../../components/ui/TarjetaReporte.jsx";
import Cargando from "../../components/ui/Cargando.jsx";
import SinSesion from "../../components/ui/SinSesion.jsx";
import ErrorCarga from "../../components/ui/ErrorCarga.jsx";
import BotonTema from "../../components/ui/BotonTema.jsx";
import { boton } from "../../components/ui/estilos.js";
import { ESTADOS } from "../../data/catalogos.js";
import { useAuth } from "../../contexto/auth.js";
import { useConsulta } from "../../hooks/useConsulta.js";
import { avisosSinLeer, misApoyados, misReportes } from "../../servicios/reportes.js";

function ListaMisReportes({ uid }) {
  const [pestana, setPestana] = useState("creados");
  const { datos, error, cargando, recargar } = useConsulta(async () => {
    const [creados, apoyados, avisos] = await Promise.all([misReportes(uid), misApoyados(uid), avisosSinLeer(uid)]);
    return { creados, apoyados, avisos };
  }, [uid]);

  if (error) return <ErrorCarga className="mt-6" error={error} onReintentar={recargar} />;
  if (cargando && !datos) return <Cargando texto="Cargando tus reportes" />;

  const reportes = pestana === "creados" ? datos.creados : datos.apoyados;
  const pestanas = [
    ["creados", `Creados · ${datos.creados.length}`],
    ["apoyados", `Apoyados · ${datos.apoyados.length}`],
  ];

  return (
    <>
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

      <p className="mt-4 text-sm text-texto-2">Te avisaremos cuando cambie el estado de tus reportes.</p>

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
                  pestana === "creados" && datos.avisos.has(reporte.ref)
                    ? `¡Tu reporte pasó a '${ESTADOS[reporte.estado].etiqueta}'!`
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function MisReportes() {
  const { cargando, uid } = useAuth();

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

      {cargando ? <Cargando /> : uid ? <ListaMisReportes key={uid} uid={uid} /> : <SinSesion siguiente="/app/mis-reportes" texto="Inicia sesión o continúa como anónimo para ver los reportes que creas y apoyas." />}
    </div>
  );
}

export default MisReportes;
