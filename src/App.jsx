import "./App.css";
import Encabezado from "./components/Encabezado.jsx";
import FormularioReporte from "./components/FormularioReporte.jsx";

function App() {
  return (
    <>
      <section id="center">
        <div>
          <Encabezado titulo="VíasBuga" />
        </div>
        <div>
          <FormularioReporte />
        </div>
      </section>
    </>
  );
}

export default App;
