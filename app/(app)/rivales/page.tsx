import { createClient } from "@/utils/supabase/server";
import { RivalesList } from "./rivales-list";

export const dynamic = "force-dynamic";

export default async function RivalesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: miembros } = await supabase
    .from("miembros-equipo")
    .select("equipo_id")
    .eq("user_id", user!.id)
    .limit(1);

  const equipoId = miembros?.[0]?.equipo_id;

  if (!equipoId) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-neutral-500">
        No estás asignado a ningún equipo todavía.
      </div>
    );
  }

  const { data: rivales } = await supabase
    .from("rivales")
    .select("*")
    .eq("equipo_id", equipoId)
    .order("nombre");

  return <RivalesList rivales={rivales ?? []} equipoId={equipoId} />;
}
