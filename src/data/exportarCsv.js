import { ESTADOS, TIPOS } from "./catalogos.js";

const comillas = (valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`;

// Descarga los reportes como CSV (el BOM inicial hace que Excel respete las tildes).
// Más adelante saldrá de la vista v_reportes_exportacion de la base de datos.
export function descargarCsv(reportes, nombre = "reportes-viasbuga.csv") {
  const encabezado = ["Ref", "Tipo", "Estado", "Barrio", "Comuna", "Latitud", "Longitud", "Fecha", "Cuadrilla", "Apoyos"];
  const filas = reportes.map((r) => [
    r.ref,
    TIPOS[r.tipo].etiqueta,
    ESTADOS[r.estado].etiqueta,
    r.barrio,
    r.comuna,
    r.lat,
    r.lng,
    r.fecha,
    r.cuadrilla ?? "Sin asignar",
    r.apoyos,
  ]);
  const texto = [encabezado, ...filas].map((fila) => fila.map(comillas).join(",")).join("\n");

  const url = URL.createObjectURL(new Blob(["﻿" + texto], { type: "text/csv;charset=utf-8" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
