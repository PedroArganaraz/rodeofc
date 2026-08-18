import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">RodeoFC</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        Conectado como <span className="font-medium">{user?.email}</span>
      </p>
      <form action="/logout" method="post">
        <button
          type="submit"
          className="rounded-md border border-black/15 px-3 py-2 text-sm font-medium dark:border-white/15"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
