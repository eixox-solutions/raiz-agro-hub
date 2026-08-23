SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."empresas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome_empresa" "text" NOT NULL,
    "responsavel" "text" NOT NULL,
    "email" "text" NOT NULL,
    "telefone" "text" NOT NULL,
    "uf" "text" NOT NULL,
    "regioes_atendidas" "text" NOT NULL,
    "categoria_solucao" "text" NOT NULL,
    "desc_solucao" "text",
    "estagio" "text" NOT NULL,
    "porte_alvo" "text" NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "empresas_regioes_atendidas_check" CHECK (("regioes_atendidas" = ANY (ARRAY['estado'::"text", 'nacional'::"text"])))
);

ALTER TABLE "public"."empresas" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."empresas_publico" WITH ("security_invoker"='true') AS
 SELECT "id",
    "uf",
    "regioes_atendidas",
    "categoria_solucao",
    "desc_solucao",
    "estagio",
    "porte_alvo",
    "criado_em"
   FROM "public"."empresas";

ALTER VIEW "public"."empresas_publico" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "produtor_id" "uuid" NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "score" integer NOT NULL,
    "status" "text" DEFAULT 'conexao_solicitada'::"text" NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "matches_score_check" CHECK ((("score" >= 0) AND ("score" <= 100)))
);

ALTER TABLE "public"."matches" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."produtores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "email" "text" NOT NULL,
    "telefone" "text" NOT NULL,
    "municipio" "text" NOT NULL,
    "uf" "text" NOT NULL,
    "atividade" "text" NOT NULL,
    "categoria_desafio" "text" NOT NULL,
    "desc_desafio" "text",
    "urgencia" "text" NOT NULL,
    "porte" "text" NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "produtores_urgencia_check" CHECK (("urgencia" = ANY (ARRAY['baixa'::"text", 'media'::"text", 'alta'::"text"])))
);

ALTER TABLE "public"."produtores" OWNER TO "postgres";

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
   FROM "public"."produtores";

ALTER VIEW "public"."produtores_publico" OWNER TO "postgres";

ALTER TABLE ONLY "public"."empresas"
    ADD CONSTRAINT "empresas_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_produtor_id_empresa_id_key" UNIQUE ("produtor_id", "empresa_id");

ALTER TABLE ONLY "public"."produtores"
    ADD CONSTRAINT "produtores_pkey" PRIMARY KEY ("id");

CREATE INDEX "idx_matches_empresa_id" ON "public"."matches" USING "btree" ("empresa_id");

ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_produtor_id_fkey" FOREIGN KEY ("produtor_id") REFERENCES "public"."produtores"("id") ON DELETE CASCADE;

CREATE POLICY "admin_le_empresas_completo" ON "public"."empresas" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "admin_le_matches" ON "public"."matches" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "admin_le_produtores_completo" ON "public"."produtores" FOR SELECT TO "authenticated" USING (true);

ALTER TABLE "public"."empresas" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."produtores" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qualquer_um_pode_atualizar_match_existente" ON "public"."matches" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);

CREATE POLICY "qualquer_um_pode_cadastrar_empresa" ON "public"."empresas" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);

CREATE POLICY "qualquer_um_pode_cadastrar_produtor" ON "public"."produtores" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);

CREATE POLICY "qualquer_um_pode_ler_proprio_match_recem_criado" ON "public"."matches" FOR SELECT TO "anon" USING (true);

CREATE POLICY "qualquer_um_pode_solicitar_conexao_insert" ON "public"."matches" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);

-- SELECT policies (nível de LINHA) para anon nas tabelas base: permitem que
-- as views produtores_publico/empresas_publico (security_invoker = true)
-- leiam linhas em nome do visitante anônimo. Isto sozinho NÃO expõe dados
-- de contato — o controle de COLUNA vem dos GRANTs abaixo (GRANT SELECT
-- com lista explícita de colunas, nunca a tabela inteira), então mesmo que
-- código de aplicação futuro tente `select * from produtores` com a chave
-- anon, o Postgres rejeita as colunas fora da lista antes de qualquer RLS.
CREATE POLICY "anon_le_produtores_via_view_publica" ON "public"."produtores" FOR SELECT TO "anon" USING (true);

CREATE POLICY "anon_le_empresas_via_view_publica" ON "public"."empresas" FOR SELECT TO "anon" USING (true);

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

-- CRÍTICO: o bootstrap padrão do Supabase (roles.sql, executado antes de
-- qualquer migration nossa) já concede GRANT ALL a anon/authenticated em
-- TODAS as tabelas do schema public, via ALTER DEFAULT PRIVILEGES do role
-- postgres. GRANT é aditivo — nunca restringe um privilégio já concedido.
-- Por isso, antes de conceder qualquer coisa a anon/authenticated nestas
-- 3 tabelas, revogamos tudo explicitamente. Sem este REVOKE, qualquer
-- GRANT SELECT/INSERT feito depois apenas se soma ao ALL pré-existente
-- (incluindo SELECT irrestrito de todas as colunas, UPDATE, DELETE e
-- TRUNCATE — este último nem é filtrado por RLS) e a tabela continua
-- totalmente aberta.
REVOKE ALL ON TABLE "public"."produtores" FROM "anon", "authenticated";
REVOKE ALL ON TABLE "public"."empresas" FROM "anon", "authenticated";
REVOKE ALL ON TABLE "public"."matches" FROM "anon", "authenticated";
REVOKE ALL ON TABLE "public"."produtores_publico" FROM "anon", "authenticated";
REVOKE ALL ON TABLE "public"."empresas_publico" FROM "anon", "authenticated";

-- produtores/empresas: SELECT concedido POR COLUNA (nunca a tabela
-- inteira) para anon/authenticated, cobrindo exatamente os campos não-
-- sensíveis já projetados pelas views produtores_publico/empresas_publico.
-- Isso é o que efetivamente impede um `select telefone from produtores`
-- (ou um `select *`) como anon: o Postgres rejeita a coluna fora da lista
-- de privilégio ANTES de qualquer avaliação de RLS — a proteção é do
-- próprio banco, não uma convenção de código de aplicação.
GRANT INSERT ON TABLE "public"."produtores" TO "anon", "authenticated";
GRANT SELECT (id, municipio, uf, atividade, categoria_desafio, desc_desafio, urgencia, porte, criado_em)
  ON TABLE "public"."produtores" TO "anon", "authenticated";
GRANT ALL ON TABLE "public"."produtores" TO "service_role";

GRANT INSERT ON TABLE "public"."empresas" TO "anon", "authenticated";
GRANT SELECT (id, uf, regioes_atendidas, categoria_solucao, desc_solucao, estagio, porte_alvo, criado_em)
  ON TABLE "public"."empresas" TO "anon", "authenticated";
GRANT ALL ON TABLE "public"."empresas" TO "service_role";

GRANT SELECT ON TABLE "public"."empresas_publico" TO "anon";
GRANT SELECT ON TABLE "public"."empresas_publico" TO "authenticated";
GRANT ALL ON TABLE "public"."empresas_publico" TO "service_role";

GRANT SELECT, INSERT, UPDATE ON TABLE "public"."matches" TO "anon";
GRANT SELECT, INSERT, UPDATE ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";

GRANT SELECT ON TABLE "public"."produtores_publico" TO "anon";
GRANT SELECT ON TABLE "public"."produtores_publico" TO "authenticated";
GRANT ALL ON TABLE "public"."produtores_publico" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

-- NÃO herdamos "GRANT ALL ON TABLES" para anon/authenticated como padrão
-- para tabelas futuras: cada tabela nova deve receber grants explícitos e
-- deliberados (como fizemos acima para produtores/empresas/matches),
-- nunca acesso amplo por omissão.
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
