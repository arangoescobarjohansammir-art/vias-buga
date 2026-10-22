import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function SeleccionarUbicacion({ onSeleccionar }) {
  useMapEvents({ click: (e) => onSeleccionar(e.latlng) });
  return null;
}

function Mapa({ ubicacion, onSeleccionar, reportes }) {
  const centroBuga = [3.9008, -76.2978]; // [latitud, longitud]

  return (
    <MapContainer
      center={centroBuga}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reportes.map((reporte) => (
        <Marker key={reporte.id} position={[reporte.latitud, reporte.longitud]}>
          <Popup>
            <strong>Tipo:</strong> {reporte.tipo} <br />
            <strong>Descripción:</strong> {reporte.descripcion}
          </Popup>
        </Marker>
      ))}
      <SeleccionarUbicacion onSeleccionar={onSeleccionar} />
      {ubicacion && (
        <Marker
          icon={iconoSeleccion}
          position={[ubicacion.lat, ubicacion.lng]}
        />
      )}
    </MapContainer>
  );
}

const iconoSeleccion = L.divIcon({
  className: "pin-seleccion",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default Mapa;
