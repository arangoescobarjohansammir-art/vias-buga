import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import App from "../App.jsx"; // tu pantalla original, sin modificar

// Envuelve tu App.jsx original (formulario + mapa conectados a Supabase) con un estilo
// básico, para seguir probando la base de datos mientras construimos las pantallas finales.
function Laboratorio() {
  return (
    <div className="laboratorio mx-auto max-w-2xl px-4 py-8 text-texto">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-texto-2 hover:text-texto">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al inicio
      </Link>
      <p className="mb-6 rounded-xl border border-borde bg-superficie-2 p-3 text-sm text-texto-2">
        Pantalla de prueba: usa tu código original conectado a Supabase.
      </p>
      <App />
    </div>
  );
}

export default Laboratorio;
