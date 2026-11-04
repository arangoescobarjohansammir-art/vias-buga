import { NavLink, Outlet, useLocation } from "react-router";
import Logo from "../ui/Logo.jsx";
import BotonTema from "../ui/BotonTema.jsx";

const enlaces = [
  { a: "/app/mapa", etiqueta: "Mapa" },
  { a: "/app/mapa?vista=lista", etiqueta: "Reportes", clave: "reportes" },
  { a: "/indicadores", etiqueta: "Indicadores" },
  { a: "/admin", etiqueta: "Administración" },
];

// Páginas públicas de indicadores y panel de administración (pensadas para escritorio,
// pero se adaptan al celular).
function LayoutAdmin() {
  const { pathname } = useLocation();

  const activo = (enlace) => {
    if (enlace.clave === "reportes") return false;
    if (enlace.a === "/admin") return pathname.startsWith("/admin");
    return pathname === enlace.a;
  };

  return (
    <div className="min-h-dvh bg-fondo text-texto">
      <header className="sticky top-0 z-40 bg-[#1f2a2e] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-1 px-4 pt-3 sm:px-6 md:h-16 md:flex-nowrap md:py-0">
          <Logo sobreOscuro />
          <nav
            aria-label="Principal"
            className="sin-barra order-3 -mx-4 flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 md:order-none md:mx-0 md:w-auto md:flex-1 md:justify-end md:px-0"
          >
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.a}
                to={enlace.a}
                className={() =>
                  `relative shrink-0 px-3 py-3 text-sm font-semibold transition md:py-5 ${
                    activo(enlace) ? "text-white" : "text-white/65 hover:text-white"
                  }`
                }
              >
                {enlace.etiqueta}
                {activo(enlace) && (
                  <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-primario" />
                )}
              </NavLink>
            ))}
          </nav>
          <BotonTema className="ml-auto border-white/15! bg-white/10! text-white! hover:bg-white/20! md:ml-0" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutAdmin;
