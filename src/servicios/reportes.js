import { supabase } from "../supabaseClient.js";
import { diasEntre, fechaCorta, haceTiempo } from "./formato.js";
import { urlFoto } from "./fotos.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Columnas que se piden de cada reporte (con el barrio, la comuna y la cuadrilla ya unidos).
const COLUMNAS =
  "id,tipo,estado,descripcion,latitud,longitud,creado_en,actualizado_en,resuelto_en," +
  "total_apoyos,usuario_id,cuadrilla_id," +
  "barrios(id,nombre,zonas(id,nombre,tipo)),cuadrillas(id,nombre)";

function lanzar(error) {
  if (error) throw error;
}

// Fila de la base de datos -> objeto que usan las pantallas.
export function aReporte(fila) {
  const zona = fila.barrios?.zonas ?? null;
  return {
    ref: fila.id,
    refCorta: fila.id.slice(0, 8),
    tipo: fila.tipo,
    estado: fila.estado,
    descripcion: fila.descripcion,
    lat: fila.latitud,
    lng: fila.longitud,
    barrio: fila.barrios?.nombre ?? null,
    comuna: zona?.nombre ?? null,
    zonaId: zona?.id ?? null,
    apoyos: fila.total_apoyos ?? 0,
    cuadrilla: fila.cuadrillas?.nombre ?? null,
    cuadrillaId: fila.cuadrilla_id ?? null,
    usuarioId: fila.usuario_id ?? null,
    creadoEn: fila.creado_en,
    fecha: fechaCorta(fila.creado_en),
    hace: haceTiempo(fila.creado_en),
    actualizado: haceTiempo(fila.actualizado_en),
    resueltoEn: fila.resuelto_en ? fechaCorta(fila.resuelto_en) : null,
    resueltoIso: fila.resuelto_en ?? null,
    diasParaResolver: fila.resuelto_en ? diasEntre(fila.creado_en, fila.resuelto_en) : null,
  };
}

export const etiquetaUbicacion = (reporte) =>
  reporte.barrio ? `Barrio ${reporte.barrio}` : "Ubicación en el mapa";

/* ------------------------------- Lectura ------------------------------- */

export async function listarReportes({ limite = 500, desde = null } = {}) {
  let consulta = supabase
    .from("reportes")
    .select(COLUMNAS)
    .order("creado_en", { ascending: false })
    .limit(limite);
  if (desde) consulta = consulta.gte("creado_en", desde);
  const { data, error } = await consulta;
  lanzar(error);
  return data.map(aReporte);
}

export async function listarZonas() {
  const { data, error } = await supabase.from("zonas").select("id,nombre,tipo").order("nombre");
  lanzar(error);
  return data;
}

// Reporte + línea de tiempo + fotos + si la persona actual ya lo apoyó.
export async function obtenerReporte(id, uid = null) {
  if (!UUID.test(id)) return null;

  const { data: fila, error } = await supabase
    .from("reportes")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle();
  lanzar(error);
  if (!fila) return null;

  const [historial, fotos, apoyo] = await Promise.all([
    supabase
      .from("historial_estados")
      .select("id,estado_anterior,estado_nuevo,observaciones,creado_en")
      .eq("reporte_id", id)
      .order("creado_en", { ascending: true })
      .order("id", { ascending: true }),
    supabase
      .from("fotos_reporte")
      .select("id,tipo,ruta,oculta,creado_en")
      .eq("reporte_id", id)
      .order("creado_en", { ascending: true }),
    uid
      ? supabase.from("apoyos").select("reporte_id").eq("reporte_id", id).eq("usuario_id", uid).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  lanzar(historial.error);
  lanzar(fotos.error);
  lanzar(apoyo.error);

  return {
    reporte: aReporte(fila),
    historial: historial.data.map((h) => ({
      id: h.id,
      estado: h.estado_nuevo,
      esNota: h.estado_anterior === h.estado_nuevo,
      fecha: fechaCorta(h.creado_en),
      nota: h.observaciones ?? (h.estado_anterior ? "Estado actualizado" : "Reporte registrado"),
    })),
    fotos: fotos.data.map((f) => ({ id: f.id, tipo: f.tipo, oculta: f.oculta, url: urlFoto(f.ruta) })),
    apoyado: Boolean(apoyo.data),
  };
}

export async function misReportes(uid) {
  const { data, error } = await supabase
    .from("reportes")
    .select(COLUMNAS)
    .eq("usuario_id", uid)
    .order("creado_en", { ascending: false })
    .limit(200);
  lanzar(error);
  return data.map(aReporte);
}

export async function misApoyados(uid) {
  const { data, error } = await supabase
    .from("apoyos")
    .select(`creado_en,reportes(${COLUMNAS})`)
    .eq("usuario_id", uid)
    .order("creado_en", { ascending: false })
    .limit(200);
  lanzar(error);
  return data.filter((fila) => fila.reportes).map((fila) => aReporte(fila.reportes));
}

/* ------------------------------- Escritura ------------------------------- */

export async function crearReporte({ tipo, descripcion, lat, lng }) {
  const { data, error } = await supabase
    .from("reportes")
    .insert({ tipo, descripcion: descripcion.trim(), latitud: lat, longitud: lng })
    .select("id")
    .single();
  lanzar(error);
  return data.id;
}

// Reportes del mismo tipo, sin resolver, a menos de 25 m (función de la base de datos).
export async function reportesCercanos({ lat, lng, tipo, metros = 25 }) {
  const { data, error } = await supabase.rpc("reportes_cercanos", {
    p_latitud: lat,
    p_longitud: lng,
    p_tipo: tipo,
    p_metros: metros,
  });
  lanzar(error);
  return data.map((fila) => ({
    ref: fila.reporte_id,
    refCorta: fila.reporte_id.slice(0, 8),
    tipo: fila.tipo,
    estado: fila.estado,
    descripcion: fila.descripcion,
    distancia: Math.round(fila.distancia_m),
    apoyos: fila.total_apoyos,
  }));
}

export async function apoyarReporte(reporteId) {
  const { error } = await supabase.from("apoyos").insert({ reporte_id: reporteId });
  if (error && error.code !== "23505") throw error; // 23505 = ya lo había apoyado
}

export async function quitarApoyo(reporteId, uid) {
  const { error } = await supabase.from("apoyos").delete().eq("reporte_id", reporteId).eq("usuario_id", uid);
  lanzar(error);
}

/* ------------------------------- Avisos ------------------------------- */

export async function avisosSinLeer(uid) {
  const { data, error } = await supabase
    .from("notificaciones")
    .select("reporte_id")
    .eq("usuario_id", uid)
    .eq("leida", false);
  lanzar(error);
  return new Set(data.map((fila) => fila.reporte_id));
}

export async function contarAvisos() {
  const { count, error } = await supabase
    .from("notificaciones")
    .select("id", { count: "exact", head: true })
    .eq("leida", false);
  lanzar(error);
  return count ?? 0;
}

export async function marcarAvisosLeidos(reporteId) {
  const { error } = await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("reporte_id", reporteId)
    .eq("leida", false);
  lanzar(error);
}

/* ------------------------------- Perfil ------------------------------- */

export async function actualizarDatosPersonales(uid, { nombre, telefono }) {
  const { data, error } = await supabase
    .from("datos_personales")
    .update({ nombre_completo: nombre.trim(), telefono: telefono.trim() || null })
    .eq("usuario_id", uid)
    .select("usuario_id");
  lanzar(error);
  if (!data?.length) throw new Error("No se pudo guardar el perfil.");
}

export async function borrarDatosPersonales(uid) {
  const { error } = await supabase.from("datos_personales").delete().eq("usuario_id", uid);
  lanzar(error);
}

export async function eliminarMiCuenta() {
  const { error } = await supabase.rpc("eliminar_mi_cuenta");
  lanzar(error);
}

/* ------------------------------- Administración ------------------------------- */

export async function listarCuadrillas() {
  const { data, error } = await supabase
    .from("cuadrillas")
    .select("id,nombre,activa")
    .eq("activa", true)
    .order("nombre");
  lanzar(error);
  return data;
}

export async function crearCuadrilla(nombre) {
  const { error } = await supabase.from("cuadrillas").insert({ nombre: nombre.trim() });
  lanzar(error);
}

export async function asignarCuadrilla(ids, cuadrillaId) {
  const { data, error } = await supabase
    .from("reportes")
    .update({ cuadrilla_id: cuadrillaId })
    .in("id", ids)
    .select("id");
  lanzar(error);
  if (data.length !== ids.length) throw new Error("No tienes permiso para asignar cuadrillas.");
}

export async function cambiarEstado(id, estado, observaciones = null) {
  const { error } = await supabase.rpc("cambiar_estado_reporte", {
    p_reporte_id: id,
    p_estado: estado,
    p_observaciones: observaciones,
  });
  lanzar(error);
}

export async function cambiarEstadoLote(ids, estado, observaciones = null) {
  const { error } = await supabase.rpc("cambiar_estado_lote", {
    p_ids: ids,
    p_estado: estado,
    p_observaciones: observaciones,
  });
  lanzar(error);
}

export async function agregarNota(id, nota) {
  const { error } = await supabase.rpc("agregar_nota_reporte", { p_reporte_id: id, p_nota: nota });
  lanzar(error);
}

export async function ocultarFoto(fotoId, oculta) {
  const { data, error } = await supabase
    .from("fotos_reporte")
    .update({ oculta })
    .eq("id", fotoId)
    .select("id");
  lanzar(error);
  if (!data?.length) throw new Error("No tienes permiso para moderar fotos.");
}

export async function indicadoresResumen({ desde, zonaId = null }) {
  const { data, error } = await supabase.rpc("indicadores_resumen", {
    p_desde: desde,
    p_zona_id: zonaId,
  });
  lanzar(error);
  return data;
}
