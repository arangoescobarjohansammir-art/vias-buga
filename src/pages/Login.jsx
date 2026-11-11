import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowRight } from "lucide-react";
import PantallaAcceso from "../components/layout/PantallaAcceso.jsx";
import Campo from "../components/ui/Campo.jsx";
import CampoClave from "../components/ui/CampoClave.jsx";
import { boton } from "../components/ui/estilos.js";
import { useAuth } from "../contexto/auth.js";
import { mensajeError } from "../servicios/errores.js";

// Solo se acepta volver a rutas internas (evita redirecciones a otros sitios).
function rutaSegura(ruta) {
  return ruta && ruta.startsWith("/") && !ruta.startsWith("//") ? ruta : "/app";
}

function Login() {
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const { iniciarSesion, enviarRecuperacion } = useAuth();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setAviso("");
    setEnviando(true);
    try {
      await iniciarSesion(correo, clave);
      navegar(rutaSegura(params.get("siguiente")), { replace: true });
    } catch (err) {
      setError(mensajeError(err, "No pudimos iniciar sesión. Inténtalo de nuevo."));
      setEnviando(false);
    }
  };

  const recuperar = async () => {
    setError("");
    setAviso("");
    if (!correo.trim()) {
      setError("Escribe tu correo arriba y vuelve a tocar “¿Olvidaste tu contraseña?”.");
      return;
    }
    try {
      await enviarRecuperacion(correo);
      setAviso("Si ese correo tiene una cuenta, te enviamos un enlace para crear una contraseña nueva.");
    } catch (err) {
      setError(mensajeError(err, "No pudimos enviar el correo. Inténtalo de nuevo."));
    }
  };

  return (
    <PantallaAcceso
      titulo="Iniciar sesión"
      descripcion="Ingresa a tu cuenta para ver y seguir tus reportes."
    >
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          name="correo"
          autoComplete="email"
          placeholder="ejemplo@correo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <CampoClave
          name="clave"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
          accion={
            <button
              type="button"
              onClick={recuperar}
              className="cursor-pointer text-sm font-semibold text-texto-2 underline underline-offset-4 hover:text-texto"
            >
              ¿Olvidaste tu contraseña?
            </button>
          }
        />

        {error && (
          <p role="alert" className="text-sm font-semibold text-peligro">
            {error}
          </p>
        )}
        {aviso && (
          <p role="status" className="text-sm font-semibold text-exito">
            {aviso}
          </p>
        )}

        <button type="submit" disabled={enviando} className={`${boton.primario} mt-2 w-full`}>
          {enviando ? "Entrando..." : "Iniciar sesión"}
          {!enviando && <ArrowRight className="size-4" aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-texto-2">
        ¿No tienes cuenta?{" "}
        <Link to="/registro" className="font-bold text-texto underline underline-offset-4">
          Crear cuenta
        </Link>
      </p>
    </PantallaAcceso>
  );
}

export default Login;
