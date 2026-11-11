// Carga comunas/barrios desde un GeoJSON (FeatureCollection de Polygon/MultiPolygon).
// NO se ejecuta en el navegador. Usa la clave service_role: guárdala SOLO en tu terminal.
//
// Uso (Git Bash):
//   export SUPABASE_URL="https://xxxx.supabase.co"
//   export SUPABASE_SERVICE_KEY="eyJ...service_role..."
//   node scripts/importar-territorio.mjs datos/barrios.geojson comuna barrio
//
// Argumentos: <archivo.geojson> <propiedad_de_la_zona> <propiedad_del_barrio>
// Ej.: si cada feature tiene properties { comuna: "Comuna 1", barrio: "Centro" }.
// El tipo de zona se envía como "comuna"; cámbialo con TIPO_ZONA=corregimiento.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [archivo, propZona, propBarrio] = process.argv.slice(2);
const { SUPABASE_URL, SUPABASE_SERVICE_KEY, TIPO_ZONA = "comuna" } = process.env;
if (!archivo || !propZona || !propBarrio || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Faltan argumentos o variables. Lee el encabezado de este archivo.");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
const geo = JSON.parse(readFileSync(archivo, "utf8"));
let n = 0;
for (const f of geo.features ?? []) {
  const zona = f.properties?.[propZona];
  const barrio = f.properties?.[propBarrio];
  if (!zona || !barrio || !f.geometry) { console.warn("Feature omitido (faltan datos)"); continue; }
  const { error } = await sb.rpc("importar_territorio", {
    p_tipo_zona: TIPO_ZONA, p_zona: String(zona), p_barrio: String(barrio), p_geometria: f.geometry,
  });
  if (error) { console.error(`Error en ${barrio}:`, error.message); process.exit(1); }
  n++;
}
const { data, error } = await sb.rpc("recalcular_territorio");
if (error) { console.error("Error al recalcular:", error.message); process.exit(1); }
console.log(`Importados ${n} barrios. Reportes reasignados: ${data}`);
