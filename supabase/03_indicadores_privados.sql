-- Indicadores privados: solo el administrador puede calcularlos.
-- Ejecutar en el SQL Editor de Supabase (se puede repetir sin problema).

create or replace function public.indicadores_resumen(
  p_desde timestamptz default now() - interval '30 days',
  p_zona_id bigint default null
)
returns table (
  tipo tipo_dano,
  estado estado_reporte,
  total bigint,
  dias_promedio_resolucion numeric
)
language sql
stable
set search_path = public
as $$
  select r.tipo,
         r.estado,
         count(*)::bigint,
         round(avg(extract(epoch from (r.resuelto_en - r.creado_en)) / 86400.0)::numeric, 1)
  from public.reportes r
  left join public.barrios b on b.id = r.barrio_id
  where public.es_admin()
    and r.creado_en >= p_desde
    and (p_zona_id is null or b.zona_id = p_zona_id)
  group by r.tipo, r.estado;
$$;

revoke execute on function public.indicadores_resumen(timestamptz, bigint) from public, anon;
grant execute on function public.indicadores_resumen(timestamptz, bigint) to authenticated;

-- La vista de exportación tampoco es pública (la ven solo quienes están autenticados
-- y, por security_invoker, solo con los permisos que ya tengan sobre las tablas).
revoke select on public.v_reportes_exportacion from anon;

-- Comprobación: como anónimo debe devolver 0 filas.
--   set role anon; select count(*) from indicadores_resumen(now() - interval '1 year'); reset role;
