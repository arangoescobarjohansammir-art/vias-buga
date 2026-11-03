

create type tipo_dano as enum ('hueco','semaforo_danado','senalizacion','anden','sumidero');
create type estado_reporte as enum ('recibido','en_revision','en_reparacion','resuelto');

create table reportes (
  id uuid primary key default gen_random_uuid(),
  tipo tipo_dano not null,
  estado estado_reporte not null default 'recibido',
  descripcion text not null check (char_length(trim(descripcion)) between 1 and 500),
  latitud double precision not null check (latitud between -90 and 90),
  longitud double precision not null check (longitud between -180 and 180),
  creado_en timestamptz not null default now()
);

alter table reportes enable row level security;

   create policy "Permitir lectura pública de reportes" on reportes
     for select to anon, authenticated using (true);





alter table reportes drop constraint if exists reportes_descripcion_check;
alter table reportes add constraint reportes_descripcion_valida
  check (char_length(trim(descripcion)) >= 1 and char_length(descripcion) <= 500);


alter table reportes add constraint reportes_dentro_de_buga check (
  latitud between 3.53782 and 4.37900
  and longitud between -76.49408 and -75.94905
);


revoke all on table reportes from anon, authenticated;
grant select on table reportes to anon, authenticated;
grant insert (tipo, descripcion, latitud, longitud) on table reportes to anon, authenticated;

drop policy if exists "Permitir inserción a usuarios anónimos y autenticados" on reportes;
create policy "crear_reportes" on reportes
  for insert to anon, authenticated
  with check (estado = 'recibido');



create type tipo_foto as enum ('antes', 'despues');


insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-reportes', 'fotos-reportes', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "subir_fotos_reportes" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'fotos-reportes');

create table fotos_reporte (
  id uuid primary key default gen_random_uuid(),
  reporte_id uuid not null references reportes(id) on delete cascade,
  tipo tipo_foto not null default 'antes',
  ruta text not null,
  subida_por uuid references auth.users(id) on delete set null default auth.uid(),
  oculta boolean not null default false,
  creado_en timestamptz not null default now()
);

create index fotos_reporte_reporte_idx on fotos_reporte (reporte_id);

alter table fotos_reporte enable row level security;

revoke all on table fotos_reporte from anon, authenticated;
grant select on table fotos_reporte to anon, authenticated;
grant insert (reporte_id, tipo, ruta) on table fotos_reporte to anon, authenticated;

create policy "ver_fotos_visibles" on fotos_reporte
  for select to anon, authenticated
  using (not oculta);


create policy "adjuntar_foto_a_reporte_reciente" on fotos_reporte
  for insert to anon, authenticated
  with check (
    tipo = 'antes'
    and not oculta
    and exists (
      select 1 from reportes r
      where r.id = reporte_id
        and r.creado_en > now() - interval '15 minutes'
    )
  );



create type rol_usuario as enum ('ciudadano', 'operario', 'administrador');


create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  rol rol_usuario not null default 'ciudadano',
  creado_en timestamptz not null default now()
);


create table datos_personales (
  usuario_id uuid primary key references perfiles(id) on delete cascade,
  nombre_completo text not null
    check (char_length(trim(nombre_completo)) between 2 and 120),
  cedula text not null unique check (cedula ~ '^[0-9]{5,12}$'),
  telefono text check (telefono ~ '^[0-9+ ]{7,15}$'),
  autorizo_datos_en timestamptz not null default now(),
  creado_en timestamptz not null default now()
);


create or replace function crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id) values (new.id);
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function crear_perfil_al_registrarse();


create or replace function es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'administrador'
  );
$$;

revoke execute on function es_admin() from public;
grant execute on function es_admin() to anon, authenticated;


alter table perfiles enable row level security;
alter table datos_personales enable row level security;

revoke all on table perfiles from anon, authenticated;
grant select on table perfiles to authenticated;
create policy "ver_mi_perfil" on perfiles
  for select to authenticated
  using (id = (select auth.uid()) or es_admin());

revoke all on table datos_personales from anon, authenticated;
grant select, insert on table datos_personales to authenticated;
grant update (nombre_completo, telefono) on table datos_personales to authenticated;
create policy "ver_mis_datos" on datos_personales
  for select to authenticated
  using (usuario_id = (select auth.uid()) or es_admin());
create policy "crear_mis_datos" on datos_personales
  for insert to authenticated
  with check (usuario_id = (select auth.uid()));
create policy "editar_mis_datos" on datos_personales
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));


alter table reportes
  add column if not exists usuario_id uuid
  references auth.users(id) on delete set null default auth.uid();

create index if not exists reportes_usuario_idx on reportes (usuario_id);


create table apoyos (
  reporte_id uuid not null references reportes(id) on delete cascade,
  usuario_id uuid not null
    references auth.users(id) on delete cascade default auth.uid(),
  creado_en timestamptz not null default now(),
  primary key (reporte_id, usuario_id)
);

alter table apoyos enable row level security;
revoke all on table apoyos from anon, authenticated;
grant select, insert, delete on table apoyos to authenticated;

create policy "ver_mis_apoyos" on apoyos
  for select to authenticated using (usuario_id = (select auth.uid()));
create policy "apoyar_reporte" on apoyos
  for insert to authenticated with check (usuario_id = (select auth.uid()));
create policy "quitar_mi_apoyo" on apoyos
  for delete to authenticated using (usuario_id = (select auth.uid()));


alter table reportes
  add column if not exists total_apoyos integer not null default 0;

create or replace function actualizar_total_apoyos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.reportes set total_apoyos = total_apoyos + 1
    where id = new.reporte_id;
  elsif tg_op = 'DELETE' then
    update public.reportes set total_apoyos = greatest(total_apoyos - 1, 0)
    where id = old.reporte_id;
  end if;
  return null;
end;
$$;

create trigger apoyos_actualizan_total
  after insert or delete on apoyos
  for each row execute function actualizar_total_apoyos();


create table cuadrillas (
  id bigint generated always as identity primary key,
  nombre text not null unique,
  descripcion text,
  activa boolean not null default true,
  creado_en timestamptz not null default now()
);


create table miembros_cuadrilla (
  cuadrilla_id bigint not null references cuadrillas(id) on delete cascade,
  usuario_id uuid not null references perfiles(id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (cuadrilla_id, usuario_id)
);

create index miembros_usuario_idx on miembros_cuadrilla (usuario_id);

alter table reportes
  add column if not exists cuadrilla_id bigint
    references cuadrillas(id) on delete set null,

  add column if not exists duplicado_de uuid
    references reportes(id) on delete set null,
  add column if not exists resuelto_en timestamptz,
  add column if not exists actualizado_en timestamptz not null default now();

create index if not exists reportes_estado_idx on reportes (estado);
create index if not exists reportes_creado_idx on reportes (creado_en desc);


create table historial_estados (
  id bigint generated always as identity primary key,
  reporte_id uuid not null references reportes(id) on delete cascade,
  estado_anterior estado_reporte,
  estado_nuevo estado_reporte not null,
  cambiado_por uuid references auth.users(id) on delete set null,
  observaciones text check (char_length(observaciones) <= 500),
  creado_en timestamptz not null default now()
);

create index historial_reporte_idx on historial_estados (reporte_id, creado_en);


create table notificaciones (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  reporte_id uuid not null references reportes(id) on delete cascade,
  mensaje text not null,
  leida boolean not null default false,
  creado_en timestamptz not null default now()
);

create index notificaciones_pendientes_idx
  on notificaciones (usuario_id) where not leida;


create or replace function preparar_actualizacion_reporte()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  if new.estado = 'resuelto' and old.estado is distinct from 'resuelto' then
    new.resuelto_en := now();
  elsif new.estado <> 'resuelto' then
    new.resuelto_en := null;
  end if;
  return new;
end;
$$;

create trigger reportes_antes_de_actualizar
  before update on reportes
  for each row execute function preparar_actualizacion_reporte();


create or replace function registrar_cambio_estado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.historial_estados (reporte_id, estado_anterior, estado_nuevo, cambiado_por)
    values (new.id, null, new.estado, auth.uid());
  elsif new.estado is distinct from old.estado then

    insert into public.historial_estados
      (reporte_id, estado_anterior, estado_nuevo, cambiado_por, observaciones)
    values (
      new.id, old.estado, new.estado, auth.uid(),
      nullif(trim(current_setting('viasbuga.observaciones', true)), '')
    );

    if new.usuario_id is not null then
      insert into public.notificaciones (usuario_id, reporte_id, mensaje)
      values (
        new.usuario_id,
        new.id,
        'Tu reporte pasó a: ' || replace(new.estado::text, '_', ' ')
      );
    end if;
  end if;
  return null;
end;
$$;

create trigger reportes_registran_estado
  after insert or update of estado on reportes
  for each row execute function registrar_cambio_estado();


alter table cuadrillas enable row level security;
alter table historial_estados enable row level security;
alter table notificaciones enable row level security;

revoke all on table cuadrillas, historial_estados, notificaciones from anon, authenticated;

grant select on table cuadrillas, historial_estados to anon, authenticated;
grant insert, update, delete on table cuadrillas to authenticated;

create policy "ver_cuadrillas" on cuadrillas
  for select to anon, authenticated using (true);
create policy "admin_gestiona_cuadrillas" on cuadrillas
  for all to authenticated
  using (es_admin()) with check (es_admin());

create policy "ver_historial" on historial_estados
  for select to anon, authenticated using (true);

grant select on table notificaciones to authenticated;
grant update (leida) on table notificaciones to authenticated;
create policy "ver_mis_notificaciones" on notificaciones
  for select to authenticated using (usuario_id = (select auth.uid()));
create policy "marcar_mis_notificaciones" on notificaciones
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));


alter table miembros_cuadrilla enable row level security;
revoke all on table miembros_cuadrilla from anon, authenticated;
grant select, insert, delete on table miembros_cuadrilla to authenticated;

create policy "ver_mi_membresia" on miembros_cuadrilla
  for select to authenticated
  using (usuario_id = (select auth.uid()) or es_admin());
create policy "admin_gestiona_miembros" on miembros_cuadrilla
  for all to authenticated
  using (es_admin()) with check (es_admin());


create or replace function es_miembro_de(p_cuadrilla_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.miembros_cuadrilla
    where cuadrilla_id = p_cuadrilla_id and usuario_id = (select auth.uid())
  );
$$;

revoke execute on function es_miembro_de(bigint) from public;
grant execute on function es_miembro_de(bigint) to authenticated;


grant update (cuadrilla_id, duplicado_de) on table reportes to authenticated;
create policy "admin_actualiza_reportes" on reportes
  for update to authenticated
  using (es_admin()) with check (es_admin());


create or replace function cambiar_estado_reporte(
  p_reporte_id uuid,
  p_estado estado_reporte,
  p_observaciones text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cuadrilla bigint;
begin
  select cuadrilla_id into v_cuadrilla from public.reportes where id = p_reporte_id;
  if not found then
    raise exception 'Reporte no encontrado';
  end if;

  if not (es_admin() or (v_cuadrilla is not null and es_miembro_de(v_cuadrilla))) then
    raise exception 'No tienes permiso para cambiar este reporte';
  end if;

  perform set_config('viasbuga.observaciones', coalesce(p_observaciones, ''), true);
  update public.reportes set estado = p_estado where id = p_reporte_id;
  perform set_config('viasbuga.observaciones', '', true);
end;
$$;

revoke execute on function cambiar_estado_reporte(uuid, estado_reporte, text) from public;
grant execute on function cambiar_estado_reporte(uuid, estado_reporte, text) to authenticated;


grant update (oculta) on table fotos_reporte to authenticated;
create policy "admin_ve_todas_las_fotos" on fotos_reporte
  for select to authenticated using (es_admin());
create policy "admin_sube_fotos_reparacion" on fotos_reporte
  for insert to authenticated with check (es_admin());
create policy "admin_modera_fotos" on fotos_reporte
  for update to authenticated
  using (es_admin()) with check (es_admin());



create extension if not exists postgis with schema extensions;

create type tipo_zona as enum ('comuna', 'corregimiento');

create table zonas (
  id bigint generated always as identity primary key,
  nombre text not null,
  tipo tipo_zona not null,
  geom geometry(MultiPolygon, 4326),
  unique (tipo, nombre)
);

create table barrios (
  id bigint generated always as identity primary key,
  zona_id bigint references zonas(id) on delete set null,
  nombre text not null,
  geom geometry(MultiPolygon, 4326),
  unique (zona_id, nombre)
);

create index zonas_geom_idx on zonas using gist (geom);
create index barrios_geom_idx on barrios using gist (geom);

alter table zonas enable row level security;
alter table barrios enable row level security;
revoke all on table zonas, barrios from anon, authenticated;
grant select on table zonas, barrios to anon, authenticated;
grant insert, update, delete on table zonas, barrios to authenticated;

create policy "ver_zonas" on zonas for select to anon, authenticated using (true);
create policy "ver_barrios" on barrios for select to anon, authenticated using (true);
create policy "admin_gestiona_zonas" on zonas
  for all to authenticated using (es_admin()) with check (es_admin());
create policy "admin_gestiona_barrios" on barrios
  for all to authenticated using (es_admin()) with check (es_admin());


alter table reportes
  add column if not exists ubicacion geography(Point, 4326)
  generated always as (
    st_setsrid(st_makepoint(longitud, latitud), 4326)::geography
  ) stored;

create index if not exists reportes_ubicacion_idx on reportes using gist (ubicacion);


alter table reportes
  add column if not exists barrio_id bigint references barrios(id) on delete set null;

create index if not exists reportes_barrio_idx on reportes (barrio_id);


create or replace function asignar_territorio()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  punto geometry := st_setsrid(st_makepoint(new.longitud, new.latitud), 4326);
begin
  select b.id into new.barrio_id
  from public.barrios b
  where b.geom is not null and st_covers(b.geom, punto)
  limit 1;

  return new;
end;
$$;

create trigger reportes_asignan_territorio
  before insert on reportes
  for each row execute function asignar_territorio();


create or replace function reportes_cercanos(
  p_latitud double precision,
  p_longitud double precision,
  p_tipo tipo_dano,
  p_metros integer default 25
)
returns table (
  reporte_id uuid,
  tipo tipo_dano,
  estado estado_reporte,
  descripcion text,
  distancia_m double precision,
  total_apoyos integer
)
language sql
stable
set search_path = public, extensions
as $$
  select r.id, r.tipo, r.estado, r.descripcion,
         st_distance(
           r.ubicacion,
           st_setsrid(st_makepoint(p_longitud, p_latitud), 4326)::geography
         ),
         r.total_apoyos
  from public.reportes r
  where r.tipo = p_tipo
    and r.estado <> 'resuelto'
    and st_dwithin(
          r.ubicacion,
          st_setsrid(st_makepoint(p_longitud, p_latitud), 4326)::geography,
          p_metros
        )
  order by 5
  limit 5;
$$;



create or replace function indicadores_resumen(
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
  where r.creado_en >= p_desde
    and (p_zona_id is null or b.zona_id = p_zona_id)
  group by r.tipo, r.estado;
$$;

create or replace view v_reportes_exportacion
with (security_invoker = true) as
select r.id,
       r.creado_en,
       r.tipo,
       r.estado,
       r.descripcion,
       r.latitud,
       r.longitud,
       z.tipo as tipo_zona,
       z.nombre as zona,
       b.nombre as barrio,
       c.nombre as cuadrilla,
       r.total_apoyos,
       r.resuelto_en
from reportes r
left join barrios b on b.id = r.barrio_id
left join zonas z on z.id = b.zona_id
left join cuadrillas c on c.id = r.cuadrilla_id;

grant select on v_reportes_exportacion to anon, authenticated;