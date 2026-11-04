import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import BotonTema from "./BotonTema.jsx";
import { boton } from "./estilos.js";

// Encabezado de las pantallas internas: flecha para volver + título.
// En escritorio el tema se cambia desde la barra superior, por eso se oculta aquí.
function EncabezadoPantalla({ titulo, volverA, derecha }) {
  const navegar = useNavigate();

  return (
    <header className="flex h-16 items-center gap-3">
      <button
        type="button"
        onClick={() => (volverA ? navegar(volverA) : navegar(-1))}
        className={boton.icono}
        aria-label="Volver"
      >
        <ArrowLeft className="size-5" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-xl font-extrabold tracking-tight">
        {titulo}
      </h1>
      {derecha}
      <BotonTema className="md:hidden" />
    </header>
  );
}

export default EncabezadoPantalla;
