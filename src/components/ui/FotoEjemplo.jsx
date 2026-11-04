// Ilustración que hace de foto mientras no hay fotos reales (Fase 2: Storage).
function FotoEjemplo({ variante = "antes", etiqueta, className = "" }) {
  const reparado = variante === "despues";

  return (
    <figure
      className={`relative overflow-hidden rounded-2xl border border-borde bg-superficie-3 ${className}`}
    >
      <svg
        viewBox="0 0 400 300"
        className="block h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={reparado ? "Ejemplo de calle reparada" : "Ejemplo de hueco en la calle"}
      >
        <defs>
          <linearGradient id={`asfalto-${variante}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a565d" />
            <stop offset="1" stopColor="#2c373d" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#asfalto-${variante})`} />
        <path d="M0 215 Q120 190 240 205 T400 190" stroke="#1d272c" strokeWidth="2" fill="none" opacity=".6" />
        <path d="M60 0 L90 80 L70 140" stroke="#1d272c" strokeWidth="2" fill="none" opacity=".5" />
        <path d="M330 300 L300 230 L335 180" stroke="#1d272c" strokeWidth="2" fill="none" opacity=".5" />
        <g stroke="#f5b700" strokeWidth="6" strokeLinecap="round" opacity=".85">
          <path d="M0 262 H70" />
          <path d="M130 262 H200" />
          <path d="M260 262 H330" />
        </g>
        {reparado ? (
          <g>
            <rect x="140" y="120" width="130" height="64" rx="10" fill="#37444b" />
            <rect x="140" y="120" width="130" height="64" rx="10" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 6" />
          </g>
        ) : (
          <g>
            <ellipse cx="205" cy="158" rx="78" ry="34" fill="#141c20" stroke="#6b7a82" strokeWidth="4" />
            <ellipse cx="205" cy="162" rx="64" ry="26" fill="#0b1012" />
            <ellipse cx="190" cy="152" rx="26" ry="8" fill="#26343b" opacity=".7" />
          </g>
        )}
      </svg>
      {etiqueta && (
        <figcaption
          className={`absolute bottom-2.5 left-2.5 rounded-full px-3 py-1 text-xs font-bold ${
            reparado ? "bg-exito text-white" : "bg-slate-900/80 text-white"
          }`}
        >
          {etiqueta}
        </figcaption>
      )}
    </figure>
  );
}

export default FotoEjemplo;
