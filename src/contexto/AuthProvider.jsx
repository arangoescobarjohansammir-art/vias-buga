import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";
import { AuthContexto } from "./auth.js";

async function cargarPerfil(uid) {
  const [perfil, datos] = await Promise.all([
    supabase.from("perfiles").select("rol").eq("id", uid).maybeSingle(),
    supabase
      .from("datos_personales")
      .select("nombre_completo,cedula,telefono")
      .eq("usuario_id", uid)
      .maybeSingle(),
  ]);
  return { uid, rol: perfil.data?.rol ?? "ciudadano", datos: datos.data ?? null };
}

// Mantiene la sesión de Supabase (anónima o con cuenta) y el rol de la persona.
function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(undefined); // undefined = todavía leyendo
  const [perfil, setPerfil] = useState({ uid: null, rol: "ciudadano", datos: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session ?? null));
    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const usuario = sesion?.user ?? null;
  const uid = usuario?.id ?? null;

  useEffect(() => {
    if (!uid) return undefined;
    let activo = true;
    cargarPerfil(uid)
      .catch(() => ({ uid, rol: "ciudadano", datos: null }))
      .then((p) => activo && setPerfil(p));
    return () => {
      activo = false;
    };
  }, [uid, version]);

  const perfilActual = perfil.uid === uid ? perfil : null;
  const cargando = sesion === undefined || (Boolean(uid) && !perfilActual);

  // Si no hay sesión, crea una anónima (sin pedir ningún dato).
  const asegurarSesion = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session.user;
    const { data: nueva, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return nueva.user;
  }, []);

  const iniciarSesion = useCallback(async (correo, clave) => {
    const { error } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: clave });
    if (error) throw error;
  }, []);

  // Los datos personales viajan en los metadatos; un trigger de la base de datos los
  // guarda en datos_personales (ver supabase/02_backend_final.sql).
  const registrar = useCallback(async ({ nombre, cedula, correo, telefono, clave }) => {
    const { data, error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: clave,
      options: {
        data: {
          nombre_completo: nombre.trim(),
          cedula: cedula.trim(),
          telefono: telefono.trim(),
          autorizo_datos: "true",
        },
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });
    if (error) throw error;
    if (data.user && data.user.identities?.length === 0) throw new Error("correo_ya_registrado");
    return { requiereConfirmacion: !data.session };
  }, []);

  const cerrarSesion = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const enviarRecuperacion = useCallback(async (correo) => {
    const { error } = await supabase.auth.resetPasswordForEmail(correo.trim(), {
      redirectTo: `${window.location.origin}/restablecer`,
    });
    if (error) throw error;
  }, []);

  const cambiarClave = useCallback(async (clave) => {
    const { error } = await supabase.auth.updateUser({ password: clave });
    if (error) throw error;
  }, []);

  const recargarPerfil = useCallback(() => setVersion((v) => v + 1), []);

  const valor = {
    cargando,
    usuario,
    uid,
    correo: usuario?.email ?? null,
    esAnonimo: usuario?.is_anonymous === true,
    rol: perfilActual?.rol ?? null,
    esAdmin: perfilActual?.rol === "administrador",
    datos: perfilActual?.datos ?? null,
    asegurarSesion,
    iniciarSesion,
    registrar,
    cerrarSesion,
    enviarRecuperacion,
    cambiarClave,
    recargarPerfil,
  };

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

export default AuthProvider;
