import { useState } from "react";

function FormularioReporte({ onAgregar }) {
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const manejarEnvio = (e) => {
    e.preventDefault();
    onAgregar({
      id: Date.now(),
      tipo: tipo,
      descripcion: descripcion,
    });
    setTipo("");
    setDescripcion("");
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
        <option value="semáforo dañado">semáforo dañado</option>
        <option value="señalización">señalización</option>
        <option value="andén">andén</option>
        <option value="sumidero">sumidero</option>
      </select>

      <label htmlFor="descripcion">Descripción</label>

      <textarea
        id="descripcion"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      ></textarea>
      <button type="submit">Enviar Formulario</button>
    </form>
  );
}

export default FormularioReporte;
