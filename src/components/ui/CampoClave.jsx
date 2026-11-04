import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { campo } from "./estilos.js";

// Campo de contraseña con botón para mostrar/ocultar.
function CampoClave({ etiqueta = "Contraseña", ayuda, accion, className = "", ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-texto">
          {etiqueta}
        </label>
        {accion}
      </div>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`${campo} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1.5 top-1.5 flex size-9 cursor-pointer items-center justify-center rounded-lg text-texto-3 hover:bg-superficie-3 hover:text-texto"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {ayuda && <p className="mt-1.5 text-xs text-texto-3">{ayuda}</p>}
    </div>
  );
}

export default CampoClave;
