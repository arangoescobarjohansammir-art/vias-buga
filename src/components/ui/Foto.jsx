import { ImageOff } from "lucide-react";

// Foto de un reporte (o un recuadro vacío si todavía no tiene).
function Foto({ url, etiqueta, alt, className = "", prioridad = false }) {
  return (
    <figure className={`relative overflow-hidden rounded-2xl border border-borde bg-superficie-3 ${className}`}>
      {url ? (
        <img
          src={url}
          alt={alt ?? "Foto del daño reportado"}
          loading={prioridad ? "eager" : "lazy"}
          decoding="async"
          className="block h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-texto-3">
          <ImageOff className="size-7" aria-hidden="true" />
          Este reporte no tiene foto
        </div>
      )}
      {etiqueta && (
        <figcaption className="absolute bottom-2.5 left-2.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white">
          {etiqueta}
        </figcaption>
      )}
    </figure>
  );
}

export default Foto;
