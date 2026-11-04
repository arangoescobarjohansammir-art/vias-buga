import { Link, useNavigate } from "react-router";
import PantallaAcceso from "../components/layout/PantallaAcceso.jsx";
import Campo from "../components/ui/Campo.jsx";
import CampoClave from "../components/ui/CampoClave.jsx";
import { boton } from "../components/ui/estilos.js";

function Registro() {
  const navegar = useNavigate();

  const enviar = (e) => {
    e.preventDefault();
    // Más adelante: supabase.auth.signUp + insertar en datos_personales.
    navegar("/app");
  };

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

        <button type="submit" className={`${boton.primario} mt-2 w-full`}>
          Crear cuenta
        </button>
        <Link
          to="/app"
          className="text-center text-sm font-semibold text-texto underline underline-offset-4"
        >
          Prefiero continuar como anónimo
        </Link>
      </form>
    </PantallaAcceso>
  );
}

export default Registro;
