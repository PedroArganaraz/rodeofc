alter table "pasos-ejercicio" rename column descripcion to nombre;
alter table "pasos-ejercicio" alter column nombre drop not null;