import { createClient } from "@/lib/supabase/server";
import { SecaoTabela } from "@/components/admin/secao-tabela";
import type { LinhaTabela } from "@/components/admin/data-table";
import type { CampoDetalhe } from "@/components/admin/detalhes-modal";
import { logout, exportarProdutoresCsv, exportarEmpresasCsv, exportarConexoesCsv } from "./actions";

const ITENS_POR_PAGINA = 20;
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

function paginaValida(valor: string | undefined) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 1 ? Math.floor(numero) : 1;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    produtoresPagina?: string;
    empresasPagina?: string;
    conexoesPagina?: string;
  }>;
}) {
  const { produtoresPagina, empresasPagina, conexoesPagina } = await searchParams;
  const paginaProdutores = paginaValida(produtoresPagina);
  const paginaEmpresas = paginaValida(empresasPagina);
  const paginaConexoes = paginaValida(conexoesPagina);

  const supabase = await createClient();

  const { data: produtores, count: totalProdutores } = await supabase
    .from("produtores")
    .select("*", { count: "exact" })
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range((paginaProdutores - 1) * ITENS_POR_PAGINA, paginaProdutores * ITENS_POR_PAGINA - 1);

  const { data: empresas, count: totalEmpresas } = await supabase
    .from("empresas")
    .select("*", { count: "exact" })
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range((paginaEmpresas - 1) * ITENS_POR_PAGINA, paginaEmpresas * ITENS_POR_PAGINA - 1);

  const { data: matches, count: totalConexoes } = await supabase
    .from("matches")
    .select("id, score, criado_em, produtores(nome), empresas(nome_empresa)", { count: "exact" })
    .eq("status", "conexao_solicitada")
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range((paginaConexoes - 1) * ITENS_POR_PAGINA, paginaConexoes * ITENS_POR_PAGINA - 1);

  const linhasProdutores: LinhaTabela[] = (produtores ?? []).map((p) => ({
    id: p.id,
    ativo: p.ativo,
    celulas: [p.nome, `${p.municipio}/${p.uf}`, p.categoria_desafio, p.urgencia, formatarData(p.criado_em)],
  }));
  const detalhesProdutores: Record<string, CampoDetalhe[]> = Object.fromEntries(
    (produtores ?? []).map((p) => [
      p.id,
      [
        { rotulo: "Nome", valor: p.nome },
        { rotulo: "E-mail", valor: p.email },
        { rotulo: "Telefone", valor: p.telefone },
        { rotulo: "Município/UF", valor: `${p.municipio}/${p.uf}` },
        { rotulo: "Atividade", valor: p.atividade },
        { rotulo: "Categoria do desafio", valor: p.categoria_desafio },
        { rotulo: "Descrição do desafio", valor: p.desc_desafio ?? "" },
        { rotulo: "Urgência", valor: p.urgencia },
        { rotulo: "Porte da propriedade", valor: p.porte },
        { rotulo: "Data de cadastro", valor: formatarData(p.criado_em) },
      ] satisfies CampoDetalhe[],
    ])
  );

  const linhasEmpresas: LinhaTabela[] = (empresas ?? []).map((e) => ({
    id: e.id,
    ativo: e.ativo,
    celulas: [e.nome_empresa, e.uf, e.categoria_solucao, e.estagio, formatarData(e.criado_em)],
  }));
  const detalhesEmpresas: Record<string, CampoDetalhe[]> = Object.fromEntries(
    (empresas ?? []).map((e) => [
      e.id,
      [
        { rotulo: "Nome da empresa", valor: e.nome_empresa },
        { rotulo: "Responsável", valor: e.responsavel },
        { rotulo: "E-mail", valor: e.email },
        { rotulo: "Telefone", valor: e.telefone },
        { rotulo: "UF", valor: e.uf },
        { rotulo: "Regiões atendidas", valor: e.regioes_atendidas },
        { rotulo: "Categoria da solução", valor: e.categoria_solucao },
        { rotulo: "Descrição da solução", valor: e.desc_solucao ?? "" },
        { rotulo: "Estágio", valor: e.estagio },
        { rotulo: "Porte alvo", valor: e.porte_alvo },
        { rotulo: "Data de cadastro", valor: formatarData(e.criado_em) },
      ] satisfies CampoDetalhe[],
    ])
  );

  const linhasConexoes: LinhaTabela[] = (matches ?? []).map((m) => {
    const nomeProdutor = (m.produtores as unknown as { nome: string } | null)?.nome ?? "Produtor removido";
    const nomeEmpresa =
      (m.empresas as unknown as { nome_empresa: string } | null)?.nome_empresa ?? "Empresa removida";
    return {
      id: m.id,
      celulas: [nomeProdutor, nomeEmpresa, `${m.score}%`, formatarData(m.criado_em)],
    };
  });
  const detalhesConexoes: Record<string, CampoDetalhe[]> = Object.fromEntries(
    (matches ?? []).map((m) => {
      const nomeProdutor = (m.produtores as unknown as { nome: string } | null)?.nome ?? "Produtor removido";
      const nomeEmpresa =
        (m.empresas as unknown as { nome_empresa: string } | null)?.nome_empresa ?? "Empresa removida";
      return [
        m.id,
        [
          { rotulo: "Produtor", valor: nomeProdutor },
          { rotulo: "Empresa", valor: nomeEmpresa },
          { rotulo: "Combina", valor: `${m.score}%` },
          { rotulo: "Data", valor: formatarData(m.criado_em) },
        ] satisfies CampoDetalhe[],
      ];
    })
  );

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-bg-card-alt rounded-lg p-4 text-center">
          <span className="block text-3xl font-heading font-bold text-primary">
            {totalProdutores ?? 0}
          </span>
          <span className="text-sm text-text-muted">Produtores cadastrados</span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 text-center">
          <span className="block text-3xl font-heading font-bold text-primary">
            {totalEmpresas ?? 0}
          </span>
          <span className="text-sm text-text-muted">Empresas cadastradas</span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 text-center">
          <span className="block text-3xl font-heading font-bold text-primary">
            {totalConexoes ?? 0}
          </span>
          <span className="text-sm text-text-muted">Conexões solicitadas</span>
        </div>
      </div>

      <SecaoTabela
        titulo="Produtores"
        colunas={["Nome", "Município/UF", "Categoria do Desafio", "Urgência", "Data de Cadastro"]}
        linhas={linhasProdutores}
        detalhesPorId={detalhesProdutores}
        mensagemVazia="Nenhum produtor cadastrado ainda."
        tabelaAlternavel="produtores"
        paginaAtual={paginaProdutores}
        totalPaginas={Math.max(1, Math.ceil((totalProdutores ?? 0) / ITENS_POR_PAGINA))}
        parametroPagina="produtoresPagina"
        nomeArquivoCsv="produtores.csv"
        buscarTodosParaExport={exportarProdutoresCsv}
      />

      <SecaoTabela
        titulo="Empresas"
        colunas={["Nome da Empresa", "UF", "Categoria da Solução", "Estágio", "Data de Cadastro"]}
        linhas={linhasEmpresas}
        detalhesPorId={detalhesEmpresas}
        mensagemVazia="Nenhuma empresa cadastrada ainda."
        tabelaAlternavel="empresas"
        paginaAtual={paginaEmpresas}
        totalPaginas={Math.max(1, Math.ceil((totalEmpresas ?? 0) / ITENS_POR_PAGINA))}
        parametroPagina="empresasPagina"
        nomeArquivoCsv="empresas.csv"
        buscarTodosParaExport={exportarEmpresasCsv}
      />

      <SecaoTabela
        titulo="Conexões Solicitadas"
        colunas={["Produtor", "Empresa", "Combina", "Data"]}
        linhas={linhasConexoes}
        detalhesPorId={detalhesConexoes}
        mensagemVazia="Nenhuma conexão solicitada ainda."
        paginaAtual={paginaConexoes}
        totalPaginas={Math.max(1, Math.ceil((totalConexoes ?? 0) / ITENS_POR_PAGINA))}
        parametroPagina="conexoesPagina"
        nomeArquivoCsv="conexoes.csv"
        buscarTodosParaExport={exportarConexoesCsv}
      />
    </main>
  );
}
