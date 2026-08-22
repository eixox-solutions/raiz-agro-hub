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

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."empresas" TO "anon";
GRANT ALL ON TABLE "public"."empresas" TO "authenticated";
GRANT ALL ON TABLE "public"."empresas" TO "service_role";

GRANT SELECT ON TABLE "public"."empresas_publico" TO "anon";
GRANT SELECT ON TABLE "public"."empresas_publico" TO "authenticated";
GRANT ALL ON TABLE "public"."empresas_publico" TO "service_role";

GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";

GRANT ALL ON TABLE "public"."produtores" TO "anon";
GRANT ALL ON TABLE "public"."produtores" TO "authenticated";
GRANT ALL ON TABLE "public"."produtores" TO "service_role";

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

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
