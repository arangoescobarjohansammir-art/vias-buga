import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import LayoutCiudadano from "./components/layout/LayoutCiudadano.jsx";
import LayoutAdmin from "./components/layout/LayoutAdmin.jsx";

// Cada pantalla se descarga solo cuando se visita (carga inicial rápida).
// Leaflet, por ejemplo, no se baja hasta que abres una pantalla con mapa.
const Bienvenida = lazy(() => import("./pages/Bienvenida.jsx"));
const Registro = lazy(() => import("./pages/Registro.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const NoEncontrada = lazy(() => import("./pages/NoEncontrada.jsx"));

const Inicio = lazy(() => import("./pages/ciudadano/Inicio.jsx"));
const MapaReportes = lazy(() => import("./pages/ciudadano/MapaReportes.jsx"));
const MisReportes = lazy(() => import("./pages/ciudadano/MisReportes.jsx"));
const Perfil = lazy(() => import("./pages/ciudadano/Perfil.jsx"));
const NuevoReporte = lazy(() => import("./pages/ciudadano/NuevoReporte.jsx"));
const ReporteEnviado = lazy(() => import("./pages/ciudadano/ReporteEnviado.jsx"));
const DetalleReporte = lazy(() => import("./pages/ciudadano/DetalleReporte.jsx"));

const Indicadores = lazy(() => import("./pages/admin/Indicadores.jsx"));
const GestionReportes = lazy(() => import("./pages/admin/GestionReportes.jsx"));
const DetalleAdmin = lazy(() => import("./pages/admin/DetalleAdmin.jsx"));
const AccesoRestringido = lazy(() => import("./pages/admin/AccesoRestringido.jsx"));

// Tu pantalla original (formulario + mapa conectados a Supabase), sin tocar.
const Laboratorio = lazy(() => import("./pages/Laboratorio.jsx"));

function Cargando() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-fondo" role="status" aria-label="Cargando">
      <span className="size-9 animate-spin rounded-full border-4 border-borde border-t-primario" />
    </div>
  );
}

// Al cambiar de pantalla, vuelve arriba.
function VolverArriba() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <VolverArriba />
      <Suspense fallback={<Cargando />}>
        <Routes>
          <Route path="/" element={<Bienvenida />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />

          {/* Ciudadano: con barra inferior en celular */}
          <Route path="/app" element={<LayoutCiudadano conPestanas />}>
            <Route index element={<Inicio />} />
            <Route path="mapa" element={<MapaReportes />} />
            <Route path="mis-reportes" element={<MisReportes />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          {/* Ciudadano: pantallas internas (sin barra inferior) */}
          <Route path="/app" element={<LayoutCiudadano />}>
            <Route path="reportar" element={<NuevoReporte />} />
            <Route path="reportar/enviado" element={<ReporteEnviado />} />
            <Route path="reporte/:ref" element={<DetalleReporte />} />
          </Route>

          {/* Indicadores públicos y administración */}
          <Route element={<LayoutAdmin />}>
            <Route path="/indicadores" element={<Indicadores />} />
            <Route path="/admin" element={<GestionReportes />} />
            <Route path="/admin/reporte/:ref" element={<DetalleAdmin />} />
            <Route path="/acceso-restringido" element={<AccesoRestringido />} />
          </Route>

          <Route path="/laboratorio" element={<Laboratorio />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
