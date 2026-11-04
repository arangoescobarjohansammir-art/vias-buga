import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { EyeOff, LogOut, Lock, ShieldAlert, Trash2, UserPlus } from "lucide-react";
import Campo from "../../components/ui/Campo.jsx";
import Modal from "../../components/ui/Modal.jsx";
import AvisoEjemplo from "../../components/ui/AvisoEjemplo.jsx";
import BotonTema from "../../components/ui/BotonTema.jsx";
import { boton, tarjeta } from "../../components/ui/estilos.js";
import { PERFIL_EJEMPLO } from "../../data/ejemplo.js";

function iniciales(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

// Pantalla para quien entró con "Continuar como anónimo" (se ve con /app/perfil?anonimo=1).
function PerfilAnonimo() {
  return (
    <section className={`${tarjeta} p-6`}>
      <span className="flex size-12 items-center justify-center rounded-xl bg-superficie-3">
        <EyeOff className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-extrabold">¿Estás navegando en modo anónimo?</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-texto-2">
        Para consultar tus reportes desde cualquier dispositivo y recibir avisos cuando cambie el
        estado de tus reportes, crea una cuenta ciudadana.
      </p>
      <Link to="/registro" className={`${boton.primario} mt-5 w-full sm:w-auto`}>
        <UserPlus className="size-5" aria-hidden="true" />
        Crear cuenta
      </Link>
    </section>
  );
}

function Perfil() {
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const anonimo = parametros.has("anonimo");

  const [nombre, setNombre] = useState(PERFIL_EJEMPLO.nombre);
  const [telefono, setTelefono] = useState(PERFIL_EJEMPLO.telefono);
  const [guardado, setGuardado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [datosBorrados, setDatosBorrados] = useState(false);

  const guardar = (e) => {
    e.preventDefault();
    // Más adelante: update de nombre_completo y telefono en datos_personales.
    setGuardado(true);
  };

  const borrarDatos = () => {
    // Más adelante: delete de la fila en datos_personales (el perfil y los reportes se conservan).
    setDatosBorrados(true);
    setConfirmando(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-4 md:px-6 md:pt-8">
      <header className="flex h-12 items-center gap-3">
        <h1 className="flex-1 text-3xl font-extrabold tracking-tight">Mi perfil</h1>
        {!anonimo && (
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full bg-primario text-sm font-extrabold text-sobre-primario"
          >
            {iniciales(nombre)}
          </span>
        )}
        <BotonTema className="md:hidden" />
      </header>
      <AvisoEjemplo className="mt-2" />

      <div className="mt-5 flex flex-col gap-6">
        {anonimo ? (
          <PerfilAnonimo />
        ) : (
          <>
            <form onSubmit={guardar} className={`${tarjeta} flex flex-col gap-4 p-5 sm:p-6`}>
              <h2 className="text-lg font-extrabold">Cuenta ciudadana</h2>
              <Campo
                etiqueta="Nombre completo"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setGuardado(false);
                }}
                minLength={2}
                maxLength={120}
                required
              />
              <Campo
                etiqueta="Correo electrónico"
                value={PERFIL_EJEMPLO.correo}
                readOnly
                ayuda="El correo se cambia desde la configuración de la cuenta."
              />
              <Campo
                etiqueta="Teléfono celular"
                type="tel"
                value={telefono}
                onChange={(e) => {
                  setTelefono(e.target.value);
                  setGuardado(false);
                }}
                pattern="[0-9+ ]{7,15}"
              />
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold">Cédula de ciudadanía</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-texto-3">
                    <Lock className="size-3.5" aria-hidden="true" />
                    Solo lectura
                  </span>
                </div>
                <p className="flex h-12 items-center rounded-xl border-[1.5px] border-borde bg-superficie-2 px-4 text-[15px] font-semibold text-texto-2">
                  C.C. {PERFIL_EJEMPLO.cedula}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className={boton.primario}>
                  Guardar cambios de perfil
                </button>
                <p role="status" className={`text-sm font-semibold text-exito ${guardado ? "" : "hidden"}`}>
                  Cambios guardados
                </p>
              </div>
            </form>

            <section className={`${tarjeta} p-5 sm:p-6`}>
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <ShieldAlert className="size-5 text-acento" aria-hidden="true" />
                Mis datos personales
              </h2>
              {datosBorrados ? (
                <p role="status" className="mt-3 rounded-xl bg-exito/15 p-4 text-sm font-semibold text-exito">
                  Listo. Tu nombre, cédula y teléfono fueron borrados de VíasBuga. Tus reportes se
                  conservan sin tus datos.
                </p>
              ) : (
                <>
                  <p className="mt-3 text-[15px] leading-relaxed text-texto-2">
                    Tus reportes se conservan para el beneficio de la comunidad, pero ya no estarán
                    asociados a tu nombre, cédula ni teléfono.
                  </p>
                  <button type="button" onClick={() => setConfirmando(true)} className={`${boton.peligro} mt-4`}>
                    <Trash2 className="size-5" aria-hidden="true" />
                    Borrar mis datos personales
                  </button>
                </>
              )}
            </section>
          </>
        )}

        <button type="button" onClick={() => navegar("/")} className={`${boton.secundario} w-full sm:w-auto sm:self-start`}>
          <LogOut className="size-5" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>

      <Modal titulo="Confirmar borrado de datos" abierto={confirmando} onCerrar={() => setConfirmando(false)}>
        <h2 className="text-2xl font-extrabold tracking-tight">¿Confirmas el borrado?</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-texto-2">
          Se borrarán tu nombre, cédula y teléfono de VíasBuga. Tus reportes se conservan sin tus datos.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={borrarDatos} className={boton.primario}>
            Sí, borrar mis datos
          </button>
          <button type="button" onClick={() => setConfirmando(false)} className={boton.secundario}>
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Perfil;
