import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexto/auth.js";
import Cargando from "./ui/Cargando.jsx";

// Protege las pantallas de administración: sin sesión -> login; sin rol -> acceso restringido.
// (La seguridad real la imponen las políticas RLS de la base de datos; esto solo guía la interfaz.)
function RutaAdmin() {
  const { cargando, usuario, esAnonimo, esAdmin } = useAuth();
  const { pathname } = useLocation();

  if (cargando) return <Cargando />;
  if (!usuario || esAnonimo) return <Navigate to={`/login?siguiente=${encodeURIComponent(pathname)}`} replace />;
  if (!esAdmin) return <Navigate to="/acceso-restringido" replace />;
  return <Outlet />;
}

export default RutaAdmin;
