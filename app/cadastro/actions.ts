"use server";

import { createClient } from "@/lib/supabase/server";
import { CATEGORIAS, ESTADOS, ATIVIDADES, URGENCIAS, PORTES, ESTAGIOS, REGIOES_ATENDIDAS } from "@/lib/constants";

function campoObrigatorio(formData: FormData, campo: string): string | null {
  const valor = formData.get(campo);
  if (typeof valor !== "string" || valor.trim() === "") return null;
  return valor.trim();
}

export async function cadastrarProdutor(
  formData: FormData
): Promise<{ id: string } | { error: string }> {
  const nome = campoObrigatorio(formData, "nome");
  const email = campoObrigatorio(formData, "email");
  const telefone = campoObrigatorio(formData, "telefone");
  const municipio = campoObrigatorio(formData, "municipio");
  const uf = campoObrigatorio(formData, "uf");
  const atividade = campoObrigatorio(formData, "atividade");
  const categoriaDesafio = campoObrigatorio(formData, "categoriaDesafio");
  const urgencia = campoObrigatorio(formData, "urgencia");
  const porte = campoObrigatorio(formData, "porte");
  const descDesafio = formData.get("descDesafio");

  if (!nome || !email || !telefone || !municipio || !uf || !atividade || !categoriaDesafio || !urgencia || !porte) {
    return { error: "Preencha todos os campos obrigatórios." };
  }
  if (!ESTADOS.includes(uf as (typeof ESTADOS)[number])) {
    return { error: "Estado inválido." };
  }
  if (!ATIVIDADES.includes(atividade as (typeof ATIVIDADES)[number])) {
    return { error: "Atividade inválida." };
  }
  if (!CATEGORIAS.includes(categoriaDesafio as (typeof CATEGORIAS)[number])) {
    return { error: "Categoria de desafio inválida." };
  }
  if (!URGENCIAS.includes(urgencia as (typeof URGENCIAS)[number])) {
    return { error: "Urgência inválida." };
  }
  if (!PORTES.includes(porte as (typeof PORTES)[number])) {
    return { error: "Porte inválido." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtores")
    .insert({
      nome,
      email,
      telefone,
      municipio,
      uf,
      atividade,
      categoria_desafio: categoriaDesafio,
      desc_desafio: typeof descDesafio === "string" ? descDesafio.trim() : "",
      urgencia,
      porte,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível salvar seu cadastro. Tente novamente." };
  }

  return { id: data.id };
}

export async function cadastrarEmpresa(
  formData: FormData
): Promise<{ id: string } | { error: string }> {
  const nomeEmpresa = campoObrigatorio(formData, "nomeEmpresa");
  const responsavel = campoObrigatorio(formData, "responsavel");
  const email = campoObrigatorio(formData, "email");
  const telefone = campoObrigatorio(formData, "telefone");
  const uf = campoObrigatorio(formData, "uf");
  const regioesAtendidas = campoObrigatorio(formData, "regioesAtendidas");
  const categoriaSolucao = campoObrigatorio(formData, "categoriaSolucao");
  const estagio = campoObrigatorio(formData, "estagio");
  const porteAlvo = campoObrigatorio(formData, "porteAlvo");
  const descSolucao = formData.get("descSolucao");

  if (!nomeEmpresa || !responsavel || !email || !telefone || !uf || !regioesAtendidas || !categoriaSolucao || !estagio || !porteAlvo) {
    return { error: "Preencha todos os campos obrigatórios." };
  }
  if (!ESTADOS.includes(uf as (typeof ESTADOS)[number])) {
    return { error: "Estado inválido." };
  }
  if (!REGIOES_ATENDIDAS.includes(regioesAtendidas as (typeof REGIOES_ATENDIDAS)[number])) {
    return { error: "Região atendida inválida." };
  }
  if (!CATEGORIAS.includes(categoriaSolucao as (typeof CATEGORIAS)[number])) {
    return { error: "Categoria de solução inválida." };
  }
  if (!ESTAGIOS.includes(estagio as (typeof ESTAGIOS)[number])) {
    return { error: "Estágio inválido." };
  }
  if (!PORTES.includes(porteAlvo as (typeof PORTES)[number])) {
    return { error: "Porte alvo inválido." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .insert({
      nome_empresa: nomeEmpresa,
      responsavel,
      email,
      telefone,
      uf,
      regioes_atendidas: regioesAtendidas,
      categoria_solucao: categoriaSolucao,
      desc_solucao: typeof descSolucao === "string" ? descSolucao.trim() : "",
      estagio,
      porte_alvo: porteAlvo,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível salvar seu cadastro. Tente novamente." };
  }

  return { id: data.id };
}
