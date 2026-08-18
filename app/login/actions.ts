"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { AuthError } from "@supabase/supabase-js";

function translateAuthError(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Email o contraseña incorrectos";
    case "email_not_confirmed":
      return "Confirmá tu email antes de iniciar sesión";
    case "too_many_requests":
      return "Demasiados intentos. Esperá unos minutos y volvé a intentar";
    default:
      return "No se pudo iniciar sesión. Intentá de nuevo";
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(translateAuthError(error))}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
