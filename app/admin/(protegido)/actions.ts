"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const FUSO_HORARIO = "America/Campo_Grande";

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: FUSO_HORARIO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

type TabelaAlternavel = "produtores" | "empresas";

export async function alternarAtivo(
  tabela: TabelaAlternavel,
  id: string,
  ativo: boolean
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { error, data } = await supabase
    .from(tabela)
    .update({ ativo })
    .eq("id", id)
    .select("id");

  if (error) {
    return { error: "Não foi possível atualizar o status do cadastro." };
  }

  if (!data || data.length === 0) {
    return { error: "Cadastro não encontrado ou sem permissão para atualizar." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function exportarProdutoresCsv(): Promise<string[][]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("produtores")
    .select("*")
    .order("criado_em", { ascending: false });

  return (data ?? []).map((p) => [
    p.nome,
    `${p.municipio}/${p.uf}`,
    p.categoria_desafio,
    p.urgencia,
    formatarData(p.criado_em),
  ]);
}

export async function exportarEmpresasCsv(): Promise<string[][]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("empresas")
    .select("*")
    .order("criado_em", { ascending: false });

  return (data ?? []).map((e) => [
    e.nome_empresa,
    e.uf,
    e.categoria_solucao,
    e.estagio,
    formatarData(e.criado_em),
  ]);
}

export async function exportarConexoesCsv(): Promise<string[][]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select("score, criado_em, produtores(nome), empresas(nome_empresa)")
    .eq("status", "conexao_solicitada")
    .order("criado_em", { ascending: false });

  return (data ?? []).map((m) => [
    (m.produtores as unknown as { nome: string } | null)?.nome ?? "Produtor removido",
    (m.empresas as unknown as { nome_empresa: string } | null)?.nome_empresa ?? "Empresa removida",
    `${m.score}%`,
    formatarData(m.criado_em),
  ]);
}
