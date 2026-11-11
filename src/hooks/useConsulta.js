import { useCallback, useEffect, useRef, useState } from "react";

// Ejecuta una función asíncrona (por ejemplo, pedir datos a Supabase) y entrega
// { datos, error, cargando, recargar }. Se vuelve a ejecutar cuando cambian las dependencias.
// Mientras se recarga con las mismas dependencias, conserva los datos anteriores (sin parpadeos).
export function useConsulta(funcion, dependencias = []) {
  const [version, setVersion] = useState(0);
  const [resultado, setResultado] = useState({ clave: null, base: null, datos: null, error: null });
  const funcionRef = useRef(funcion);

  const base = JSON.stringify(dependencias);
  const clave = `${version}|${base}`;

  useEffect(() => {
    funcionRef.current = funcion;
  });

  useEffect(() => {
    let activo = true;
    funcionRef
      .current()
      .then((datos) => activo && setResultado({ clave, base, datos, error: null }))
      .catch((error) => activo && setResultado({ clave, base, datos: null, error }));
    return () => {
      activo = false;
    };
  }, [clave, base]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const vigente = resultado.clave === clave;

  return {
    datos: vigente || resultado.base === base ? resultado.datos : null,
    error: vigente ? resultado.error : null,
    cargando: !vigente,
    recargar,
  };
}
