-- Columna para la URL del escudo
alter table "rivales" add column escudo_url text;

-- Bucket público de storage para los escudos
insert into storage.buckets (id, name, public)
values ('escudos-rivales', 'escudos-rivales', true);

-- Solo miembros del equipo dueño de la carpeta pueden subir/editar/borrar.
-- Convención de path: escudos-rivales/{equipo_id}/{archivo}
-- La lectura es pública automáticamente porque el bucket es público,
-- no hace falta policy de SELECT.
create policy "escudos rivales insert" on storage.objects
  for insert with check (
    bucket_id = 'escudos-rivales'
    and es_miembro((storage.foldername(name))[1]::uuid)
  );

create policy "escudos rivales update" on storage.objects
  for update using (
    bucket_id = 'escudos-rivales'
    and es_miembro((storage.foldername(name))[1]::uuid)
  );

create policy "escudos rivales delete" on storage.objects
  for delete using (
    bucket_id = 'escudos-rivales'
    and es_miembro((storage.foldername(name))[1]::uuid)
  );