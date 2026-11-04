import { Moon, Sun } from "lucide-react";
import { useTema } from "../../hooks/useTema.js";
import { boton } from "./estilos.js";

function BotonTema({ className = "" }) {
  const { oscuro, alternar } = useTema();

  return (
    <button
      type="button"
      onClick={alternar}
      className={`${boton.icono} ${className}`}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={oscuro ? "Modo claro" : "Modo oscuro"}
    >
      {oscuro ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

export default BotonTema;
