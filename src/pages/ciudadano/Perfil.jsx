import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeOff, LogOut, Lock, ShieldAlert, Trash2, UserMinus, UserPlus } from "lucide-react";
import Campo from "../../components/ui/Campo.jsx";
import Cargando from "../../components/ui/Cargando.jsx";
import Modal from "../../components/ui/Modal.jsx";
import SinSesion from "../../components/ui/SinSesion.jsx";
import BotonTema from "../../components/ui/BotonTema.jsx";
import { boton, tarjeta } from "../../components/ui/estilos.js";
import { useAuth } from "../../contexto/auth.js";
import { mensajeError } from "../../servicios/errores.js";
import {
  actualizarDatosPersonales,
  borrarDatosPersonales,
  eliminarMiCuenta,
} from "../../servicios/reportes.js";

function iniciales(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

// Para quien entró con "Continuar como anónimo".
function PerfilAnonimo() {
  return (
    <section className={`${tarjeta} p-6`}>
      <span className="flex size-12 items-center justify-center rounded-xl bg-superficie-3">
        <EyeOff className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-extrabold">Estás navegando en modo anónimo</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-texto-2">
        Tus reportes se guardan solo en este navegador. Si cierras la sesión o borras los datos del
        navegador, perderás el acceso a ellos. Para consultarlos desde cualquier dispositivo y recibir
        avisos, crea una cuenta ciudadana.
      </p>
      <Link to="/registro" className={`${boton.primario} mt-5 w-full sm:w-auto`}>
        <UserPlus className="size-5" aria-hidden="true" />
        Crear cuenta
      </Link>
    </section>
  );
}

function FormularioPerfil({ uid, correo, datos, onGuardado }) {
  const [nombre, setNombre] = useState(datos.nombre_completo);
  const [telefono, setTelefono] = useState(datos.telefono ?? "");
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await actualizarDatosPersonales(uid, { nombre, telefono });
      onGuardado();
      setGuardado(true);
    } catch (err) {
      setError(mensajeError(err, "No pudimos guardar tus cambios."));
    } finally {
      setGuardando(false);
    }
  };

  return (
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
      <Campo etiqueta="Correo electrónico" value={correo ?? ""} readOnly />
      <Campo
        etiqueta="Teléfono celular"
        type="tel"
        value={telefono}
        onChange={(e) => {
          setTelefono(e.target.value);
          setGuardado(false);
        }}
        pattern="[0-9+ ]{7,15}"
        title="Entre 7 y 15 caracteres: números, espacios o +"
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
          C.C. {datos.cedula}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-peligro">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={guardando} className={boton.primario}>
          {guardando ? "Guardando..." : "Guardar cambios de perfil"}
        </button>
        <p role="status" className={`text-sm font-semibold text-exito ${guardado ? "" : "hidden"}`}>
          Cambios guardados
        </p>
      </div>
    </form>
  );
}

function Perfil() {
  const navegar = useNavigate();
  const { cargando, uid, usuario, correo, esAnonimo, esAdmin, datos, cerrarSesion, recargarPerfil } = useAuth();

  const [modal, setModal] = useState(null); // "datos" | "cuenta" | null
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState("");
  const [datosBorrados, setDatosBorrados] = useState(false);

  if (cargando) return <Cargando />;

  const salir = async () => {
    await cerrarSesion();
    navegar("/");
  };

  const borrarDatos = async () => {
    setTrabajando(true);
    setError("");
    try {
      await borrarDatosPersonales(uid);
      recargarPerfil();
      setDatosBorrados(true);
      setModal(null);
    } catch (e) {
      setError(mensajeError(e, "No pudimos borrar tus datos. Inténtalo de nuevo."));
      setModal(null);
    } finally {
      setTrabajando(false);
    }
  };

  const eliminarCuenta = async () => {
    setTrabajando(true);
    setError("");
    try {
      await eliminarMiCuenta();
      await cerrarSesion();
      navegar("/", { replace: true });
    } catch (e) {
      setError(mensajeError(e, "No pudimos eliminar tu cuenta. Inténtalo de nuevo."));
      setModal(null);
      setTrabajando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-4 md:px-6 md:pt-8">
      <header className="flex h-12 items-center gap-3">
        <h1 className="flex-1 text-3xl font-extrabold tracking-tight">Mi perfil</h1>
        {datos && (
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full bg-primario text-sm font-extrabold text-sobre-primario"
          >
            {iniciales(datos.nombre_completo)}
          </span>
        )}
        <BotonTema className="md:hidden" />
      </header>

      {!usuario ? (
        <SinSesion siguiente="/app/perfil" texto="Inicia sesión para ver y editar tu perfil." />
      ) : (
        <div className="mt-5 flex flex-col gap-6">
          {esAnonimo ? (
            <PerfilAnonimo />
          ) : datos ? (
            <FormularioPerfil key={datos.cedula} uid={uid} correo={correo} datos={datos} onGuardado={recargarPerfil} />
          ) : (
            <section className={`${tarjeta} p-6`}>
              <h2 className="text-lg font-extrabold">Cuenta ciudadana</h2>
              <p className="mt-2 break-all text-sm text-texto-2">{correo}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-texto-2">
                {datosBorrados
                  ? "Listo. Tu nombre, cédula y teléfono fueron borrados de VíasBuga. Tus reportes se conservan sin tus datos."
                  : "Tu cuenta no tiene datos personales guardados."}
              </p>
            </section>
          )}

          {!esAnonimo && datos && (
            <section className={`${tarjeta} p-5 sm:p-6`}>
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <ShieldAlert className="size-5 text-acento" aria-hidden="true" />
                Mis datos personales
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-texto-2">
                Tus reportes se conservan para el beneficio de la comunidad, pero ya no estarán
                asociados a tu nombre, cédula ni teléfono.
              </p>
              <button type="button" onClick={() => setModal("datos")} className={`${boton.peligro} mt-4`}>
                <Trash2 className="size-5" aria-hidden="true" />
                Borrar mis datos personales
              </button>
            </section>
          )}

          {error && (
            <p role="alert" className="text-sm font-semibold text-peligro">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={salir} className={`${boton.secundario} w-full sm:w-auto`}>
              <LogOut className="size-5" aria-hidden="true" />
              Cerrar sesión
            </button>
            {!esAdmin && (
              <button type="button" onClick={() => setModal("cuenta")} className={`${boton.peligro} w-full sm:w-auto`}>
                <UserMinus className="size-5" aria-hidden="true" />
                Eliminar mi cuenta
              </button>
            )}
          </div>
        </div>
      )}

      <Modal titulo="Confirmar borrado de datos" abierto={modal === "datos"} onCerrar={() => setModal(null)}>
        <h2 className="text-2xl font-extrabold tracking-tight">¿Confirmas el borrado?</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-texto-2">
          Se borrarán tu nombre, cédula y teléfono de VíasBuga. Tus reportes se conservan sin tus datos.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={borrarDatos} disabled={trabajando} className={boton.primario}>
            Sí, borrar mis datos
          </button>
          <button type="button" onClick={() => setModal(null)} className={boton.secundario}>
            Cancelar
          </button>
        </div>
      </Modal>

      <Modal titulo="Confirmar eliminación de la cuenta" abierto={modal === "cuenta"} onCerrar={() => setModal(null)}>
        <h2 className="text-2xl font-extrabold tracking-tight">¿Eliminar tu cuenta?</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-texto-2">
          Se borrarán tu cuenta, tus datos personales, tus apoyos y tus avisos. Tus reportes se
          conservan sin tu nombre. Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={eliminarCuenta} disabled={trabajando} className={boton.peligro}>
            {trabajando ? "Eliminando..." : "Sí, eliminar mi cuenta"}
          </button>
          <button type="button" onClick={() => setModal(null)} className={boton.secundario}>
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Perfil;
