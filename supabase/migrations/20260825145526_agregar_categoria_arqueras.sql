alter table "ejercicios" drop constraint if exists "ejercicios_categoria_check";

alter table "ejercicios" add constraint "ejercicios_categoria_check"
  check (categoria in ('pases', 'tecnica', 'definicion', 'jugada', 'arqueras'));