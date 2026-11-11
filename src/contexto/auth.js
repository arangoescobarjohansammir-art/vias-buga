import { createContext, useContext } from "react";

// Contexto de sesión. El proveedor está en AuthProvider.jsx.
export const AuthContexto = createContext(null);

export function useAuth() {
  const contexto = useContext(AuthContexto);
  if (!contexto) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return contexto;
}
