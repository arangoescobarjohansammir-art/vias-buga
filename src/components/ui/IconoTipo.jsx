// Íconos de los 5 tipos de daño (los mismos trazos del prototipo).
const trazos = {
  hueco: (
    <>
      <ellipse cx="12" cy="14" rx="8" ry="4" />
      <path d="M4 14v-2.5C4 9.5 7.6 8 12 8s8 1.5 8 3.5V14" />
    </>
  ),
  semaforo_danado: (
    <>
      <rect x="8" y="2.5" width="8" height="19" rx="3" />
      <circle cx="12" cy="7" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="12" cy="17" r="1.2" />
    </>
  ),
  senalizacion: (
    <>
      <path d="M12 3l9 9-9 9-9-9z" />
      <path d="M12 8v5M12 16v.5" />
    </>
  ),
  anden: <path d="M3 18h6v-5h6V8h6" />,
  sumidero: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 4v16M15 4v16M4 9h16M4 15h16" />
    </>
  ),
};

function IconoTipo({ tipo, className = "size-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {trazos[tipo]}
    </svg>
  );
}

export default IconoTipo;
