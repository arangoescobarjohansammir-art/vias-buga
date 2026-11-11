import { RefreshCw } from "lucide-react";
import { mensajeError } from "../../servicios/errores.js";
import { boton } from "./estilos.js";

// Mensaje de error con botón para reintentar.
function ErrorCarga({ error, onReintentar, className = "" }) {
  return (
    <div role="alert" className={`rounded-2xl border border-peligro/50 bg-peligro-suave p-6 text-center ${className}`}>
      <p className="font-bold text-peligro">No pudimos cargar la información</p>
      <p className="mt-1 text-sm text-texto-2">{mensajeError(error, "Inténtalo de nuevo en un momento.")}</p>
      {onReintentar && (
        <button type="button" onClick={onReintentar} className={`${boton.secundario} mt-4`}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Reintentar
        </button>
      )}
    </div>
  );
}

export default ErrorCarga;
