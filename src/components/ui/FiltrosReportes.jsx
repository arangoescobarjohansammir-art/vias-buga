import { ChevronDown } from "lucide-react";
import { ESTADOS, TIPOS } from "../../data/catalogos.js";
import { chip } from "./estilos.js";

// Chips por tipo de daño + lista desplegable de estado.
// Los valores "todos" significan "sin filtro".
function FiltrosReportes({ tipo, estado, onTipo, onEstado, conteos }) {
  const opciones = [["todos", "Todos"], ...Object.entries(TIPOS).map(([k, v]) => [k, v.plural])];

  return (
    <div className="sin-barra flex gap-2 overflow-x-auto px-4 py-3 md:px-0 md:py-0">
      {opciones.map(([valor, etiqueta]) => (
        <button
          key={valor}
          type="button"
          onClick={() => onTipo(valor)}
          aria-pressed={tipo === valor}
          className={chip(tipo === valor)}
        >
          {etiqueta}
          {conteos && <span className="text-xs opacity-70">({conteos[valor] ?? 0})</span>}
        </button>
      ))}
      <label className="relative shrink-0">
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={estado}
          onChange={(e) => onEstado(e.target.value)}
          className={`${chip(estado !== "todos")} appearance-none pr-9`}
        >
          <option value="todos">Estado</option>
          {Object.entries(ESTADOS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.etiqueta}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2"
        />
      </label>
    </div>
  );
}

export default FiltrosReportes;
