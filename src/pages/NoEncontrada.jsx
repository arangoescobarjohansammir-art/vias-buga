import { Link } from "react-router";
import Logo from "../components/ui/Logo.jsx";
import { boton } from "../components/ui/estilos.js";

function NoEncontrada() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-fondo px-6 text-center text-texto">
      <Logo />
      <p className="text-6xl font-extrabold tracking-tight text-primario">404</p>
      <p className="text-lg font-bold">No encontramos esta página</p>
      <Link to="/" className={boton.primario}>
        Ir al inicio
      </Link>
    </div>
  );
}

export default NoEncontrada;
