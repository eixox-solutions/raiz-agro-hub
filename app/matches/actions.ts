"use server";

import { createClient } from "@/lib/supabase/server";

export async function solicitarConexao(
  produtorId: string,
  empresaId: string,
  score: number
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("matches")
    .upsert(
      { produtor_id: produtorId, empresa_id: empresaId, score, status: "conexao_solicitada" },
      { onConflict: "produtor_id,empresa_id" }
    );

  if (error) {
    return { error: "Não foi possível registrar seu interesse. Tente novamente." };
  }

  return { ok: true };
}
