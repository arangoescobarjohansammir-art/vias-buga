import { useState } from "react";

const CLAVE = "viasbuga-tema";

// El tema se aplica con una clase en <html>. El script de index.html ya la puso
// antes de pintar; aquí solo la leemos y permitimos alternarla.
export function useTema() {
  const [oscuro, setOscuro] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const alternar = () => {
    const siguiente = !oscuro;
    document.documentElement.classList.toggle("dark", siguiente);
    try {
      localStorage.setItem(CLAVE, siguiente ? "oscuro" : "claro");
    } catch {
      // Sin almacenamiento (modo privado): el tema solo dura esta visita.
    }
    setOscuro(siguiente);
  };

  return { oscuro, alternar };
}
