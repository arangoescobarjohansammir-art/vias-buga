import "./App.css";
import Encabezado from "./components/Encabezado.jsx";
import FormularioReporte from "./components/FormularioReporte.jsx";
import { useState } from "react";
import Mapa from "./components/Mapa.jsx";

function App() {
  const [reportes, setReportes] = useState([]);
  const [ubicacion, setUbicacion] = useState(null);

  const agregarReporte = (nuevo) => {
    setReportes([...reportes, nuevo]);
  };

  return (
    <>
      <section id="center">
        <div>
          <Encabezado titulo="VíasBuga" />
        </div>
        <div>
          <FormularioReporte onAgregar={agregarReporte} />
        </div>
        <div style={{ width: "100%" }}>
          <Mapa ubicacion={ubicacion} onSeleccionar={setUbicacion} />
          <p>
            {ubicacion
              ? `Ubicación elegida: ${ubicacion.lat.toFixed(5)}, ${ubicacion.lng.toFixed(5)}`
              : "Toca el mapa para marcar el daño"}
          </p>
        </div>
        <ul>
          {reportes.map((reporte) => (
            <li key={reporte.id}>
              {reporte.tipo}: {reporte.descripcion}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default App;
