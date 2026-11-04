import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_BUGA } from "../../data/catalogos.js";

// Mapa de solo lectura: cada reporte es un punto del color de su estado.
// (El mapa para ELEGIR una ubicación sigue siendo components/Mapa.jsx.)

const iconos = new Map();

function iconoPara(estado, activo) {
  const clave = `${estado}-${activo}`;
  if (!iconos.has(clave)) {
    iconos.set(
      clave,
      L.divIcon({
        className: `marcador-estado${activo ? " activo" : ""}`,
        html: `<span style="background:var(--est-${estado}-dot)"></span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
    );
  }
  return iconos.get(clave);
}

// Leaflet solo mide su contenedor al crearse; esto lo vuelve a medir si cambia de tamaño.
function AjustarTamano() {
  const mapa = useMap();
  useEffect(() => {
    const observador = new ResizeObserver(() => mapa.invalidateSize());
    observador.observe(mapa.getContainer());
    return () => observador.disconnect();
  }, [mapa]);
  return null;
}

// Centra el mapa en el reporte seleccionado.
function IrAlSeleccionado({ reporte }) {
  const mapa = useMap();
  useEffect(() => {
    if (reporte) mapa.panTo([reporte.lat, reporte.lng], { animate: true });
  }, [mapa, reporte]);
  return null;
}

function MapaEstados({ reportes, seleccionado, onSeleccionar, zoom = 15 }) {
  const reporteSeleccionado = reportes.find((r) => r.ref === seleccionado);

  return (
    <div className="mapa-ajustable h-full w-full">
      <MapContainer center={CENTRO_BUGA} zoom={zoom} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reportes.map((reporte) => (
          <Marker
            key={reporte.ref}
            position={[reporte.lat, reporte.lng]}
            icon={iconoPara(reporte.estado, reporte.ref === seleccionado)}
            eventHandlers={{ click: () => onSeleccionar?.(reporte.ref) }}
            keyboard={false}
          />
        ))}
        <AjustarTamano />
        <IrAlSeleccionado reporte={reporteSeleccionado} />
      </MapContainer>
    </div>
  );
}

export default MapaEstados;
