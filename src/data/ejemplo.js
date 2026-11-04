// DATOS DE EJEMPLO para maquetar las pantallas. No vienen de la base de datos.
// Cuando conectemos Supabase, cada pantalla reemplaza esto por datos reales.

export const REPORTES = [
  {
    ref: "3f9a1c",
    tipo: "hueco",
    estado: "en_reparacion",
    barrio: "Centro",
    comuna: "Comuna 1",
    lat: 3.9009,
    lng: -76.2978,
    descripcion:
      "Hueco profundo en el carril derecho, peligroso para motos y bicicletas.",
    fecha: "2 oct",
    hace: "hace 8 días",
    apoyos: 12,
    cuadrilla: "Cuadrilla A · Zona Norte",
    ultimaNota: "Cuadrilla en sitio",
    historial: [
      { estado: "recibido", fecha: "2 oct", nota: "Tu reporte quedó registrado" },
      { estado: "en_revision", fecha: "3 oct", nota: "Se verificó el daño en sitio" },
      { estado: "en_reparacion", fecha: "6 oct", nota: "Cuadrilla asignada" },
    ],
  },
  {
    ref: "8d2b91",
    tipo: "semaforo_danado",
    estado: "en_revision",
    barrio: "San Pedro",
    comuna: "Comuna 2",
    lat: 3.9041,
    lng: -76.3012,
    descripcion: "El semáforo de la esquina no enciende ninguna luz desde ayer.",
    fecha: "5 oct",
    hace: "hace 5 días",
    apoyos: 3,
    cuadrilla: null,
    ultimaNota: "Reinspección programada",
    historial: [
      { estado: "recibido", fecha: "5 oct", nota: "Tu reporte quedó registrado" },
      { estado: "en_revision", fecha: "5 oct", nota: "Reinspección programada" },
    ],
  },
  {
    ref: "4e7a09",
    tipo: "sumidero",
    estado: "recibido",
    barrio: "Río Cañaveral",
    comuna: "Comuna 3",
    lat: 3.8973,
    lng: -76.2945,
    descripcion: "Sumidero tapado, se inunda toda la esquina cuando llueve.",
    fecha: "7 oct",
    hace: "hoy",
    apoyos: 1,
    cuadrilla: null,
    ultimaNota: "Ingreso cívico",
    historial: [
      { estado: "recibido", fecha: "7 oct", nota: "Tu reporte quedó registrado" },
    ],
  },
  {
    ref: "1a8c54",
    tipo: "anden",
    estado: "resuelto",
    barrio: "El Milagroso",
    comuna: "Comuna 3",
    lat: 3.9015,
    lng: -76.305,
    descripcion: "Andén roto por las raíces de un árbol, difícil para sillas de ruedas.",
    fecha: "29 sep",
    hace: "hace 11 días",
    apoyos: 5,
    cuadrilla: "Cuadrilla B · Zona Sur",
    ultimaNota: "Cerrado con acta",
    resueltoEn: "10 oct",
    diasParaResolver: 11,
    historial: [
      { estado: "recibido", fecha: "29 sep", nota: "Tu reporte quedó registrado" },
      { estado: "en_revision", fecha: "1 oct", nota: "Se verificó el daño en sitio" },
      { estado: "en_reparacion", fecha: "4 oct", nota: "Cuadrilla B · Zona Sur" },
      { estado: "resuelto", fecha: "10 oct", nota: "Reparación registrada con foto" },
    ],
  },
  {
    ref: "7c3d2e",
    tipo: "senalizacion",
    estado: "en_revision",
    barrio: "Aures",
    comuna: "Comuna 4",
    lat: 3.9062,
    lng: -76.299,
    descripcion: "La señal de PARE está derribada y nadie respeta el cruce.",
    fecha: "6 oct",
    hace: "hace 4 días",
    apoyos: 2,
    cuadrilla: "Cuadrilla C · Corregimientos",
    ultimaNota: "Material pedido",
    historial: [
      { estado: "recibido", fecha: "6 oct", nota: "Tu reporte quedó registrado" },
      { estado: "en_revision", fecha: "7 oct", nota: "Material pedido" },
    ],
  },
  {
    ref: "5b21de",
    tipo: "hueco",
    estado: "recibido",
    barrio: "Centro",
    comuna: "Comuna 1",
    lat: 3.8995,
    lng: -76.3005,
    descripcion: "Varios huecos seguidos frente a la panadería.",
    fecha: "7 oct",
    hace: "hoy",
    apoyos: 0,
    cuadrilla: null,
    ultimaNota: "Ingreso cívico",
    historial: [
      { estado: "recibido", fecha: "7 oct", nota: "Tu reporte quedó registrado" },
    ],
  },
];

export function buscarReporte(ref) {
  return REPORTES.find((r) => r.ref === ref);
}

// Qué reportes creó / apoyó la persona del ejemplo (pantalla "Mis reportes").
export const MIS_CREADOS = ["3f9a1c", "8d2b91", "4e7a09", "1a8c54"];
export const MIS_APOYADOS = ["7c3d2e", "5b21de"];

export const CUADRILLAS = [
  "Cuadrilla A · Zona Norte",
  "Cuadrilla B · Zona Sur",
  "Cuadrilla C · Corregimientos",
];

export const COMUNAS = ["Comuna 1", "Comuna 2", "Comuna 3", "Comuna 4", "Corregimientos"];

export const PERIODOS = ["Últimos 30 días", "Últimos 90 días", "Este año"];

// Indicadores del dashboard público (ejemplo).
export const INDICADORES = {
  total: 248,
  resueltos: 91,
  pendientes: 157,
  diasPromedio: 9,
  porTipo: [
    { tipo: "hueco", total: 112 },
    { tipo: "senalizacion", total: 44 },
    { tipo: "anden", total: 38 },
    { tipo: "semaforo_danado", total: 31 },
    { tipo: "sumidero", total: 23 },
  ],
  porEstado: [
    { estado: "recibido", total: 38 },
    { estado: "en_revision", total: 52 },
    { estado: "en_reparacion", total: 67 },
    { estado: "resuelto", total: 91 },
  ],
};

export const PERFIL_EJEMPLO = {
  nombre: "Carlos Mendoza",
  correo: "carlos.mendoza@correo.com",
  telefono: "315 889 0142",
  cedula: "1.115.849.201",
};
