drop extension if exists "pg_net";


  create table "public"."asistencia" (
    "id" uuid not null default gen_random_uuid(),
    "jugadora_id" uuid not null,
    "fecha" date not null,
    "estado" text not null
      );


alter table "public"."asistencia" enable row level security;


  create table "public"."ejercicios" (
    "id" uuid not null default gen_random_uuid(),
    "equipo_id" uuid not null,
    "titulo" text not null,
    "categoria" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."ejercicios" enable row level security;


  create table "public"."entrenamientos" (
    "id" uuid not null default gen_random_uuid(),
    "equipo_id" uuid not null,
    "titulo" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."entrenamientos" enable row level security;


  create table "public"."entrenamientos-ejercicios" (
    "id" uuid not null default gen_random_uuid(),
    "entrenamiento_id" uuid not null,
    "ejercicio_id" uuid not null,
    "orden" integer not null
      );


alter table "public"."entrenamientos-ejercicios" enable row level security;


  create table "public"."equipos" (
    "id" uuid not null default gen_random_uuid(),
    "nombre" text not null,
    "escudo_url" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."equipos" enable row level security;


  create table "public"."formaciones" (
    "id" uuid not null default gen_random_uuid(),
    "equipo_id" uuid not null,
    "nombre" text,
    "esquema" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."formaciones" enable row level security;


  create table "public"."formaciones-jugadoras" (
    "id" uuid not null default gen_random_uuid(),
    "formacion_id" uuid not null,
    "jugadora_id" uuid not null,
    "posicion_x" numeric,
    "posicion_y" numeric,
    "titular" boolean not null default true,
    "orden_suplente" integer
      );


alter table "public"."formaciones-jugadoras" enable row level security;


  create table "public"."jugadoras" (
    "id" uuid not null default gen_random_uuid(),
    "equipo_id" uuid not null,
    "dorsal" integer,
    "posicion" text,
    "created_at" timestamp with time zone not null default now(),
    "nombre" text not null,
    "apellido" text not null
      );


alter table "public"."jugadoras" enable row level security;


  create table "public"."miembros-equipo" (
    "id" uuid not null default gen_random_uuid(),
    "equipo_id" uuid not null,
    "user_id" uuid not null,
    "rol" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."miembros-equipo" enable row level security;


  create table "public"."participacion-partidos" (
    "id" uuid not null default gen_random_uuid(),
    "partido_id" uuid not null,
    "jugadora_id" uuid not null,
    "convocada" boolean not null default false,
    "jugo" boolean not null default false,
    "minutos_jugados" integer not null default 0
      );


alter table "public"."participacion-partidos" enable row level security;


  create table "public"."partidos" (
    "id" uuid not null default gen_random_uuid(),
    "equipo_id" uuid not null,
    "rival_id" uuid,
    "torneo_id" uuid,
    "fecha" date not null,
    "hora" time without time zone,
    "cancha" text,
    "estado" text not null default 'programado'::text
      );


alter table "public"."partidos" enable row level security;


  create table "public"."pasos-ejercicio" (
    "id" uuid not null default gen_random_uuid(),
    "ejercicio_id" uuid not null,
    "orden" integer not null,
    "descripcion" text not null
      );


alter table "public"."pasos-ejercicio" enable row level security;


  create table "public"."resultados-partidos" (
    "id" uuid not null default gen_random_uuid(),
    "partido_id" uuid not null,
    "goles_favor" integer not null default 0,
    "goles_contra" integer not null default 0
      );


alter table "public"."resultados-partidos" enable row level security;


  create table "public"."rivales" (
    "id" uuid not null default gen_random_uuid(),
    "equipo_id" uuid not null,
    "nombre" text not null,
    "notas" text
      );


alter table "public"."rivales" enable row level security;


  create table "public"."torneos" (
    "id" uuid not null default gen_random_uuid(),
    "equipo_id" uuid not null,
    "division" text not null,
    "periodo" text not null,
    "anio" integer not null
      );


alter table "public"."torneos" enable row level security;

CREATE UNIQUE INDEX asistencia_jugadora_id_fecha_key ON public.asistencia USING btree (jugadora_id, fecha);

CREATE UNIQUE INDEX asistencia_pkey ON public.asistencia USING btree (id);

CREATE UNIQUE INDEX ejercicios_pkey ON public.ejercicios USING btree (id);

CREATE UNIQUE INDEX "entrenamientos-ejercicios_pkey" ON public."entrenamientos-ejercicios" USING btree (id);

CREATE UNIQUE INDEX entrenamientos_pkey ON public.entrenamientos USING btree (id);

CREATE UNIQUE INDEX equipos_pkey ON public.equipos USING btree (id);

CREATE UNIQUE INDEX "formaciones-jugadoras_pkey" ON public."formaciones-jugadoras" USING btree (id);

CREATE UNIQUE INDEX formaciones_pkey ON public.formaciones USING btree (id);

CREATE UNIQUE INDEX jugadoras_equipo_dorsal_unique ON public.jugadoras USING btree (equipo_id, dorsal);

CREATE UNIQUE INDEX jugadoras_pkey ON public.jugadoras USING btree (id);

CREATE UNIQUE INDEX "miembros-equipo_equipo_id_user_id_key" ON public."miembros-equipo" USING btree (equipo_id, user_id);

CREATE UNIQUE INDEX "miembros-equipo_pkey" ON public."miembros-equipo" USING btree (id);

CREATE UNIQUE INDEX "participacion-partidos_partido_id_jugadora_id_key" ON public."participacion-partidos" USING btree (partido_id, jugadora_id);

CREATE UNIQUE INDEX "participacion-partidos_pkey" ON public."participacion-partidos" USING btree (id);

CREATE UNIQUE INDEX partidos_pkey ON public.partidos USING btree (id);

CREATE UNIQUE INDEX "pasos-ejercicio_pkey" ON public."pasos-ejercicio" USING btree (id);

CREATE UNIQUE INDEX "resultados-partidos_partido_id_key" ON public."resultados-partidos" USING btree (partido_id);

CREATE UNIQUE INDEX "resultados-partidos_pkey" ON public."resultados-partidos" USING btree (id);

CREATE UNIQUE INDEX rivales_pkey ON public.rivales USING btree (id);

CREATE UNIQUE INDEX torneos_pkey ON public.torneos USING btree (id);

alter table "public"."asistencia" add constraint "asistencia_pkey" PRIMARY KEY using index "asistencia_pkey";

alter table "public"."ejercicios" add constraint "ejercicios_pkey" PRIMARY KEY using index "ejercicios_pkey";

alter table "public"."entrenamientos" add constraint "entrenamientos_pkey" PRIMARY KEY using index "entrenamientos_pkey";

alter table "public"."entrenamientos-ejercicios" add constraint "entrenamientos-ejercicios_pkey" PRIMARY KEY using index "entrenamientos-ejercicios_pkey";

alter table "public"."equipos" add constraint "equipos_pkey" PRIMARY KEY using index "equipos_pkey";

alter table "public"."formaciones" add constraint "formaciones_pkey" PRIMARY KEY using index "formaciones_pkey";

alter table "public"."formaciones-jugadoras" add constraint "formaciones-jugadoras_pkey" PRIMARY KEY using index "formaciones-jugadoras_pkey";

alter table "public"."jugadoras" add constraint "jugadoras_pkey" PRIMARY KEY using index "jugadoras_pkey";

alter table "public"."miembros-equipo" add constraint "miembros-equipo_pkey" PRIMARY KEY using index "miembros-equipo_pkey";

alter table "public"."participacion-partidos" add constraint "participacion-partidos_pkey" PRIMARY KEY using index "participacion-partidos_pkey";

alter table "public"."partidos" add constraint "partidos_pkey" PRIMARY KEY using index "partidos_pkey";

alter table "public"."pasos-ejercicio" add constraint "pasos-ejercicio_pkey" PRIMARY KEY using index "pasos-ejercicio_pkey";

alter table "public"."resultados-partidos" add constraint "resultados-partidos_pkey" PRIMARY KEY using index "resultados-partidos_pkey";

alter table "public"."rivales" add constraint "rivales_pkey" PRIMARY KEY using index "rivales_pkey";

alter table "public"."torneos" add constraint "torneos_pkey" PRIMARY KEY using index "torneos_pkey";

alter table "public"."asistencia" add constraint "asistencia_estado_check" CHECK ((estado = ANY (ARRAY['presente'::text, 'ausente'::text, 'justificada'::text]))) not valid;

alter table "public"."asistencia" validate constraint "asistencia_estado_check";

alter table "public"."asistencia" add constraint "asistencia_jugadora_id_fecha_key" UNIQUE using index "asistencia_jugadora_id_fecha_key";

alter table "public"."asistencia" add constraint "asistencia_jugadora_id_fkey" FOREIGN KEY (jugadora_id) REFERENCES public.jugadoras(id) ON DELETE CASCADE not valid;

alter table "public"."asistencia" validate constraint "asistencia_jugadora_id_fkey";

alter table "public"."ejercicios" add constraint "ejercicios_categoria_check" CHECK ((categoria = ANY (ARRAY['pases'::text, 'definicion'::text, 'tecnica'::text, 'jugada'::text, 'otro'::text]))) not valid;

alter table "public"."ejercicios" validate constraint "ejercicios_categoria_check";

alter table "public"."ejercicios" add constraint "ejercicios_equipo_id_fkey" FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE not valid;

alter table "public"."ejercicios" validate constraint "ejercicios_equipo_id_fkey";

alter table "public"."entrenamientos" add constraint "entrenamientos_equipo_id_fkey" FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE not valid;

alter table "public"."entrenamientos" validate constraint "entrenamientos_equipo_id_fkey";

alter table "public"."entrenamientos-ejercicios" add constraint "entrenamientos-ejercicios_ejercicio_id_fkey" FOREIGN KEY (ejercicio_id) REFERENCES public.ejercicios(id) ON DELETE CASCADE not valid;

alter table "public"."entrenamientos-ejercicios" validate constraint "entrenamientos-ejercicios_ejercicio_id_fkey";

alter table "public"."entrenamientos-ejercicios" add constraint "entrenamientos-ejercicios_entrenamiento_id_fkey" FOREIGN KEY (entrenamiento_id) REFERENCES public.entrenamientos(id) ON DELETE CASCADE not valid;

alter table "public"."entrenamientos-ejercicios" validate constraint "entrenamientos-ejercicios_entrenamiento_id_fkey";

alter table "public"."formaciones" add constraint "formaciones_equipo_id_fkey" FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE not valid;

alter table "public"."formaciones" validate constraint "formaciones_equipo_id_fkey";

alter table "public"."formaciones-jugadoras" add constraint "formaciones-jugadoras_formacion_id_fkey" FOREIGN KEY (formacion_id) REFERENCES public.formaciones(id) ON DELETE CASCADE not valid;

alter table "public"."formaciones-jugadoras" validate constraint "formaciones-jugadoras_formacion_id_fkey";

alter table "public"."formaciones-jugadoras" add constraint "formaciones-jugadoras_jugadora_id_fkey" FOREIGN KEY (jugadora_id) REFERENCES public.jugadoras(id) ON DELETE CASCADE not valid;

alter table "public"."formaciones-jugadoras" validate constraint "formaciones-jugadoras_jugadora_id_fkey";

alter table "public"."jugadoras" add constraint "jugadoras_equipo_dorsal_unique" UNIQUE using index "jugadoras_equipo_dorsal_unique";

alter table "public"."jugadoras" add constraint "jugadoras_equipo_id_fkey" FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE not valid;

alter table "public"."jugadoras" validate constraint "jugadoras_equipo_id_fkey";

alter table "public"."miembros-equipo" add constraint "miembros-equipo_equipo_id_fkey" FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE not valid;

alter table "public"."miembros-equipo" validate constraint "miembros-equipo_equipo_id_fkey";

alter table "public"."miembros-equipo" add constraint "miembros-equipo_equipo_id_user_id_key" UNIQUE using index "miembros-equipo_equipo_id_user_id_key";

alter table "public"."miembros-equipo" add constraint "miembros-equipo_rol_check" CHECK ((rol = ANY (ARRAY['admin'::text, 'entrenador'::text]))) not valid;

alter table "public"."miembros-equipo" validate constraint "miembros-equipo_rol_check";

alter table "public"."miembros-equipo" add constraint "miembros-equipo_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."miembros-equipo" validate constraint "miembros-equipo_user_id_fkey";

alter table "public"."participacion-partidos" add constraint "participacion-partidos_jugadora_id_fkey" FOREIGN KEY (jugadora_id) REFERENCES public.jugadoras(id) ON DELETE CASCADE not valid;

alter table "public"."participacion-partidos" validate constraint "participacion-partidos_jugadora_id_fkey";

alter table "public"."participacion-partidos" add constraint "participacion-partidos_partido_id_fkey" FOREIGN KEY (partido_id) REFERENCES public.partidos(id) ON DELETE CASCADE not valid;

alter table "public"."participacion-partidos" validate constraint "participacion-partidos_partido_id_fkey";

alter table "public"."participacion-partidos" add constraint "participacion-partidos_partido_id_jugadora_id_key" UNIQUE using index "participacion-partidos_partido_id_jugadora_id_key";

alter table "public"."partidos" add constraint "partidos_equipo_id_fkey" FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE not valid;

alter table "public"."partidos" validate constraint "partidos_equipo_id_fkey";

alter table "public"."partidos" add constraint "partidos_estado_check" CHECK ((estado = ANY (ARRAY['programado'::text, 'jugado'::text, 'suspendido'::text]))) not valid;

alter table "public"."partidos" validate constraint "partidos_estado_check";

alter table "public"."partidos" add constraint "partidos_rival_id_fkey" FOREIGN KEY (rival_id) REFERENCES public.rivales(id) not valid;

alter table "public"."partidos" validate constraint "partidos_rival_id_fkey";

alter table "public"."partidos" add constraint "partidos_torneo_id_fkey" FOREIGN KEY (torneo_id) REFERENCES public.torneos(id) not valid;

alter table "public"."partidos" validate constraint "partidos_torneo_id_fkey";

alter table "public"."pasos-ejercicio" add constraint "pasos-ejercicio_ejercicio_id_fkey" FOREIGN KEY (ejercicio_id) REFERENCES public.ejercicios(id) ON DELETE CASCADE not valid;

alter table "public"."pasos-ejercicio" validate constraint "pasos-ejercicio_ejercicio_id_fkey";

alter table "public"."resultados-partidos" add constraint "resultados-partidos_partido_id_fkey" FOREIGN KEY (partido_id) REFERENCES public.partidos(id) ON DELETE CASCADE not valid;

alter table "public"."resultados-partidos" validate constraint "resultados-partidos_partido_id_fkey";

alter table "public"."resultados-partidos" add constraint "resultados-partidos_partido_id_key" UNIQUE using index "resultados-partidos_partido_id_key";

alter table "public"."rivales" add constraint "rivales_equipo_id_fkey" FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE not valid;

alter table "public"."rivales" validate constraint "rivales_equipo_id_fkey";

alter table "public"."torneos" add constraint "torneos_equipo_id_fkey" FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE not valid;

alter table "public"."torneos" validate constraint "torneos_equipo_id_fkey";

alter table "public"."torneos" add constraint "torneos_periodo_check" CHECK ((periodo = ANY (ARRAY['apertura'::text, 'clausura'::text]))) not valid;

alter table "public"."torneos" validate constraint "torneos_periodo_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.es_miembro(equipo uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select exists (
    select 1 from "miembros-equipo"
    where equipo_id = equipo and user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

grant references on table "public"."asistencia" to "anon";

grant trigger on table "public"."asistencia" to "anon";

grant truncate on table "public"."asistencia" to "anon";

grant delete on table "public"."asistencia" to "authenticated";

grant insert on table "public"."asistencia" to "authenticated";

grant references on table "public"."asistencia" to "authenticated";

grant select on table "public"."asistencia" to "authenticated";

grant trigger on table "public"."asistencia" to "authenticated";

grant truncate on table "public"."asistencia" to "authenticated";

grant update on table "public"."asistencia" to "authenticated";

grant references on table "public"."asistencia" to "service_role";

grant trigger on table "public"."asistencia" to "service_role";

grant truncate on table "public"."asistencia" to "service_role";

grant references on table "public"."ejercicios" to "anon";

grant trigger on table "public"."ejercicios" to "anon";

grant truncate on table "public"."ejercicios" to "anon";

grant delete on table "public"."ejercicios" to "authenticated";

grant insert on table "public"."ejercicios" to "authenticated";

grant references on table "public"."ejercicios" to "authenticated";

grant select on table "public"."ejercicios" to "authenticated";

grant trigger on table "public"."ejercicios" to "authenticated";

grant truncate on table "public"."ejercicios" to "authenticated";

grant update on table "public"."ejercicios" to "authenticated";

grant references on table "public"."ejercicios" to "service_role";

grant trigger on table "public"."ejercicios" to "service_role";

grant truncate on table "public"."ejercicios" to "service_role";

grant references on table "public"."entrenamientos" to "anon";

grant trigger on table "public"."entrenamientos" to "anon";

grant truncate on table "public"."entrenamientos" to "anon";

grant delete on table "public"."entrenamientos" to "authenticated";

grant insert on table "public"."entrenamientos" to "authenticated";

grant references on table "public"."entrenamientos" to "authenticated";

grant select on table "public"."entrenamientos" to "authenticated";

grant trigger on table "public"."entrenamientos" to "authenticated";

grant truncate on table "public"."entrenamientos" to "authenticated";

grant update on table "public"."entrenamientos" to "authenticated";

grant references on table "public"."entrenamientos" to "service_role";

grant trigger on table "public"."entrenamientos" to "service_role";

grant truncate on table "public"."entrenamientos" to "service_role";

grant references on table "public"."entrenamientos-ejercicios" to "anon";

grant trigger on table "public"."entrenamientos-ejercicios" to "anon";

grant truncate on table "public"."entrenamientos-ejercicios" to "anon";

grant delete on table "public"."entrenamientos-ejercicios" to "authenticated";

grant insert on table "public"."entrenamientos-ejercicios" to "authenticated";

grant references on table "public"."entrenamientos-ejercicios" to "authenticated";

grant select on table "public"."entrenamientos-ejercicios" to "authenticated";

grant trigger on table "public"."entrenamientos-ejercicios" to "authenticated";

grant truncate on table "public"."entrenamientos-ejercicios" to "authenticated";

grant update on table "public"."entrenamientos-ejercicios" to "authenticated";

grant references on table "public"."entrenamientos-ejercicios" to "service_role";

grant trigger on table "public"."entrenamientos-ejercicios" to "service_role";

grant truncate on table "public"."entrenamientos-ejercicios" to "service_role";

grant references on table "public"."equipos" to "anon";

grant trigger on table "public"."equipos" to "anon";

grant truncate on table "public"."equipos" to "anon";

grant delete on table "public"."equipos" to "authenticated";

grant insert on table "public"."equipos" to "authenticated";

grant references on table "public"."equipos" to "authenticated";

grant select on table "public"."equipos" to "authenticated";

grant trigger on table "public"."equipos" to "authenticated";

grant truncate on table "public"."equipos" to "authenticated";

grant update on table "public"."equipos" to "authenticated";

grant references on table "public"."equipos" to "service_role";

grant trigger on table "public"."equipos" to "service_role";

grant truncate on table "public"."equipos" to "service_role";

grant references on table "public"."formaciones" to "anon";

grant trigger on table "public"."formaciones" to "anon";

grant truncate on table "public"."formaciones" to "anon";

grant delete on table "public"."formaciones" to "authenticated";

grant insert on table "public"."formaciones" to "authenticated";

grant references on table "public"."formaciones" to "authenticated";

grant select on table "public"."formaciones" to "authenticated";

grant trigger on table "public"."formaciones" to "authenticated";

grant truncate on table "public"."formaciones" to "authenticated";

grant update on table "public"."formaciones" to "authenticated";

grant references on table "public"."formaciones" to "service_role";

grant trigger on table "public"."formaciones" to "service_role";

grant truncate on table "public"."formaciones" to "service_role";

grant references on table "public"."formaciones-jugadoras" to "anon";

grant trigger on table "public"."formaciones-jugadoras" to "anon";

grant truncate on table "public"."formaciones-jugadoras" to "anon";

grant delete on table "public"."formaciones-jugadoras" to "authenticated";

grant insert on table "public"."formaciones-jugadoras" to "authenticated";

grant references on table "public"."formaciones-jugadoras" to "authenticated";

grant select on table "public"."formaciones-jugadoras" to "authenticated";

grant trigger on table "public"."formaciones-jugadoras" to "authenticated";

grant truncate on table "public"."formaciones-jugadoras" to "authenticated";

grant update on table "public"."formaciones-jugadoras" to "authenticated";

grant references on table "public"."formaciones-jugadoras" to "service_role";

grant trigger on table "public"."formaciones-jugadoras" to "service_role";

grant truncate on table "public"."formaciones-jugadoras" to "service_role";

grant references on table "public"."jugadoras" to "anon";

grant trigger on table "public"."jugadoras" to "anon";

grant truncate on table "public"."jugadoras" to "anon";

grant delete on table "public"."jugadoras" to "authenticated";

grant insert on table "public"."jugadoras" to "authenticated";

grant references on table "public"."jugadoras" to "authenticated";

grant select on table "public"."jugadoras" to "authenticated";

grant trigger on table "public"."jugadoras" to "authenticated";

grant truncate on table "public"."jugadoras" to "authenticated";

grant update on table "public"."jugadoras" to "authenticated";

grant references on table "public"."jugadoras" to "service_role";

grant trigger on table "public"."jugadoras" to "service_role";

grant truncate on table "public"."jugadoras" to "service_role";

grant references on table "public"."miembros-equipo" to "anon";

grant trigger on table "public"."miembros-equipo" to "anon";

grant truncate on table "public"."miembros-equipo" to "anon";

grant delete on table "public"."miembros-equipo" to "authenticated";

grant insert on table "public"."miembros-equipo" to "authenticated";

grant references on table "public"."miembros-equipo" to "authenticated";

grant select on table "public"."miembros-equipo" to "authenticated";

grant trigger on table "public"."miembros-equipo" to "authenticated";

grant truncate on table "public"."miembros-equipo" to "authenticated";

grant update on table "public"."miembros-equipo" to "authenticated";

grant references on table "public"."miembros-equipo" to "service_role";

grant trigger on table "public"."miembros-equipo" to "service_role";

grant truncate on table "public"."miembros-equipo" to "service_role";

grant references on table "public"."participacion-partidos" to "anon";

grant trigger on table "public"."participacion-partidos" to "anon";

grant truncate on table "public"."participacion-partidos" to "anon";

grant delete on table "public"."participacion-partidos" to "authenticated";

grant insert on table "public"."participacion-partidos" to "authenticated";

grant references on table "public"."participacion-partidos" to "authenticated";

grant select on table "public"."participacion-partidos" to "authenticated";

grant trigger on table "public"."participacion-partidos" to "authenticated";

grant truncate on table "public"."participacion-partidos" to "authenticated";

grant update on table "public"."participacion-partidos" to "authenticated";

grant references on table "public"."participacion-partidos" to "service_role";

grant trigger on table "public"."participacion-partidos" to "service_role";

grant truncate on table "public"."participacion-partidos" to "service_role";

grant references on table "public"."partidos" to "anon";

grant trigger on table "public"."partidos" to "anon";

grant truncate on table "public"."partidos" to "anon";

grant delete on table "public"."partidos" to "authenticated";

grant insert on table "public"."partidos" to "authenticated";

grant references on table "public"."partidos" to "authenticated";

grant select on table "public"."partidos" to "authenticated";

grant trigger on table "public"."partidos" to "authenticated";

grant truncate on table "public"."partidos" to "authenticated";

grant update on table "public"."partidos" to "authenticated";

grant references on table "public"."partidos" to "service_role";

grant trigger on table "public"."partidos" to "service_role";

grant truncate on table "public"."partidos" to "service_role";

grant references on table "public"."pasos-ejercicio" to "anon";

grant trigger on table "public"."pasos-ejercicio" to "anon";

grant truncate on table "public"."pasos-ejercicio" to "anon";

grant delete on table "public"."pasos-ejercicio" to "authenticated";

grant insert on table "public"."pasos-ejercicio" to "authenticated";

grant references on table "public"."pasos-ejercicio" to "authenticated";

grant select on table "public"."pasos-ejercicio" to "authenticated";

grant trigger on table "public"."pasos-ejercicio" to "authenticated";

grant truncate on table "public"."pasos-ejercicio" to "authenticated";

grant update on table "public"."pasos-ejercicio" to "authenticated";

grant references on table "public"."pasos-ejercicio" to "service_role";

grant trigger on table "public"."pasos-ejercicio" to "service_role";

grant truncate on table "public"."pasos-ejercicio" to "service_role";

grant references on table "public"."resultados-partidos" to "anon";

grant trigger on table "public"."resultados-partidos" to "anon";

grant truncate on table "public"."resultados-partidos" to "anon";

grant delete on table "public"."resultados-partidos" to "authenticated";

grant insert on table "public"."resultados-partidos" to "authenticated";

grant references on table "public"."resultados-partidos" to "authenticated";

grant select on table "public"."resultados-partidos" to "authenticated";

grant trigger on table "public"."resultados-partidos" to "authenticated";

grant truncate on table "public"."resultados-partidos" to "authenticated";

grant update on table "public"."resultados-partidos" to "authenticated";

grant references on table "public"."resultados-partidos" to "service_role";

grant trigger on table "public"."resultados-partidos" to "service_role";

grant truncate on table "public"."resultados-partidos" to "service_role";

grant references on table "public"."rivales" to "anon";

grant trigger on table "public"."rivales" to "anon";

grant truncate on table "public"."rivales" to "anon";

grant delete on table "public"."rivales" to "authenticated";

grant insert on table "public"."rivales" to "authenticated";

grant references on table "public"."rivales" to "authenticated";

grant select on table "public"."rivales" to "authenticated";

grant trigger on table "public"."rivales" to "authenticated";

grant truncate on table "public"."rivales" to "authenticated";

grant update on table "public"."rivales" to "authenticated";

grant references on table "public"."rivales" to "service_role";

grant trigger on table "public"."rivales" to "service_role";

grant truncate on table "public"."rivales" to "service_role";

grant references on table "public"."torneos" to "anon";

grant trigger on table "public"."torneos" to "anon";

grant truncate on table "public"."torneos" to "anon";

grant delete on table "public"."torneos" to "authenticated";

grant insert on table "public"."torneos" to "authenticated";

grant references on table "public"."torneos" to "authenticated";

grant select on table "public"."torneos" to "authenticated";

grant trigger on table "public"."torneos" to "authenticated";

grant truncate on table "public"."torneos" to "authenticated";

grant update on table "public"."torneos" to "authenticated";

grant references on table "public"."torneos" to "service_role";

grant trigger on table "public"."torneos" to "service_role";

grant truncate on table "public"."torneos" to "service_role";


  create policy "acceso asistencia"
  on "public"."asistencia"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.jugadoras j
  WHERE ((j.id = asistencia.jugadora_id) AND public.es_miembro(j.equipo_id)))))
with check ((EXISTS ( SELECT 1
   FROM public.jugadoras j
  WHERE ((j.id = asistencia.jugadora_id) AND public.es_miembro(j.equipo_id)))));



  create policy "acceso ejercicios"
  on "public"."ejercicios"
  as permissive
  for all
  to public
using (public.es_miembro(equipo_id))
with check (public.es_miembro(equipo_id));



  create policy "acceso entrenamientos"
  on "public"."entrenamientos"
  as permissive
  for all
  to public
using (public.es_miembro(equipo_id))
with check (public.es_miembro(equipo_id));



  create policy "acceso entrenamientos-ejercicios"
  on "public"."entrenamientos-ejercicios"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.entrenamientos t
  WHERE ((t.id = "entrenamientos-ejercicios".entrenamiento_id) AND public.es_miembro(t.equipo_id)))))
with check ((EXISTS ( SELECT 1
   FROM public.entrenamientos t
  WHERE ((t.id = "entrenamientos-ejercicios".entrenamiento_id) AND public.es_miembro(t.equipo_id)))));



  create policy "acceso equipo"
  on "public"."equipos"
  as permissive
  for all
  to public
using (public.es_miembro(id))
with check (public.es_miembro(id));



  create policy "acceso formaciones"
  on "public"."formaciones"
  as permissive
  for all
  to public
using (public.es_miembro(equipo_id))
with check (public.es_miembro(equipo_id));



  create policy "acceso formaciones-jugadoras"
  on "public"."formaciones-jugadoras"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.formaciones f
  WHERE ((f.id = "formaciones-jugadoras".formacion_id) AND public.es_miembro(f.equipo_id)))))
with check ((EXISTS ( SELECT 1
   FROM public.formaciones f
  WHERE ((f.id = "formaciones-jugadoras".formacion_id) AND public.es_miembro(f.equipo_id)))));



  create policy "acceso jugadoras"
  on "public"."jugadoras"
  as permissive
  for all
  to public
using (public.es_miembro(equipo_id))
with check (public.es_miembro(equipo_id));



  create policy "acceso miembros"
  on "public"."miembros-equipo"
  as permissive
  for all
  to public
using (public.es_miembro(equipo_id))
with check (public.es_miembro(equipo_id));



  create policy "acceso participacion-partidos"
  on "public"."participacion-partidos"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.partidos p
  WHERE ((p.id = "participacion-partidos".partido_id) AND public.es_miembro(p.equipo_id)))))
with check ((EXISTS ( SELECT 1
   FROM public.partidos p
  WHERE ((p.id = "participacion-partidos".partido_id) AND public.es_miembro(p.equipo_id)))));



  create policy "acceso partidos"
  on "public"."partidos"
  as permissive
  for all
  to public
using (public.es_miembro(equipo_id))
with check (public.es_miembro(equipo_id));



  create policy "acceso pasos-ejercicio"
  on "public"."pasos-ejercicio"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.ejercicios e
  WHERE ((e.id = "pasos-ejercicio".ejercicio_id) AND public.es_miembro(e.equipo_id)))))
with check ((EXISTS ( SELECT 1
   FROM public.ejercicios e
  WHERE ((e.id = "pasos-ejercicio".ejercicio_id) AND public.es_miembro(e.equipo_id)))));



  create policy "acceso resultados-partidos"
  on "public"."resultados-partidos"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.partidos p
  WHERE ((p.id = "resultados-partidos".partido_id) AND public.es_miembro(p.equipo_id)))))
with check ((EXISTS ( SELECT 1
   FROM public.partidos p
  WHERE ((p.id = "resultados-partidos".partido_id) AND public.es_miembro(p.equipo_id)))));



  create policy "acceso rivales"
  on "public"."rivales"
  as permissive
  for all
  to public
using (public.es_miembro(equipo_id))
with check (public.es_miembro(equipo_id));



  create policy "acceso torneos"
  on "public"."torneos"
  as permissive
  for all
  to public
using (public.es_miembro(equipo_id))
with check (public.es_miembro(equipo_id));



