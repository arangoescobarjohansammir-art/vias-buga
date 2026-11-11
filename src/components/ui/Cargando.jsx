// Indicador de carga. "pantalla" lo centra a pantalla completa; sin ella, ocupa solo su espacio.
function Cargando({ pantalla = false, texto = "Cargando" }) {
  return (
    <div
      role="status"
      aria-label={texto}
      className={`flex items-center justify-center ${pantalla ? "min-h-dvh bg-fondo" : "py-16"}`}
    >
      <span className="size-9 animate-spin rounded-full border-4 border-borde border-t-primario" />
    </div>
  );
}

export default Cargando;
