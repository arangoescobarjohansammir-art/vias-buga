# VíasBuga

Plataforma web para que los habitantes de **Guadalajara de Buga** reporten daños en la infraestructura vial (huecos, semáforos, señalización, andenes y sumideros) con foto y ubicación en el mapa, consulten el estado de sus reportes y apoyen a la administración a priorizar el mantenimiento con información agregada.

> Proyecto ciudadano independiente, sin relación oficial con la Alcaldía.
> 🔗 Demo: _[(https://vias-buga.vercel.app/)]_

## Qué hace

**Ciudadanía**

- Reportar un daño con tipo, descripción, foto (hasta 3) y ubicación en el mapa o con el GPS.
- Avisar de posibles duplicados cercanos (25 m) y apoyar un reporte ya existente.
- Ver el mapa y la lista de reportes, filtrar por tipo y estado, e ir a "mi ubicación".
- Seguir cada reporte con su historial de estados y recibir avisos dentro de la app.
- Entrar sin cuenta (sesión anónima) o registrarse; borrar sus datos o eliminar su cuenta.

**Administración** (solo rol `administrador`)

- Panel con filtros, cambio de estado individual o en lote, asignación de cuadrillas, notas, foto del "después" y moderación de fotos.
- Indicadores (totales por tipo y estado, tiempo promedio de resolución) y exportación a CSV.

## Tecnologías

| Parte           | Tecnología                                                   |
| --------------- | ------------------------------------------------------------ |
| Frontend        | React 19 + Vite, Tailwind CSS v4, React Router, lucide-react |
| Backend y datos | Supabase: Postgres + PostGIS, Auth, Storage, RLS             |
| Mapa            | Leaflet + OpenStreetMap                                      |
| Anti-bots       | Cloudflare Turnstile                                         |
| Hosting         | Vercel (frontend) + Supabase                                 |

Las decisiones técnicas y sus motivos están documentadas en el registro de decisiones del proyecto.

## Estructura

```
src/
  components/   piezas reutilizables (mapa, layouts, UI)
  contexto/     sesión y rol (AuthProvider)
  hooks/        useConsulta
  pages/        pantallas (ciudadano/, admin/)
  servicios/    acceso a Supabase, fotos, errores, captcha
  data/         catálogos y exportación CSV
supabase/       scripts SQL de la base de datos
scripts/        utilidades (importar comunas y barrios)
```

## Puesta en marcha

Requisitos: Node.js 20+ y un proyecto de [Supabase](https://supabase.com).

1. **Base de datos** — en el SQL Editor de Supabase ejecuta, en orden:
   1. el esquema base (`esquema_completo.sql`)
   2. `supabase/02_backend_final.sql`
   3. `supabase/03_indicadores_privados.sql`
2. **Supabase → Authentication:** activa _Allow anonymous sign-ins_, configura Site URL y Redirect URLs (local y producción), y verifica el bucket público `fotos-reportes`.
3. **Variables de entorno** — copia `.env.example` a `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_KEY=...        # clave anon/publishable
   VITE_TURNSTILE_SITE_KEY=...  # opcional; obligatoria si activas CAPTCHA en Supabase
   ```
4. **Instalar y correr:**
   ```bash
   npm install
   npm run dev
   ```
5. **Primer administrador:** regístrate y, en el SQL Editor:
   ```sql
   update perfiles set rol = 'administrador'
   where id = (select id from auth.users where email = 'TU_CORREO');
   ```

Más detalle en `GUIA_LANZAMIENTO.md`.

## Despliegue

Importa el repositorio en Vercel (framework Vite), define las variables `VITE_*` y despliega. `vercel.json` ya resuelve las rutas de la SPA y añade cabeceras de seguridad.

## Seguridad

- La seguridad real está en la base de datos (RLS y funciones), no en el frontend.
- Nunca subas `.env` ni uses la clave `service_role` en el navegador.
- Límites: 10 reportes por hora por usuario, fotos reducidas y sin metadatos GPS, coordenadas restringidas al área de Buga.
- Datos personales en tabla aparte, visibles solo para su dueño.

## Limitaciones conocidas

- Los reportes hechos como anónimo no se transfieren al registrarse.
- Comunas y barrios requieren cargar la cartografía oficial (ver `scripts/importar-territorio.mjs`).
- El panel carga hasta 1000 reportes; el rol `operario` existe en la base pero no en la interfaz.
- PWA instalable: pendiente.

## Licencia

**Copyright © 2026 Johan Sammir Arango Escobar. Todos los derechos reservados.**
El código se publica para consulta; no se permite copiarlo, modificarlo, distribuirlo ni usarlo comercialmente sin autorización por escrito. Ver [LICENSE](./LICENSE).

## Contacto

Autor: Johan Sammir Arango Escobar — _[https://github.com/arangoescobarjohansammir-art]_
