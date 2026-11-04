import { Link } from "react-router";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  EyeOff,
  Globe2,
  Info,
  MapPin,
  ShieldCheck,
  Siren,
} from "lucide-react";
import Logo from "../components/ui/Logo.jsx";
import BotonTema from "../components/ui/BotonTema.jsx";
import { boton } from "../components/ui/estilos.js";

const ventajas = [
  { Icono: Globe2, titulo: "100% independiente", texto: "Datos abiertos y cívicos" },
  { Icono: Camera, titulo: "Fotos y evidencia", texto: "Monitoreo hasta la reparación" },
  { Icono: MapPin, titulo: "Geolocalizado", texto: "Puntos exactos en Buga" },
];

// Ilustración nocturna de una calle con un hueco (siempre oscura, como en la captura).
function IlustracionCalle() {
  return (
    <div className="relative h-64 overflow-hidden rounded-2xl border border-white/5 bg-[#1b252b] sm:h-80">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-[30%] flex items-end justify-center gap-2 px-6 opacity-40">
        <span className="h-24 w-14 rounded-t-sm bg-[#29353b]" />
        <span className="h-32 w-10 rounded-t-sm bg-[#263137]" />
        <span className="h-16 w-16 rounded-t-sm bg-[#243036]" />
        <span className="h-36 w-12 rounded-t-sm bg-[#29353b]" />
        <span className="h-20 w-10 rounded-t-sm bg-[#232e33]" />
      </div>
      <svg
        viewBox="0 0 390 280"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden="true"
      >
        <polygon points="40,280 350,280 200,50 190,50" fill="#2e3c43" />
        <g stroke="#f5b700" strokeLinecap="round">
          <line x1="195" x2="195" y1="54" y2="68" strokeWidth="3" />
          <line x1="195" x2="195" y1="82" y2="102" strokeWidth="3.5" />
          <line x1="195" x2="195" y1="120" y2="148" strokeWidth="4" />
          <line x1="195" x2="195" y1="170" y2="206" strokeWidth="4.5" />
          <line x1="195" x2="195" y1="232" y2="276" strokeWidth="5" />
        </g>
        <ellipse cx="150" cy="190" rx="34" ry="10" fill="#1c2529" stroke="#3d4e56" strokeWidth="2.5" />
        <ellipse cx="150" cy="191" rx="30" ry="8" fill="#0f1417" />
      </svg>
      <MapPin
        aria-hidden="true"
        className="absolute left-[41%] top-[20%] size-9 fill-primario text-primario drop-shadow-lg"
        strokeWidth={1.5}
      />

      <div className="absolute left-3 top-3 flex items-center gap-3 rounded-xl border border-white/10 bg-[#141b1f]/90 p-2.5 pr-4 shadow-lg backdrop-blur sm:left-5 sm:top-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
          <Siren className="size-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-bold text-white">Hueco profundo</span>
          <span className="block text-xs text-[#a6b4ba]">Cra. 14 con Calle 7</span>
        </span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#141b1f]/90 px-3.5 py-2.5 shadow-lg backdrop-blur sm:bottom-5 sm:right-5">
        <span className="size-2 rounded-full bg-primario" aria-hidden="true" />
        <span>
          <span className="block text-sm font-bold text-white">En revisión ciudadana</span>
          <span className="block text-xs text-[#a6b4ba]">Hace 12 minutos</span>
        </span>
      </div>
    </div>
  );
}

function Bienvenida() {
  return (
    <div className="fondo-resplandor flex min-h-dvh flex-col bg-fondo text-texto">
      <header className="border-b border-borde/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Logo />
          <span className="hidden items-center gap-2 rounded-full border border-borde bg-superficie px-3 py-1 text-xs font-semibold text-texto-2 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-primario" aria-hidden="true" />
            Guadalajara de Buga
          </span>
          <span className="ml-auto hidden text-xs text-texto-3 md:block">
            Iniciativa ciudadana independiente
          </span>
          <Link to="/login" className={`${boton.secundario} ml-auto h-10 rounded-lg! px-4 text-sm md:ml-0`}>
            Iniciar sesión
          </Link>
          <BotonTema />
        </div>
      </header>

      <main className="mx-auto grid grid-cols-1 w-full max-w-7xl flex-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-14">
        <section>
          <p className="inline-flex items-center gap-2 rounded-full border border-borde bg-superficie px-3.5 py-1.5 text-xs font-semibold text-texto-2">
            <BadgeCheck className="size-4 text-primario" aria-hidden="true" />
            Proyecto ciudadano independiente
          </p>

          <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Reporta lo que daña <span className="text-primario">tu calle</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-texto-2 sm:text-lg">
            Huecos, semáforos, andenes y más en Guadalajara de Buga. Sigue cada
            reporte hasta que se repare.
          </p>

          <div className="mt-8 flex max-w-md flex-col gap-3">
            <Link to="/registro" className={`${boton.primario} rounded-xl!`}>
              Crear cuenta
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link to="/login" className={`${boton.secundario} rounded-xl! bg-superficie-2`}>
              Iniciar sesión
            </Link>
            <Link to="/app" className={`${boton.suave} rounded-xl!`}>
              <EyeOff className="size-5" aria-hidden="true" />
              Continuar como anónimo
            </Link>
          </div>

          <p className="mt-4 flex max-w-md items-start gap-2 text-xs leading-snug text-texto-3">
            <Info className="mt-px size-3.5 shrink-0 text-primario" aria-hidden="true" />
            Puedes reportar sin cuenta. Si borras los datos de tu navegador, perderás
            el acceso a tus reportes.
          </p>

          <ul className="mt-10 grid grid-cols-1 gap-3 border-t border-borde pt-8 sm:grid-cols-3">
            {ventajas.map(({ Icono, titulo, texto }) => (
              <li key={titulo} className="rounded-xl border border-borde bg-superficie-2 p-3.5">
                <Icono className="size-4 text-primario" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold">{titulo}</p>
                <p className="text-xs text-texto-3">{texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-label="Vista previa del radar de malla vial"
          className="rounded-3xl border border-borde bg-superficie p-4 shadow-flotante sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-texto-2">
              <span className="size-2 rounded-full bg-exito" aria-hidden="true" />
              Radar de malla vial activo
            </p>
            <span className="rounded-md border border-borde bg-superficie-2 px-2.5 py-1 text-xs font-semibold text-texto-2">
              Comuna 1 a 8
            </span>
          </div>
          <IlustracionCalle />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-borde bg-superficie-2 p-3.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primario/15 text-primario">
                <BadgeCheck className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold">Transparente</span>
                <span className="block text-xs text-texto-3">Reportes públicos y trazables</span>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-borde bg-superficie-2 p-3.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold">Sin sesgo oficial</span>
                <span className="block text-xs text-texto-3">Control en manos de la gente</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-borde">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-texto-3 sm:flex-row sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} VíasBuga — Plataforma cívica independiente para
            Guadalajara de Buga, Valle del Cauca.
          </p>
          <p>Hecho por la comunidad para mejorar nuestras vías</p>
        </div>
      </footer>
    </div>
  );
}

export default Bienvenida;
