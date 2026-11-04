import { Link, useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import PantallaAcceso from "../components/layout/PantallaAcceso.jsx";
import Campo from "../components/ui/Campo.jsx";
import CampoClave from "../components/ui/CampoClave.jsx";
import { boton } from "../components/ui/estilos.js";

function Login() {
  const navegar = useNavigate();

  const enviar = (e) => {
    e.preventDefault();
    // Más adelante: supabase.auth.signInWithPassword.
    navegar("/app");
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
          required
        />
        <CampoClave
          name="clave"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          required
          accion={
            <button
              type="button"
              className="cursor-pointer text-sm font-semibold text-texto-2 underline underline-offset-4 hover:text-texto"
            >
              ¿Olvidaste tu contraseña?
            </button>
          }
        />

        <button type="submit" className={`${boton.primario} mt-2 w-full`}>
          Iniciar sesión
          <ArrowRight className="size-4" aria-hidden="true" />
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
