import { Link } from "react-router";
import { ArrowLeft, Lock } from "lucide-react";
import { boton } from "../../components/ui/estilos.js";

// Se mostrará a quien intente entrar a /admin sin tener rol de administrador.
function AccesoRestringido() {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-3xl border border-borde bg-superficie p-8 text-center shadow-flotante sm:mt-20">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-superficie-3">
        <Lock className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Acceso restringido</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-texto-2">
        Esta sección es solo para administradores de VíasBuga. Inicia sesión con tu cuenta y, si
        tienes rol de administrador, verás el panel.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Link to="/login" className={boton.primario}>
          Iniciar sesión
        </Link>
        <Link to="/indicadores" className={boton.secundario}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a indicadores públicos
        </Link>
      </div>
    </div>
  );
}

export default AccesoRestringido;
