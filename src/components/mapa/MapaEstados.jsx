import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import { LocateFixed, LoaderCircle } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_BUGA, dentroDeBuga } from "../../data/catalogos.js";

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

// Punto azul de "tú estás aquí".
const iconoYo = L.divIcon({
  className: "",
  html:
    '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#7c3aed;' +
    'border:3px solid #fff;box-shadow:0 0 0 2px rgba(124,58,237,.35),0 2px 6px rgba(0,0,0,.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function mensajeGps(error) {
  if (error?.code === 1) {
    return "Permiso de ubicación denegado. Actívalo en la configuración del navegador para este sitio.";
  }
  if (error?.code === 3) return "Tardó demasiado en encontrarte. Inténtalo de nuevo al aire libre.";
  return "No pudimos obtener tu ubicación.";
}

function MapaEstados({ reportes, seleccionado, onSeleccionar, zoom = 15, conUbicacion = false }) {
  const reporteSeleccionado = reportes.find((r) => r.ref === seleccionado);
  const [mapa, setMapa] = useState(null);
  const [yo, setYo] = useState(null); // { lat, lng, precision }
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState("");
  const temporizador = useRef(null);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const avisar = (texto) => {
    setAviso(texto);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAviso(""), 6000);
  };

  // La ubicación solo se pide al tocar el botón, se usa para centrar el mapa y no se guarda.
  const irAMiUbicacion = () => {
    if (!mapa) return;
    if (!("geolocation" in navigator)) {
      avisar("Tu navegador no permite obtener la ubicación.");
      return;
    }
    setBuscando(true);
    setAviso("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBuscando(false);
        const punto = { lat: coords.latitude, lng: coords.longitude };
        if (!dentroDeBuga(punto)) {
          setYo(null);
          avisar("Parece que estás fuera de Guadalajara de Buga, así que dejamos el mapa en la ciudad.");
          return;
        }
        setYo({ ...punto, precision: coords.accuracy });
        mapa.flyTo([punto.lat, punto.lng], Math.max(mapa.getZoom(), 16), { duration: 0.8 });
      },
      (error) => {
        setBuscando(false);
        avisar(mensajeGps(error));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  return (
    <div className="mapa-ajustable relative h-full w-full">
      <MapContainer center={CENTRO_BUGA} zoom={zoom} scrollWheelZoom ref={setMapa}>
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
        {yo && (
          <>
            <Circle
              center={[yo.lat, yo.lng]}
              radius={Math.min(yo.precision ?? 0, 500)}
              pathOptions={{ color: "#7c3aed", weight: 1, fillOpacity: 0.12 }}
              interactive={false}
            />
            <Marker position={[yo.lat, yo.lng]} icon={iconoYo} interactive={false} keyboard={false} />
          </>
        )}
        <AjustarTamano />
        <IrAlSeleccionado reporte={reporteSeleccionado} />
      </MapContainer>

      {conUbicacion && (
        <>
          <button
            type="button"
            onClick={irAMiUbicacion}
            disabled={buscando}
            aria-label="Ir a mi ubicación"
            title="Ir a mi ubicación"
            className="absolute bottom-6 right-3 z-[1000] flex size-11 items-center justify-center rounded-full border border-borde bg-superficie text-texto shadow-flotante transition hover:bg-superficie-2 disabled:opacity-70"
          >
            {buscando ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <LocateFixed className="size-5" aria-hidden="true" />
            )}
          </button>
          {aviso && (
            <p
              role="status"
              className="absolute left-3 right-3 top-3 z-[1000] rounded-xl border border-borde bg-superficie px-3 py-2 text-sm text-texto-2 shadow-flotante"
            >
              {aviso}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default MapaEstados;
