import { useState } from "react";
import { Link } from "react-router";
import { EyeOff, LogIn } from "lucide-react";
import { boton } from "./estilos.js";
import { useAuth } from "../../contexto/auth.js";
import { mensajeError } from "../../servicios/errores.js";

// Se muestra cuando una pantalla necesita sesión y la persona todavía no tiene ninguna.
function SinSesion({ siguiente = "/app", texto }) {
  const { asegurarSesion } = useAuth();
  const [error, setError] = useState("");

  const entrarAnonimo = async () => {
    try {
      await asegurarSesion();
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-borde bg-superficie p-6 text-center shadow-tarjeta">
      <p className="text-lg font-extrabold">Aún no tienes sesión</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-texto-2">{texto}</p>
      <div className="mx-auto mt-5 flex max-w-xs flex-col gap-3">
        <Link to={`/login?siguiente=${encodeURIComponent(siguiente)}`} className={boton.primario}>
          <LogIn className="size-4" aria-hidden="true" />
          Iniciar sesión
        </Link>
        <Link to="/registro" className={boton.secundario}>
          Crear cuenta
        </Link>
        <button type="button" onClick={entrarAnonimo} className={boton.suave}>
          <EyeOff className="size-5" aria-hidden="true" />
          Continuar como anónimo
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-peligro">
          {error}
        </p>
      )}
    </div>
  );
}

export default SinSesion;
