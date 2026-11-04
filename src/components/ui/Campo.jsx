import { useId } from "react";
import { campo } from "./estilos.js";

// Etiqueta + input con el estilo común. Recibe las props normales de <input>.
function Campo({ etiqueta, ayuda, accion, className = "", ...props }) {
  const id = useId();

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-texto">
          {etiqueta}
        </label>
        {accion}
      </div>
      <input id={id} className={campo} {...props} />
      {ayuda && <p className="mt-1.5 text-xs text-texto-3">{ayuda}</p>}
    </div>
  );
}

export default Campo;
