import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import BotonTema from "../ui/BotonTema.jsx";
import { boton } from "../ui/estilos.js";

// Marco común de Registro e Iniciar sesión: tarjeta centrada en escritorio,
// pantalla completa en celular.
function PantallaAcceso({ titulo, descripcion, children }) {
  return (
    <div className="fondo-resplandor flex min-h-dvh flex-col bg-fondo text-texto">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className={boton.icono} aria-label="Volver a la bienvenida">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="ml-1 hidden sm:block">
          <Logo />
        </div>
        <BotonTema className="ml-auto" />
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-10 pt-4 sm:items-center sm:px-6">
        <div className="w-full max-w-md sm:rounded-3xl sm:border sm:border-borde sm:bg-superficie sm:p-8 sm:shadow-flotante">
          <h1 className="text-3xl font-extrabold tracking-tight">{titulo}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-texto-2">{descripcion}</p>
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default PantallaAcceso;
