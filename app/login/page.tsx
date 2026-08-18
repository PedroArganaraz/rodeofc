import Image from "next/image";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 p-6"
      >
        <div className="flex flex-col items-center gap-3 pb-2 text-center">
          <Image
            src="/logo.png"
            alt="Rodeo Football Club"
            width={505}
            height={469}
            priority
            className="h-20 w-auto"
          />
          <h1 className="text-2xl font-semibold text-neutral-900">
            Rodeo FC
          </h1>
        </div>
        <p className="flex justify-center">
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-brand-navy">
            Cuerpo Técnico
          </span>
        </p>

        {error ? (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-sm font-medium text-neutral-500"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-neutral-500"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-neutral-900"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-brand-navy px-3 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
