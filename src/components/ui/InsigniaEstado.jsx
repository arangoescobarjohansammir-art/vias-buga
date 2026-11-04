import { ESTADOS } from "../../data/catalogos.js";

function InsigniaEstado({ estado, conPunto = false }) {
  return (
    <span className={`insignia insignia-${estado}`}>
      {conPunto && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full"
          style={{ background: `var(--est-${estado}-dot)` }}
        />
      )}
      {ESTADOS[estado].etiqueta}
    </span>
  );
}

export default InsigniaEstado;
