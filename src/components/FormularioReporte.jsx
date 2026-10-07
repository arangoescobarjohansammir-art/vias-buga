import { useState } from "react";

function FormularioReporte() {
  const [Tipo, setTipo] = useState("selecciona...");
  const [Descripcion, setDescripcion] = useState("");

  const manejarEnvio = (e) => {
    e.preventDefault();
    console.log("Formulario enviado con éxito:");
    console.log("Tipo de daño:", Tipo);
    console.log("Descripción:", Descripcion);
  };
  return (
    <form onSubmit={manejarEnvio}>
      <label htmlFor="Tipo">Elige el Tipo de daño: </label>

      <select id="Tipo" value={Tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="selecciona...">selecciona...</option>
        <option value="hueco">hueco</option>
        <option value="semáforo dañado">semáforo dañado</option>
        <option value="señalización">señalización</option>
        <option value="andén">andén</option>
        <option value="sumidero">sumidero</option>
      </select>

      <label htmlFor="Descripcion">Descripcion</label>

      <textarea
        id="Descripcion"
        value={Descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      ></textarea>
      <button type="submit">Enviar Formulario</button>
    </form>
  );
}

export default FormularioReporte;
