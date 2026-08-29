import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/data-table";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { logout } from "./actions";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: produtores } = await supabase
    .from("produtores")
    .select("nome, municipio, uf, categoria_desafio, urgencia, criado_em")
    .order("criado_em", { ascending: false });

  const { data: empresas } = await supabase
    .from("empresas")
    .select("nome_empresa, uf, categoria_solucao, estagio, criado_em")
    .order("criado_em", { ascending: false });

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "score, criado_em, produtores(nome), empresas(nome_empresa)"
    )
    .eq("status", "conexao_solicitada")
    .order("criado_em", { ascending: false });

  const totalProdutores = produtores?.length ?? 0;
  const totalEmpresas = empresas?.length ?? 0;
  const totalConexoes = matches?.length ?? 0;

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR");

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-2xl text-primary">
          Raiz Agro Hub — Painel
        </h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-text-muted underline">
            Sair
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-bg-card-alt rounded-lg p-4 text-center">
          <span className="block text-3xl font-heading font-bold text-primary">
            {totalProdutores}
          </span>
          <span className="text-sm text-text-muted">Produtores cadastrados</span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 text-center">
          <span className="block text-3xl font-heading font-bold text-primary">
            {totalEmpresas}
          </span>
          <span className="text-sm text-text-muted">Empresas cadastradas</span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 text-center">
          <span className="block text-3xl font-heading font-bold text-primary">
            {totalConexoes}
          </span>
          <span className="text-sm text-text-muted">Conexões solicitadas</span>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-heading text-lg text-primary">Produtores</h2>
          <CsvExportButton
            nomeArquivo="produtores.csv"
            cabecalho={["Nome", "Município", "UF", "Categoria do Desafio", "Urgência", "Data"]}
            linhas={(produtores ?? []).map((p) => [
              p.nome,
              p.municipio,
              p.uf,
              p.categoria_desafio,
              p.urgencia,
              formatarData(p.criado_em),
            ])}
          />
        </div>
        <DataTable
          colunas={["Nome", "Município/UF", "Categoria do Desafio", "Urgência", "Data de Cadastro"]}
          linhas={(produtores ?? []).map((p) => [
            p.nome,
            `${p.municipio}/${p.uf}`,
            p.categoria_desafio,
            p.urgencia,
            formatarData(p.criado_em),
          ])}
          mensagemVazia="Nenhum produtor cadastrado ainda."
        />
      </section>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-heading text-lg text-primary">Empresas</h2>
          <CsvExportButton
            nomeArquivo="empresas.csv"
            cabecalho={["Nome da Empresa", "UF", "Categoria da Solução", "Estágio", "Data"]}
            linhas={(empresas ?? []).map((e) => [
              e.nome_empresa,
              e.uf,
              e.categoria_solucao,
              e.estagio,
              formatarData(e.criado_em),
            ])}
          />
        </div>
        <DataTable
          colunas={["Nome da Empresa", "UF", "Categoria da Solução", "Estágio", "Data de Cadastro"]}
          linhas={(empresas ?? []).map((e) => [
            e.nome_empresa,
            e.uf,
            e.categoria_solucao,
            e.estagio,
            formatarData(e.criado_em),
          ])}
          mensagemVazia="Nenhuma empresa cadastrada ainda."
        />
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-heading text-lg text-primary">
            Conexões Solicitadas
          </h2>
          <CsvExportButton
            nomeArquivo="conexoes.csv"
            cabecalho={["Produtor", "Empresa", "Combina", "Data"]}
            linhas={(matches ?? []).map((m) => [
              (m.produtores as unknown as { nome: string } | null)?.nome ?? "Produtor removido",
              (m.empresas as unknown as { nome_empresa: string } | null)?.nome_empresa ?? "Empresa removida",
              `${m.score}%`,
              formatarData(m.criado_em),
            ])}
          />
        </div>
        <DataTable
          colunas={["Produtor", "Empresa", "Combina", "Data"]}
          linhas={(matches ?? []).map((m) => [
            (m.produtores as unknown as { nome: string } | null)?.nome ?? "Produtor removido",
            (m.empresas as unknown as { nome_empresa: string } | null)?.nome_empresa ?? "Empresa removida",
            `${m.score}%`,
            formatarData(m.criado_em),
          ])}
          mensagemVazia="Nenhuma conexão solicitada ainda."
        />
      </section>
    </main>
  );
}
