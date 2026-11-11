import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { MailCheck } from "lucide-react";
import PantallaAcceso from "../components/layout/PantallaAcceso.jsx";
import Campo from "../components/ui/Campo.jsx";
import CampoClave from "../components/ui/CampoClave.jsx";
import { boton } from "../components/ui/estilos.js";
import { useAuth } from "../contexto/auth.js";
import { mensajeError } from "../servicios/errores.js";

function Registro() {
  const navegar = useNavigate();
  const { registrar, asegurarSesion } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [pendienteCorreo, setPendienteCorreo] = useState("");

  const enviar = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const datos = {
      nombre: String(form.get("nombre")),
      cedula: String(form.get("cedula")),
      correo: String(form.get("correo")),
      telefono: String(form.get("telefono") ?? ""),
      clave: String(form.get("clave")),
    };
    setError("");
    setEnviando(true);
    try {
      const { requiereConfirmacion } = await registrar(datos);
      if (requiereConfirmacion) {
        setPendienteCorreo(datos.correo);
        setEnviando(false);
      } else {
        navegar("/app", { replace: true });
      }
    } catch (err) {
      setError(mensajeError(err, "No pudimos crear tu cuenta. Inténtalo de nuevo."));
      setEnviando(false);
    }
  };

  const continuarAnonimo = async () => {
    try {
      await asegurarSesion();
      navegar("/app");
    } catch (err) {
      setError(mensajeError(err, "No pudimos iniciar tu sesión. Inténtalo de nuevo."));
    }
  };

  if (pendienteCorreo) {
    return (
      <PantallaAcceso titulo="Revisa tu correo" descripcion="Un último paso para activar tu cuenta.">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-borde bg-superficie-2 p-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primario/15 text-primario">
            <MailCheck className="size-7" aria-hidden="true" />
          </span>
          <p className="text-[15px] leading-relaxed text-texto-2">
            Enviamos un enlace de confirmación a{" "}
            <strong className="text-texto">{pendienteCorreo}</strong>. Ábrelo para activar tu cuenta y luego
            inicia sesión.
          </p>
          <Link to="/login" className={`${boton.primario} w-full`}>
            Ir a iniciar sesión
          </Link>
        </div>
      </PantallaAcceso>
    );
  }

  return (
    <PantallaAcceso
      titulo="Crea tu cuenta"
      descripcion="Tu cédula evita cuentas repetidas. No se muestra en tus reportes."
    >
      <form onSubmit={enviar} className="flex flex-col gap-4">
        {/* Los atributos replican los CHECK de la tabla datos_personales. */}
        <Campo
          etiqueta="Nombre completo"
          name="nombre"
          autoComplete="name"
          placeholder="Como aparece en tu documento"
          minLength={2}
          maxLength={120}
          required
        />
        <Campo
          etiqueta="Cédula de ciudadanía"
          name="cedula"
          inputMode="numeric"
          pattern="[0-9]{5,12}"
          title="Solo números, entre 5 y 12 dígitos"
          placeholder="Solo números"
          required
        />
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          name="correo"
          autoComplete="email"
          placeholder="nombre@correo.com"
          required
        />
        <Campo
          etiqueta="Teléfono celular"
          type="tel"
          name="telefono"
          autoComplete="tel"
          pattern="[0-9+ ]{7,15}"
          title="Entre 7 y 15 caracteres: números, espacios o +"
          placeholder="300 000 0000"
        />
        <CampoClave
          name="clave"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          required
        />

        <label className="mt-1 flex cursor-pointer items-start gap-3 text-sm leading-snug text-texto-2">
          <input
            type="checkbox"
            required
            className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-borde-fuerte accent-primario"
          />
          Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012.
        </label>

        {error && (
          <p role="alert" className="text-sm font-semibold text-peligro">
            {error}
          </p>
        )}

        <button type="submit" disabled={enviando} className={`${boton.primario} mt-2 w-full`}>
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
        <button
          type="button"
          onClick={continuarAnonimo}
          className="cursor-pointer text-center text-sm font-semibold text-texto underline underline-offset-4"
        >
          Prefiero continuar como anónimo
        </button>
      </form>
    </PantallaAcceso>
  );
}

export default Registro;
