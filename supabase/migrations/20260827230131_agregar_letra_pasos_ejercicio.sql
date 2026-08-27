alter table "pasos-ejercicio" add column letra text;

update "pasos-ejercicio" pe
set letra = sub.letra
from (
  select id, chr((64 + row_number() over (partition by ejercicio_id order by orden))::int) as letra
  from "pasos-ejercicio"
) sub
where sub.id = pe.id;

alter table "pasos-ejercicio" alter column letra set not null;