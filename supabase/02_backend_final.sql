-- =====================================================================
-- VíasBuga · Migración 02 · Backend final
--
-- QUÉ ES
--   Complementa esquema_completo.sql (que ya ejecutaste). Es IDEMPOTENTE:
--   puedes correrla más de una vez sin que falle ni duplique nada.
--
-- QUÉ HACE
--   1. Endurece permisos: solo con sesión (anónima o registrada) se puede
--      crear un reporte, apoyar o subir fotos, y solo a los reportes propios.
--   2. Límite anti-spam: máximo 10 reportes por hora por usuario.
--   3. Registro: la cédula, el nombre y el teléfono se guardan en
--      datos_personales automáticamente al crear la cuenta.
--   4. Derechos del titular (Ley 1581): borrar datos personales o la cuenta.
--   5. Funciones para el panel de administración (cambio de estado en lote,
--      notas en el historial).
--   6. Utilidades para cargar comunas y barrios (se ejecutan una sola vez).
--
-- CÓMO EJECUTARLA
--   Supabase > SQL Editor > New query > pega TODO este archivo > Run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. Verificación: el esquema base debe existir
-- ---------------------------------------------------------------------
do $$
begin
  if to_regclass('public.reportes') is null
     or to_regclass('public.apoyos') is null
     or to_regclass('public.barrios') is null
     or to_regclass('public.fotos_reporte') is null
     or to_regprocedure('public.es_admin()') is null then
    raise exception
      'Falta el esquema base. Ejecuta primero esquema_completo.sql (todas las fases) y vuelve a correr este archivo.';
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 1. Reportes
-- ---------------------------------------------------------------------

-- Rectángulo alrededor de Guadalajara de Buga (el mismo que valida la app).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reportes_dentro_de_buga'
      and conrelid = 'public.reportes'::regclass
  ) then
    alter table public.reportes
      add constraint reportes_dentro_de_buga check (
        latitud between 3.53782 and 4.379
        and longitud between -76.49408 and -75.94905
      ) not valid;
  end if;
end $$;

-- Lectura pública (el mapa y los indicadores son abiertos).
drop policy if exists ver_reportes on public.reportes;
create policy ver_reportes on public.reportes
  for select to anon, authenticated using (true);

-- Crear reportes: solo con sesión, y quedan a nombre de quien los crea.
-- (La app inicia una sesión anónima automáticamente si la persona no tiene cuenta.)
revoke insert on table public.reportes from anon;
drop policy if exists crear_reportes on public.reportes;
create policy crear_reportes on public.reportes
  for insert to authenticated
  with check (estado = 'recibido' and usuario_id = (select auth.uid()));

-- Anti-spam: máximo 10 reportes por hora por persona (los administradores no tienen límite).
create or replace function public.limitar_reportes_por_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.usuario_id is not null
     and not public.es_admin()
     and (
       select count(*) from public.reportes r
       where r.usuario_id = new.usuario_id
         and r.creado_en > now() - interval '1 hour'
     ) >= 10 then
    raise exception 'Llegaste al límite de 10 reportes por hora. Inténtalo más tarde.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists reportes_limite_por_usuario on public.reportes;
create trigger reportes_limite_por_usuario
  before insert on public.reportes
  for each row execute function public.limitar_reportes_por_usuario();

create index if not exists apoyos_usuario_idx on public.apoyos (usuario_id);


-- ---------------------------------------------------------------------
-- 2. Fotos: solo el autor del reporte (15 min) o un administrador
-- ---------------------------------------------------------------------
revoke insert on table public.fotos_reporte from anon;

drop policy if exists adjuntar_foto_a_reporte_reciente on public.fotos_reporte;
create policy adjuntar_foto_a_reporte_reciente on public.fotos_reporte
  for insert to authenticated
  with check (
    tipo = 'antes'
    and not oculta
    and exists (
      select 1 from public.reportes r
      where r.id = reporte_id
        and r.usuario_id = (select auth.uid())
        and r.creado_en > now() - interval '15 minutes'
    )
    -- máximo 3 fotos "antes" por reporte
    and (
      select count(*) from public.fotos_reporte f
      where f.reporte_id = fotos_reporte.reporte_id and f.tipo = 'antes'
    ) < 3
  );

-- Storage: los archivos deben ir en una carpeta con el id de un reporte propio
-- (<reporte_id>/<archivo>), o ser de un administrador.
drop policy if exists subir_fotos_reportes on storage.objects;
create policy subir_fotos_reportes on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'fotos-reportes'
    and exists (
      select 1 from public.reportes r
      where r.id::text = (storage.foldername(name))[1]
        and (
          public.es_admin()
          or (
            r.usuario_id = (select auth.uid())
            and r.creado_en > now() - interval '15 minutes'
          )
        )
    )
  );


-- ---------------------------------------------------------------------
-- 3. Registro: datos personales automáticos al crear la cuenta
--    La app envía nombre, cédula, teléfono y autorización dentro de los
--    metadatos del registro; este trigger los pasa a datos_personales y los
--    borra de los metadatos (para que no queden duplicados).
-- ---------------------------------------------------------------------
create or replace function public.crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.perfiles (id) values (new.id);

  if meta ? 'cedula' then
    if coalesce(meta->>'autorizo_datos', '') <> 'true' then
      raise exception 'Debes autorizar el tratamiento de tus datos personales.';
    end if;

    begin
      insert into public.datos_personales (usuario_id, nombre_completo, cedula, telefono)
      values (
        new.id,
        trim(meta->>'nombre_completo'),
        trim(meta->>'cedula'),
        nullif(trim(coalesce(meta->>'telefono', '')), '')
      );
    exception
      when unique_violation then
        raise exception 'cedula_ya_registrada';
      when check_violation then
        raise exception 'datos_personales_invalidos';
    end;

    -- Los datos personales viven solo en datos_personales.
    begin
      update auth.users
      set raw_user_meta_data =
        raw_user_meta_data - 'nombre_completo' - 'cedula' - 'telefono' - 'autorizo_datos'
      where id = new.id;
    exception when others then
      null; -- si no se puede limpiar, el registro igual continúa
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_al_registrarse();


-- ---------------------------------------------------------------------
-- 4. Derechos del titular de los datos
-- ---------------------------------------------------------------------

-- Borrar nombre, cédula y teléfono (el reporte y la cuenta se conservan).
grant delete on table public.datos_personales to authenticated;
drop policy if exists borrar_mis_datos on public.datos_personales;
create policy borrar_mis_datos on public.datos_personales
  for delete to authenticated using (usuario_id = (select auth.uid()));

-- Eliminar la cuenta completa. Los reportes se conservan sin dueño
-- (usuario_id queda vacío); apoyos, avisos y datos personales se borran.
create or replace function public.eliminar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'No hay una sesión activa.';
  end if;
  if public.es_admin() then
    raise exception 'Una cuenta de administrador no se elimina desde la app.';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.eliminar_mi_cuenta() from public, anon;
grant execute on function public.eliminar_mi_cuenta() to authenticated;


-- ---------------------------------------------------------------------
-- 5. Panel de administración
-- ---------------------------------------------------------------------

-- Cambiar el estado de varios reportes a la vez (todo o nada).
create or replace function public.cambiar_estado_lote(
  p_ids uuid[],
  p_estado estado_reporte,
  p_observaciones text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_total integer := 0;
begin
  if not public.es_admin() then
    raise exception 'Solo los administradores pueden cambiar estados en lote.';
  end if;
  if coalesce(array_length(p_ids, 1), 0) > 500 then
    raise exception 'Máximo 500 reportes por operación.';
  end if;

  foreach v_id in array coalesce(p_ids, '{}'::uuid[]) loop
    perform public.cambiar_estado_reporte(v_id, p_estado, p_observaciones);
    v_total := v_total + 1;
  end loop;
  return v_total;
end;
$$;

revoke execute on function public.cambiar_estado_lote(uuid[], estado_reporte, text) from public, anon;
grant execute on function public.cambiar_estado_lote(uuid[], estado_reporte, text) to authenticated;

-- Agregar una nota al historial sin cambiar el estado.
create or replace function public.agregar_nota_reporte(p_reporte_id uuid, p_nota text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cuadrilla bigint;
  v_estado estado_reporte;
begin
  select cuadrilla_id, estado into v_cuadrilla, v_estado
  from public.reportes where id = p_reporte_id;
  if not found then
    raise exception 'Reporte no encontrado';
  end if;

  if not (
    public.es_admin()
    or (v_cuadrilla is not null and public.es_miembro_de(v_cuadrilla))
  ) then
    raise exception 'No tienes permiso para cambiar este reporte';
  end if;

  if nullif(trim(coalesce(p_nota, '')), '') is null or char_length(p_nota) > 500 then
    raise exception 'La nota debe tener entre 1 y 500 caracteres.';
  end if;

  insert into public.historial_estados
    (reporte_id, estado_anterior, estado_nuevo, cambiado_por, observaciones)
  values (p_reporte_id, v_estado, v_estado, auth.uid(), trim(p_nota));
end;
$$;

revoke execute on function public.agregar_nota_reporte(uuid, text) from public, anon;
grant execute on function public.agregar_nota_reporte(uuid, text) to authenticated;


-- ---------------------------------------------------------------------
-- 6. Comunas, corregimientos y barrios (se cargan UNA vez)
--    Usa el script scripts/importar-territorio.mjs con un archivo GeoJSON
--    oficial. Estas funciones solo las puede ejecutar la clave de servicio.
-- ---------------------------------------------------------------------
create or replace function public.importar_territorio(
  p_tipo_zona tipo_zona,
  p_zona text,
  p_barrio text,
  p_geometria jsonb
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_zona bigint;
  v_geom geometry := st_multi(st_setsrid(st_geomfromgeojson(p_geometria::text), 4326));
begin
  insert into public.zonas (nombre, tipo) values (p_zona, p_tipo_zona)
  on conflict (tipo, nombre) do update set nombre = excluded.nombre
  returning id into v_zona;

  insert into public.barrios (zona_id, nombre, geom) values (v_zona, p_barrio, v_geom)
  on conflict (zona_id, nombre) do update set geom = excluded.geom;
end;
$$;

-- Recalcula el barrio de todos los reportes y la geometría de cada zona.
create or replace function public.recalcular_territorio()
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actualizados integer;
begin
  update public.zonas z
  set geom = (
    select st_multi(st_union(b.geom))
    from public.barrios b
    where b.zona_id = z.id and b.geom is not null
  );

  update public.reportes r
  set barrio_id = (
    select b.id from public.barrios b
    where b.geom is not null
      and st_covers(b.geom, st_setsrid(st_makepoint(r.longitud, r.latitud), 4326))
    limit 1
  );
  get diagnostics v_actualizados = row_count;
  return v_actualizados;
end;
$$;

revoke execute on function public.importar_territorio(tipo_zona, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.recalcular_territorio() from public, anon, authenticated;
grant execute on function public.importar_territorio(tipo_zona, text, text, jsonb) to service_role;
grant execute on function public.recalcular_territorio() to service_role;


-- ---------------------------------------------------------------------
-- Listo. Comprobación rápida (debe devolver filas):
--   select polname from pg_policy where polname in
--     ('crear_reportes','borrar_mis_datos','subir_fotos_reportes');
-- ---------------------------------------------------------------------
