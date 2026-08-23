"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(
  formData: FormData
): Promise<{ error: string } | never> {
  const email = formData.get("email");
  const senha = formData.get("senha");

  if (typeof email !== "string" || typeof senha !== "string" || !email || !senha) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect("/admin");
}
