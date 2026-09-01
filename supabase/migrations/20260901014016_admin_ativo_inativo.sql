-- Adiciona controle de ativo/inativo para produtores e empresas: o admin
-- pode suspender um cadastro sem apagá-lo. Um registro inativo some das
-- views públicas (produtores_publico/empresas_publico), portanto não
-- aparece mais no matching visto por outros usuários, mas continua salvo
-- no banco para o admin ver/reativar depois.

-- 1. Nova coluna, default true (comportamento atual preservado: tudo
--    visível até que o admin decida desativar algo).
ALTER TABLE "public"."produtores"
  ADD COLUMN "ativo" boolean NOT NULL DEFAULT true;

ALTER TABLE "public"."empresas"
  ADD COLUMN "ativo" boolean NOT NULL DEFAULT true;

-- 2. Views públicas passam a filtrar por ativo = true. A view não expõe
--    a coluna "ativo" (anon não precisa saber o valor, só precisa não
--    ver a linha quando for false) — o filtro roda no WHERE da view sob
--    security_invoker=true, ou seja, com o papel do chamador (anon).
CREATE OR REPLACE VIEW "public"."produtores_publico" WITH ("security_invoker"='true') AS
 SELECT "id",
    "municipio",
    "uf",
    "atividade",
    "categoria_desafio",
    "desc_desafio",
    "urgencia",
    "porte",
    "criado_em"
   FROM "public"."produtores"
   WHERE "ativo" = true;

CREATE OR REPLACE VIEW "public"."empresas_publico" WITH ("security_invoker"='true') AS
 SELECT "id",
    "uf",
    "regioes_atendidas",
    "categoria_solucao",
    "desc_solucao",
    "estagio",
    "porte_alvo",
    "criado_em"
   FROM "public"."empresas"
   WHERE "ativo" = true;

-- 3. anon precisa poder LER "ativo" na tabela base (o Postgres exige
--    privilégio de SELECT na coluna usada em qualquer cláusula da view,
--    mesmo que ela não apareça no SELECT list) — mas continua sem poder
--    ler essa coluna fora da view nem alterá-la.
GRANT SELECT ("ativo") ON TABLE "public"."produtores" TO "anon";
GRANT SELECT ("ativo") ON TABLE "public"."empresas" TO "anon";

-- authenticated (admin) já tem GRANT SELECT na tabela inteira — cobre a
-- coluna nova automaticamente, nenhuma mudança necessária aí.

-- 4. UPDATE não existia em produtores/empresas para ninguém. Concedemos
--    UPDATE só da coluna "ativo" para authenticated (o admin) — mesmo
--    princípio de mínimo privilégio por coluna já usado no SELECT do anon.
GRANT UPDATE ("ativo") ON TABLE "public"."produtores" TO "authenticated";
GRANT UPDATE ("ativo") ON TABLE "public"."empresas" TO "authenticated";

-- 5. RLS: policy de UPDATE restrita a authenticated (só admin logado
--    pode alternar ativo/inativo). WITH CHECK (true) porque o controle
--    fino já está no GRANT por coluna acima.
CREATE POLICY "admin_atualiza_ativo_produtores" ON "public"."produtores"
  FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "admin_atualiza_ativo_empresas" ON "public"."empresas"
  FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);

-- 6. Impede cadastro duplicado por reenvio acidental do formulário
--    (double-submit, F5, clique duplo antes do disabled aplicar, etc.):
--    mesmo e-mail + telefone inseridos dentro do mesmo minuto viram uma
--    violação de unicidade. Trunca para o minuto (não segundo) para dar
--    folga a pequenas variações de rede/latência entre cliques.
--    date_trunc(text, timestamptz) não é IMMUTABLE (o resultado depende
--    do timezone da sessão), então não pode indexar direto — convertendo
--    para timestamp em UTC primeiro (::timestamp após AT TIME ZONE
--    'UTC') a expressão fica determinística e aceitável em índice.
CREATE UNIQUE INDEX "produtores_sem_duplicata_recente"
  ON "public"."produtores" ("email", "telefone",
    (date_trunc('minute', "criado_em" AT TIME ZONE 'UTC')));

CREATE UNIQUE INDEX "empresas_sem_duplicata_recente"
  ON "public"."empresas" ("email", "telefone",
    (date_trunc('minute', "criado_em" AT TIME ZONE 'UTC')));

-- 7. Como anon não tem (e não deve ganhar) permissão de SELECT em
--    email/telefone, não dá para a Server Action simplesmente consultar
--    "qual é o id do cadastro que já existe" após um conflito de
--    unicidade. Em vez disso, o cadastro em si passa a rodar dentro de
--    uma função SECURITY DEFINER: ela insere e, se colidir com a
--    constraint acima (23505), busca e devolve o id do registro
--    conflitante — tudo com o privilégio do dono da função (postgres),
--    nunca expondo a leitura de colunas sensíveis para o papel anon que
--    a chama. Precisa ficar no schema "public" para ser alcançável via
--    RPC do supabase-js (só public/graphql_public são expostos pela Data
--    API — ver supabase/config.toml), mas isso não a torna um endpoint
--    de leitura de tabela: funções só são chamáveis via RPC explícito
--    pelo nome exato, nunca listadas/descobertas como recurso da API.
CREATE OR REPLACE FUNCTION "public"."cadastrar_produtor_idempotente"(
  p_nome text, p_email text, p_telefone text, p_municipio text, p_uf text,
  p_atividade text, p_categoria_desafio text, p_desc_desafio text,
  p_urgencia text, p_porte text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO produtores (nome, email, telefone, municipio, uf, atividade,
    categoria_desafio, desc_desafio, urgencia, porte)
  VALUES (p_nome, p_email, p_telefone, p_municipio, p_uf, p_atividade,
    p_categoria_desafio, p_desc_desafio, p_urgencia, p_porte)
  RETURNING id INTO v_id;
  RETURN v_id;
EXCEPTION WHEN unique_violation THEN
  SELECT id INTO v_id FROM produtores
    WHERE email = p_email AND telefone = p_telefone
      AND criado_em >= now() - interval '2 minutes'
    ORDER BY criado_em DESC LIMIT 1;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."cadastrar_empresa_idempotente"(
  p_nome_empresa text, p_responsavel text, p_email text, p_telefone text,
  p_uf text, p_regioes_atendidas text, p_categoria_solucao text,
  p_desc_solucao text, p_estagio text, p_porte_alvo text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO empresas (nome_empresa, responsavel, email, telefone, uf,
    regioes_atendidas, categoria_solucao, desc_solucao, estagio, porte_alvo)
  VALUES (p_nome_empresa, p_responsavel, p_email, p_telefone, p_uf,
    p_regioes_atendidas, p_categoria_solucao, p_desc_solucao, p_estagio, p_porte_alvo)
  RETURNING id INTO v_id;
  RETURN v_id;
EXCEPTION WHEN unique_violation THEN
  SELECT id INTO v_id FROM empresas
    WHERE email = p_email AND telefone = p_telefone
      AND criado_em >= now() - interval '2 minutes'
    ORDER BY criado_em DESC LIMIT 1;
  RETURN v_id;
END;
$$;

-- Postgres concede EXECUTE a PUBLIC por padrão em toda função nova — como
-- essas duas já são o único caminho de escrita pretendido (a Server
-- Action chama por RPC, não mais via .insert() direto), o comportamento
-- padrão já é o desejado; os GRANTs abaixo só deixam isso explícito.
GRANT EXECUTE ON FUNCTION "public"."cadastrar_produtor_idempotente" TO "anon", "authenticated";
GRANT EXECUTE ON FUNCTION "public"."cadastrar_empresa_idempotente" TO "anon", "authenticated";
