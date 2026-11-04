import { Link } from "react-router";

// "sobreOscuro" fuerza el texto blanco (barras que siempre son oscuras).
function Logo({ tamano = "md", enlace = true, sobreOscuro = false, className = "" }) {
  const caja = tamano === "lg" ? "size-10 rounded-xl" : "size-8 rounded-[9px]";
  const texto = tamano === "lg" ? "text-2xl" : "text-xl";

  const contenido = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`${caja} flex items-center justify-center bg-primario text-sobre-primario shadow-sm`}
      >
        <svg viewBox="0 0 16 20" className="h-5 w-4" fill="none">
          <path d="M8 2.5V11" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
          <circle cx="8" cy="16" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <span
        className={`${texto} font-extrabold tracking-tight ${sobreOscuro ? "text-white" : "text-texto"}`}
      >
        VíasBuga
      </span>
    </span>
  );

  if (!enlace) return contenido;
  return (
    <Link to="/" aria-label="VíasBuga, ir al inicio" className="rounded-lg">
      {contenido}
    </Link>
  );
}

export default Logo;
