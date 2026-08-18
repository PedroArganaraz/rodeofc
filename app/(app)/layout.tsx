import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between bg-blue-500 px-6 py-4 text-white">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/logo.png"
            alt="Rodeo Football Club"
            width={505}
            height={469}
            className="h-8 w-auto"
          />
          Rodeo FC
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-white/70 sm:inline">
            {user.email}
          </span>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="rounded-xl border border-white/30 px-3 py-1.5 text-sm font-medium hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
