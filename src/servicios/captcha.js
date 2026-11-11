// Cloudflare Turnstile en modo "interaction-only": casi siempre es invisible y solo
// muestra un recuadro si Cloudflare necesita comprobar que eres una persona.
// Si no defines VITE_TURNSTILE_SITE_KEY, el captcha queda apagado (obtenerTokenCaptcha
// devuelve undefined) y la app funciona igual: úsalo solo si en Supabase el CAPTCHA
// también está desactivado.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let cargaScript = null;
function cargarScript() {
  if (window.turnstile) return Promise.resolve();
  if (!cargaScript) {
    cargaScript = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        cargaScript = null;
        reject(new Error("captcha_no_carga"));
      };
      document.head.appendChild(s);
    });
  }
  return cargaScript;
}

export const captchaActivo = Boolean(SITE_KEY);

// Cada token sirve para UNA sola operación: se pide uno nuevo en cada intento.
export async function obtenerTokenCaptcha() {
  if (!SITE_KEY) return undefined;
  await cargarScript();

  return new Promise((resolve, reject) => {
    const caja = document.createElement("div");
    caja.style.cssText =
      "position:fixed;inset:0;display:none;align-items:center;justify-content:center;" +
      "background:rgba(0,0,0,.45);z-index:9999";
    const interior = document.createElement("div");
    caja.appendChild(interior);
    document.body.appendChild(caja);

    let widgetId;
    const terminar = (fn, valor) => {
      clearTimeout(limite);
      try {
        if (widgetId !== undefined) window.turnstile.remove(widgetId);
      } catch {
        /* ya no existe */
      }
      caja.remove();
      fn(valor);
    };
    const limite = setTimeout(() => terminar(reject, new Error("captcha_timeout")), 120000);

    widgetId = window.turnstile.render(interior, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      callback: (token) => terminar(resolve, token),
      "error-callback": () => terminar(reject, new Error("captcha_error")),
      "timeout-callback": () => terminar(reject, new Error("captcha_timeout")),
      "before-interactive-callback": () => {
        caja.style.display = "flex";
      },
      "after-interactive-callback": () => {
        caja.style.display = "none";
      },
    });
  });
}
