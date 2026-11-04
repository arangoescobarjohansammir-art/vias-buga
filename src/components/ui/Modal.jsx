import { useEffect } from "react";

// Ventana emergente accesible: se cierra con Escape o al tocar el fondo.
function Modal({ titulo, abierto, onCerrar, children }) {
  useEffect(() => {
    if (!abierto) return undefined;
    const alPresionar = (e) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar ventana"
        onClick={onCerrar}
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="pb-seguro relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-borde bg-superficie p-6 shadow-flotante sm:rounded-3xl"
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
