alter table "partidos" alter column sede drop not null;
alter table "partidos" alter column numero_cancha drop not null;

alter table "partidos" drop constraint if exists partidos_sede_check;
alter table "partidos" drop constraint if exists partidos_numero_cancha_valido;

alter table "partidos" add constraint partidos_sede_valida check (
  sede is null or sede in ('Aeropuerto', 'Tirolesa')
);

alter table "partidos" add constraint partidos_cancha_valida check (
  (sede is null and numero_cancha is null)
  or (sede = 'Aeropuerto' and numero_cancha between 1 and 4)
  or (sede = 'Tirolesa' and numero_cancha between 1 and 7)
);