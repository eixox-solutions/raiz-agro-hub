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

  // Insere via RPC (função private.cadastrar_produtor_idempotente) em vez
  // de .insert() direto: se o mesmo formulário for reenviado por engano
  // (double-submit, F5, voltar e enviar de novo), a função devolve o id
  // do cadastro que já existe em vez de duplicar. Precisa ser via RPC
  // (SECURITY DEFINER) porque a visitante anônimo não tem permissão de
  // ler e-mail/telefone diretamente — só a função, rodando com privilégio
  // elevado internamente, pode checar a duplicata.
  const { data, error } = await supabase.rpc("cadastrar_produtor_idempotente", {
    p_nome: nome,
    p_email: email,
    p_telefone: telefone,
    p_municipio: municipio,
    p_uf: uf,
    p_atividade: atividade,
    p_categoria_desafio: categoriaDesafio,
    p_desc_desafio: typeof descDesafio === "string" ? descDesafio.trim() : "",
    p_urgencia: urgencia,
    p_porte: porte,
  });

  if (error || !data) {
    return { error: "Não foi possível salvar seu cadastro. Tente novamente." };
  }

  return { id: data };
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

  // Mesmo padrão do cadastro de produtor: RPC idempotente para não criar
  // duplicata em reenvio acidental do formulário.
  const { data, error } = await supabase.rpc("cadastrar_empresa_idempotente", {
    p_nome_empresa: nomeEmpresa,
    p_responsavel: responsavel,
    p_email: email,
    p_telefone: telefone,
    p_uf: uf,
    p_regioes_atendidas: regioesAtendidas,
    p_categoria_solucao: categoriaSolucao,
    p_desc_solucao: typeof descSolucao === "string" ? descSolucao.trim() : "",
    p_estagio: estagio,
    p_porte_alvo: porteAlvo,
  });

  if (error || !data) {
    return { error: "Não foi possível salvar seu cadastro. Tente novamente." };
  }

  return { id: data };
}
