-- ============================================================
-- Schema: Sistema de gestión de equipo de fútbol
-- Para pegar en Supabase SQL Editor
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- NÚCLEO (multi-tenancy)
-- ============================================================

create table "equipos" (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  escudo_url text,
  created_at timestamptz not null default now()
);

create table "miembros-equipo" (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references "equipos"(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rol text not null check (rol in ('admin', 'entrenador')),
  created_at timestamptz not null default now(),
  unique (equipo_id, user_id)
);

-- Función helper: ¿el usuario actual pertenece a este equipo?
-- SECURITY DEFINER evita recursión infinita al evaluarse dentro
-- de la propia policy de "miembros-equipo".
create or replace function public.es_miembro(equipo uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from "miembros-equipo"
    where equipo_id = equipo and user_id = auth.uid()
  );
$$;

-- ============================================================
-- RIVALES (sin dependencias, útil tenerla antes de "partidos")
-- ============================================================

create table "rivales" (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references "equipos"(id) on delete cascade,
  nombre text not null,
  notas text
);

-- ============================================================
-- EJERCICIOS
-- ============================================================

create table "ejercicios" (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references "equipos"(id) on delete cascade,
  titulo text not null,
  categoria text not null check (categoria in ('pases', 'definicion', 'tecnica', 'jugada', 'otro')),
  created_at timestamptz not null default now()
);

create table "pasos-ejercicio" (
  id uuid primary key default gen_random_uuid(),
  ejercicio_id uuid not null references "ejercicios"(id) on delete cascade,
  orden int not null,
  descripcion text not null
);

-- ============================================================
-- ENTRENAMIENTOS (piezas reutilizables, sin fecha)
-- ============================================================

create table "entrenamientos" (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references "equipos"(id) on delete cascade,
  titulo text not null,
  created_at timestamptz not null default now()
);

create table "entrenamientos-ejercicios" (
  id uuid primary key default gen_random_uuid(),
  entrenamiento_id uuid not null references "entrenamientos"(id) on delete cascade,
  ejercicio_id uuid not null references "ejercicios"(id) on delete cascade,
  orden int not null
);

-- ============================================================
-- EQUIPO: jugadoras, torneos, partidos, formaciones
-- ============================================================

create table "jugadoras" (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references "equipos"(id) on delete cascade,
  nombre text not null,
  dorsal int,
  posicion text,
  minutos_jugados int not null default 0,
  created_at timestamptz not null default now()
);

create table "asistencia" (
  id uuid primary key default gen_random_uuid(),
  jugadora_id uuid not null references "jugadoras"(id) on delete cascade,
  fecha date not null,
  estado text not null check (estado in ('presente', 'ausente', 'justificada')),
  unique (jugadora_id, fecha)
);

create table "torneos" (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references "equipos"(id) on delete cascade,
  division text not null,
  periodo text not null check (periodo in ('apertura', 'clausura')),
  anio int not null
);

create table "partidos" (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references "equipos"(id) on delete cascade,
  rival_id uuid references "rivales"(id),
  torneo_id uuid references "torneos"(id),
  fecha date not null,
  hora time,
  cancha text,
  estado text not null default 'programado' check (estado in ('programado', 'jugado', 'suspendido'))
);

create table "resultados-partidos" (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null unique references "partidos"(id) on delete cascade,
  goles_favor int not null default 0,
  goles_contra int not null default 0
);

create table "participacion-partidos" (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references "partidos"(id) on delete cascade,
  jugadora_id uuid not null references "jugadoras"(id) on delete cascade,
  convocada boolean not null default false,
  jugo boolean not null default false,
  minutos_jugados int not null default 0,
  unique (partido_id, jugadora_id)
);

create table "formaciones" (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references "equipos"(id) on delete cascade,
  nombre text,
  esquema text not null,
  created_at timestamptz not null default now()
);

create table "formaciones-jugadoras" (
  id uuid primary key default gen_random_uuid(),
  formacion_id uuid not null references "formaciones"(id) on delete cascade,
  jugadora_id uuid not null references "jugadoras"(id) on delete cascade,
  posicion_x numeric,
  posicion_y numeric,
  titular boolean not null default true,
  orden_suplente int
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table "equipos" enable row level security;
alter table "miembros-equipo" enable row level security;
alter table "rivales" enable row level security;
alter table "ejercicios" enable row level security;
alter table "pasos-ejercicio" enable row level security;
alter table "entrenamientos" enable row level security;
alter table "entrenamientos-ejercicios" enable row level security;
alter table "jugadoras" enable row level security;
alter table "asistencia" enable row level security;
alter table "torneos" enable row level security;
alter table "partidos" enable row level security;
alter table "resultados-partidos" enable row level security;
alter table "participacion-partidos" enable row level security;
alter table "formaciones" enable row level security;
alter table "formaciones-jugadoras" enable row level security;

-- equipos: visible/editable si sos miembro
create policy "acceso equipo" on "equipos"
  for all using (es_miembro(id)) with check (es_miembro(id));

-- miembros-equipo: visible/editable si sos miembro del mismo equipo
create policy "acceso miembros" on "miembros-equipo"
  for all using (es_miembro(equipo_id)) with check (es_miembro(equipo_id));

-- Tablas con equipo_id directo
create policy "acceso rivales" on "rivales"
  for all using (es_miembro(equipo_id)) with check (es_miembro(equipo_id));

create policy "acceso ejercicios" on "ejercicios"
  for all using (es_miembro(equipo_id)) with check (es_miembro(equipo_id));

create policy "acceso entrenamientos" on "entrenamientos"
  for all using (es_miembro(equipo_id)) with check (es_miembro(equipo_id));

create policy "acceso jugadoras" on "jugadoras"
  for all using (es_miembro(equipo_id)) with check (es_miembro(equipo_id));

create policy "acceso torneos" on "torneos"
  for all using (es_miembro(equipo_id)) with check (es_miembro(equipo_id));

create policy "acceso partidos" on "partidos"
  for all using (es_miembro(equipo_id)) with check (es_miembro(equipo_id));

create policy "acceso formaciones" on "formaciones"
  for all using (es_miembro(equipo_id)) with check (es_miembro(equipo_id));

-- Tablas hijas: heredan el acceso a través de su tabla padre
create policy "acceso pasos-ejercicio" on "pasos-ejercicio"
  for all using (
    exists (select 1 from "ejercicios" e where e.id = ejercicio_id and es_miembro(e.equipo_id))
  ) with check (
    exists (select 1 from "ejercicios" e where e.id = ejercicio_id and es_miembro(e.equipo_id))
  );

create policy "acceso entrenamientos-ejercicios" on "entrenamientos-ejercicios"
  for all using (
    exists (select 1 from "entrenamientos" t where t.id = entrenamiento_id and es_miembro(t.equipo_id))
  ) with check (
    exists (select 1 from "entrenamientos" t where t.id = entrenamiento_id and es_miembro(t.equipo_id))
  );

create policy "acceso asistencia" on "asistencia"
  for all using (
    exists (select 1 from "jugadoras" j where j.id = jugadora_id and es_miembro(j.equipo_id))
  ) with check (
    exists (select 1 from "jugadoras" j where j.id = jugadora_id and es_miembro(j.equipo_id))
  );

create policy "acceso resultados-partidos" on "resultados-partidos"
  for all using (
    exists (select 1 from "partidos" p where p.id = partido_id and es_miembro(p.equipo_id))
  ) with check (
    exists (select 1 from "partidos" p where p.id = partido_id and es_miembro(p.equipo_id))
  );

create policy "acceso participacion-partidos" on "participacion-partidos"
  for all using (
    exists (select 1 from "partidos" p where p.id = partido_id and es_miembro(p.equipo_id))
  ) with check (
    exists (select 1 from "partidos" p where p.id = partido_id and es_miembro(p.equipo_id))
  );

create policy "acceso formaciones-jugadoras" on "formaciones-jugadoras"
  for all using (
    exists (select 1 from "formaciones" f where f.id = formacion_id and es_miembro(f.equipo_id))
  ) with check (
    exists (select 1 from "formaciones" f where f.id = formacion_id and es_miembro(f.equipo_id))
  );
