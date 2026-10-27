import "./App.css";
import Encabezado from "./components/Encabezado.jsx";
import FormularioReporte from "./components/FormularioReporte.jsx";
import { useState } from "react";
import Mapa from "./components/Mapa.jsx";
import { supabase } from "./supabaseClient.js";

function App() {
  const [reportes, setReportes] = useState([]);
  const [ubicacion, setUbicacion] = useState(null);

  const agregarReporte = async (nuevo) => {
    try {
      const { data, error } = await supabase
        .from("reportes")
        .insert([
          {
            tipo: nuevo.tipo,
            descripcion: nuevo.descripcion,
            latitud: nuevo.latitud,
            longitud: nuevo.longitud,
          },
        ])
        .select();

      if (error) throw error;

      const reporteCreado = data[0];

      setReportes((anterior) => [...anterior, reporteCreado]);

      return true;
    } catch (error) {
      console.error("Error al guardar en Supabase:", error.message);

      return false;
    }
  };

  return (
    <>
      <section id="center">
        <div>
          <Encabezado titulo="VíasBuga" />
        </div>
        <div>
          <FormularioReporte
            onAgregar={agregarReporte}
            ubicacion={ubicacion}
            onLimpiarUbicacion={() => setUbicacion(null)}
          />
        </div>
        <div style={{ width: "100%" }}>
          <Mapa
            ubicacion={ubicacion}
            onSeleccionar={setUbicacion}
            reportes={reportes}
          />
          <p>
            {ubicacion
              ? `Ubicación elegida: ${ubicacion.lat.toFixed(5)}, ${ubicacion.lng.toFixed(5)}`
              : "Toca el mapa para marcar el daño"}
          </p>
        </div>
        <ul>
          {reportes.map((reporte) => (
            <li key={reporte.id}>
              <div>
                <strong>Tipo:</strong> {reporte.tipo}
              </div>
              <div>
                <strong>Descripción:</strong> {reporte.descripcion}
              </div>
              <div>
                <strong>Latitud:</strong> {reporte.latitud.toFixed(5)}
              </div>
              <div>
                <strong>Longitud:</strong> {reporte.longitud.toFixed(5)}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default App;
