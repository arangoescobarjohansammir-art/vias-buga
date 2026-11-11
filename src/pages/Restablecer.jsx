import { useState } from "react";
import { Link, useNavigate } from "react-router";
import PantallaAcceso from "../components/layout/PantallaAcceso.jsx";
import CampoClave from "../components/ui/CampoClave.jsx";
import Cargando from "../components/ui/Cargando.jsx";
import { boton } from "../components/ui/estilos.js";
import { useAuth } from "../contexto/auth.js";
import { mensajeError } from "../servicios/errores.js";

// Pantalla a la que llega el enlace del correo "restablecer contraseña".
function Restablecer() {
  const navegar = useNavigate();
  const { cargando, usuario, cambiarClave } = useAuth();
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  if (cargando) return <Cargando pantalla />;

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await cambiarClave(clave);
      navegar("/app", { replace: true });
    } catch (err) {
      setError(mensajeError(err, "No pudimos cambiar la contraseña. Pide un enlace nuevo."));
      setEnviando(false);
    }
  };

  if (!usuario) {
    return (
      <PantallaAcceso titulo="Enlace no válido" descripcion="El enlace venció o ya fue usado.">
        <Link to="/login" className={`${boton.primario} w-full`}>
          Volver a iniciar sesión
        </Link>
      </PantallaAcceso>
    );
  }

  return (
    <PantallaAcceso titulo="Nueva contraseña" descripcion="Elige una contraseña nueva para tu cuenta.">
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <CampoClave
          etiqueta="Contraseña nueva"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
        />
        {error && (
          <p role="alert" className="text-sm font-semibold text-peligro">
            {error}
          </p>
        )}
        <button type="submit" disabled={enviando} className={`${boton.primario} w-full`}>
          {enviando ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </PantallaAcceso>
  );
}

export default Restablecer;
