create or replace function public.es_miembro(equipo uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from "miembros-equipo"
    where equipo_id = equipo and user_id = auth.uid()
  );
$$;