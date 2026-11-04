// Etiqueta para dejar claro que lo que se ve son datos de ejemplo.
function AvisoEjemplo({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-primario/20 px-2.5 py-1 text-xs font-bold text-acento ${className}`}
    >
      Datos de ejemplo
    </span>
  );
}

export default AvisoEjemplo;
