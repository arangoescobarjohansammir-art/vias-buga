import { useState } from "react";

function FormularioReporte({ onAgregar, ubicacion, onLimpiarUbicacion }) {
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!ubicacion) {
      window.alert("Primero marca la ubicación en el mapa");
      return;
    }

    setEnviando(true);

    try {
      const exito = await onAgregar({
        tipo: tipo,
        descripcion: descripcion,
        latitud: ubicacion.lat,
        longitud: ubicacion.lng,
      });

      if (!exito) {
        window.alert(
          "No se pudo guardar el reporte en la base de datos. Inténtalo de nuevo.",
        );
        return;
      }

      setTipo("");
      setDescripcion("");
      onLimpiarUbicacion();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={manejarEnvio}>
      <label htmlFor="tipo">Elige el Tipo de daño: </label>

      <select
        id="tipo"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        required
      >
        <option value="">selecciona...</option>
        <option value="hueco">hueco</option>
        <option value="semaforo_danado">semáforo dañado</option>
        <option value="senalizacion">señalización</option>
        <option value="anden">andén</option>
        <option value="sumidero">sumidero</option>
      </select>

      <label htmlFor="descripcion">Descripción</label>

      <textarea
        id="descripcion"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      ></textarea>
      <button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : "Enviar Formulario"}
      </button>
    </form>
  );
}

export default FormularioReporte;
