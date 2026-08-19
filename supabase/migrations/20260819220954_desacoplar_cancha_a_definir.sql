alter table "partidos" drop constraint if exists partidos_cancha_valida;

alter table "partidos" add constraint partidos_cancha_valida check (
  numero_cancha is null
  or (sede = 'Aeropuerto' and numero_cancha between 1 and 4)
  or (sede = 'Tirolesa' and numero_cancha between 1 and 7)
);