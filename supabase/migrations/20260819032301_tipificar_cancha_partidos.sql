alter table "partidos" drop column cancha;
alter table "partidos" add column sede text not null check (sede in ('Aeropuerto', 'Tirolesa'));
alter table "partidos" add column numero_cancha int not null;
alter table "partidos" add constraint partidos_numero_cancha_valido check (
  (sede = 'Aeropuerto' and numero_cancha between 1 and 4)
  or (sede = 'Tirolesa' and numero_cancha between 1 and 7)
);