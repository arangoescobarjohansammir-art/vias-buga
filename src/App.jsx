import "./App.css";
import Encabezado from "./components/Encabezado.jsx";
import FormularioReporte from "./components/FormularioReporte.jsx";
import { useState } from "react";

function App() {
  const [reportes, setReportes] = useState([]);
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
