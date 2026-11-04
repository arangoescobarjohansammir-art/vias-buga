// Catálogos que reflejan la base de datos (enums tipo_dano y estado_reporte).
// Las claves son EXACTAMENTE los valores del enum en Postgres.

export const TIPOS = {
  hueco: { etiqueta: "Hueco", plural: "Huecos" },
  semaforo_danado: { etiqueta: "Semáforo", plural: "Semáforos" },
  senalizacion: { etiqueta: "Señalización", plural: "Señalización" },
  anden: { etiqueta: "Andén", plural: "Andenes" },
  sumidero: { etiqueta: "Sumidero", plural: "Sumideros" },
};

export const ESTADOS = {
  recibido: { etiqueta: "Recibido", orden: 0 },
  en_revision: { etiqueta: "En revisión", orden: 1 },
  en_reparacion: { etiqueta: "En reparación", orden: 2 },
  resuelto: { etiqueta: "Resuelto", orden: 3 },
};

export const ORDEN_ESTADOS = ["recibido", "en_revision", "en_reparacion", "resuelto"];

// Mismo rectángulo que el CHECK "reportes_dentro_de_buga" de la base de datos.
export const LIMITES_BUGA = {
  latMin: 3.53782,
  latMax: 4.379,
  lngMin: -76.49408,
  lngMax: -75.94905,
};

// Leaflet usa [latitud, longitud].
export const CENTRO_BUGA = [3.9008, -76.2978];

export function dentroDeBuga({ lat, lng }) {
  return (
    lat >= LIMITES_BUGA.latMin &&
    lat <= LIMITES_BUGA.latMax &&
    lng >= LIMITES_BUGA.lngMin &&
    lng <= LIMITES_BUGA.lngMax
  );
}

// Distancia en metros entre dos puntos {lat, lng} (fórmula de Haversine).
export function distanciaMetros(a, b) {
  const R = 6371000;
  const rad = (grados) => (grados * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatearCoordenadas(lat, lng) {
  const ns = lat >= 0 ? "N" : "S";
  const eo = lng >= 0 ? "E" : "O";
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${eo}`;
}
