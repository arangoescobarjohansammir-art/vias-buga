import { NavLink, Link, Outlet } from "react-router";
import { FileText, MapPin, Plus, User } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import BotonTema from "../ui/BotonTema.jsx";
import { boton } from "../ui/estilos.js";

const enlaces = [
  { a: "/app", etiqueta: "Inicio", fin: true },
  { a: "/app/mapa", etiqueta: "Mapa" },
  { a: "/app/mis-reportes", etiqueta: "Mis reportes" },
  { a: "/app/perfil", etiqueta: "Mi perfil" },
];

const pestanas = [
  { a: "/app", etiqueta: "Inicio", Icono: MapPin, fin: true },
  { a: "/app/mis-reportes", etiqueta: "Mis reportes", Icono: FileText, aviso: true },
  { a: "/app/perfil", etiqueta: "Mi perfil", Icono: User },
];

// Barra superior: solo en pantallas medianas y grandes.
function BarraSuperior() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-borde bg-encabezado backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
        <Logo />
        <nav aria-label="Principal" className="flex flex-1 items-center gap-1">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.a}
              to={enlace.a}
              end={enlace.fin}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-superficie-3 text-texto"
                    : "text-texto-2 hover:bg-superficie-3 hover:text-texto"
                }`
              }
            >
              {enlace.etiqueta}
            </NavLink>
          ))}
        </nav>
        <Link to="/app/reportar" className={`${boton.chicoPrimario} h-10`}>
          <Plus className="size-4" aria-hidden="true" />
          Reportar un daño
        </Link>
        <BotonTema />
      </div>
    </header>
  );
}

// Barra inferior: solo en celular.
function BarraInferior() {
  return (
    <nav
      aria-label="Principal"
      className="pb-seguro fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-superficie md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-3">
        {pestanas.map(({ a, etiqueta, Icono, fin, aviso }) => (
          <li key={a}>
            <NavLink
              to={a}
              end={fin}
              className={({ isActive }) =>
                `relative flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition ${
                  isActive ? "text-texto" : "text-texto-3"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-6 top-0 h-[3px] rounded-b-full ${
                      isActive ? "bg-primario" : "bg-transparent"
                    }`}
                  />
                  <span className="relative">
                    <Icono className="size-6" />
                    {aviso && (
                      <span
                        className="absolute -right-1 -top-0.5 size-2.5 rounded-full border-2 border-superficie bg-peligro"
                        aria-label="Tienes avisos nuevos"
                      />
                    )}
                  </span>
                  {etiqueta}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// "conPestanas" muestra la barra inferior del celular (Inicio / Mis reportes / Mi perfil).
function LayoutCiudadano({ conPestanas = false }) {
  return (
    <div className="min-h-dvh bg-fondo text-texto">
      <BarraSuperior />
      <main className={conPestanas ? "pb-20 md:pb-0" : ""}>
        <Outlet />
      </main>
      {conPestanas && <BarraInferior />}
    </div>
  );
}

export default LayoutCiudadano;
