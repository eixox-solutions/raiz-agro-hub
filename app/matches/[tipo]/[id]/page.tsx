import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { rankearEmpresasParaProdutor, rankearProdutoresParaEmpresa } from "@/lib/match";
import { MatchCard } from "@/components/matches/match-card";

const MAX_RESULTADOS = 5;

export const metadata: Metadata = {
  title: "Suas combinações | Raiz Agro Hub",
  description:
    "Veja as empresas ou produtores rurais mais compatíveis com o seu cadastro no Raiz Agro Hub.",
  robots: {
    index: false,
    follow: false,
  },
};

type Params = { tipo: string; id: string };
type SearchParams = { nome?: string };

export default async function MatchesPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { tipo, id } = await params;
  const { nome: nomeQuery } = await searchParams;

  if (tipo !== "produtor" && tipo !== "empresa") {
    return (
      <ErroCadastroNaoEncontrado
        mensagem="Não conseguimos identificar seu perfil. Faça seu cadastro para ver suas combinações."
        linkHref="/cadastro/produtor"
        linkTexto="Fazer meu cadastro"
      />
    );
  }

  const supabase = await createClient();

  if (tipo === "produtor") {
    const { data: produtor } = await supabase
      .from("produtores")
      .select("id, categoria_desafio, uf, porte")
      .eq("id", id)
      .maybeSingle();

    if (!produtor) {
      return (
        <ErroCadastroNaoEncontrado
          mensagem="Não encontramos esse cadastro de produtor."
          linkHref="/cadastro/produtor"
          linkTexto="Fazer novo cadastro"
        />
      );
    }

    const nomeProdutor = nomeQuery && nomeQuery.trim() !== "" ? nomeQuery : "Produtor";

    const { data: empresas } = await supabase
      .from("empresas_publico")
      .select("id, categoria_solucao, regioes_atendidas, uf, porte_alvo, desc_solucao, estagio");

    if (!empresas || empresas.length === 0) {
      return (
        <EstadoVazio
          mensagem="Ainda não há empresas cadastradas com soluções pra te mostrar. Assim que uma empresa se cadastrar, a gente te avisa!"
          linkHref="/cadastro/empresa"
          linkTexto="Cadastrar Empresa"
        />
      );
    }

    const ranking = rankearEmpresasParaProdutor(
      { categoriaDesafio: produtor.categoria_desafio, uf: produtor.uf, porte: produtor.porte },
      empresas.map((e) => ({
        id: e.id!,
        categoriaSolucao: e.categoria_solucao!,
        regioesAtendidas: e.regioes_atendidas!,
        uf: e.uf!,
        porteAlvo: e.porte_alvo!,
        descSolucao: e.desc_solucao,
        estagio: e.estagio!,
      }))
    ).slice(0, MAX_RESULTADOS);

    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-text-muted mb-6 inline-block">
          ← Voltar para o site
        </Link>
        <h1 className="font-heading text-3xl text-primary mb-2">
          Suas melhores opções, {nomeProdutor}
        </h1>
        <p className="text-text-muted mb-8">
          Empresas que podem resolver o seu desafio, começando pelas que mais
          combinam.
        </p>
        <div className="flex flex-col gap-4">
          {ranking.map(({ empresa, score, faixa }) => (
            <MatchCard
              key={empresa.id}
              produtorId={produtor.id}
              empresaId={empresa.id}
              score={score}
              faixa={faixa}
              nome={empresa.categoriaSolucao}
              categoria={empresa.categoriaSolucao}
              descricao={empresa.descSolucao}
              extraLabel="Estágio"
              extraValor={empresa.estagio}
              botaoTexto="Falar com essa Empresa"
            />
          ))}
        </div>
      </main>
    );
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, categoria_solucao, uf, regioes_atendidas, porte_alvo")
    .eq("id", id)
    .maybeSingle();

  if (!empresa) {
    return (
      <ErroCadastroNaoEncontrado
        mensagem="Não encontramos esse cadastro de empresa."
        linkHref="/cadastro/empresa"
        linkTexto="Fazer novo cadastro"
      />
    );
  }

  const nomeEmpresa = nomeQuery && nomeQuery.trim() !== "" ? nomeQuery : "Sua empresa";

  const { data: produtores } = await supabase
    .from("produtores_publico")
    .select("id, categoria_desafio, uf, porte, desc_desafio, urgencia");

  if (!produtores || produtores.length === 0) {
    return (
      <EstadoVazio
        mensagem="Ainda não há produtores cadastrados com desafios pra te mostrar. Assim que um produtor se cadastrar, a gente te avisa!"
        linkHref="/cadastro/produtor"
        linkTexto="Cadastrar Produtor"
      />
    );
  }

  const ranking = rankearProdutoresParaEmpresa(
    {
      categoriaSolucao: empresa.categoria_solucao,
      regioesAtendidas: empresa.regioes_atendidas,
      uf: empresa.uf,
      porteAlvo: empresa.porte_alvo,
    },
    produtores.map((p) => ({
      id: p.id!,
      categoriaDesafio: p.categoria_desafio!,
      uf: p.uf!,
      porte: p.porte!,
      descDesafio: p.desc_desafio,
      urgencia: p.urgencia!,
    }))
  ).slice(0, MAX_RESULTADOS);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-text-muted mb-6 inline-block">
        ← Voltar para o site
      </Link>
      <h1 className="font-heading text-3xl text-primary mb-2">
        Produtores que combinam com sua solução
      </h1>
      <p className="text-text-muted mb-8">
        {nomeEmpresa}, esses são os produtores mais alinhados com o
        que você resolve.
      </p>
      <div className="flex flex-col gap-4">
        {ranking.map(({ produtor, score, faixa }) => (
          <MatchCard
            key={produtor.id}
            produtorId={produtor.id}
            empresaId={empresa.id}
            score={score}
            faixa={faixa}
            nome={produtor.categoriaDesafio}
            categoria={produtor.categoriaDesafio}
            descricao={produtor.descDesafio}
            extraLabel="Urgência"
            extraValor={produtor.urgencia}
            botaoTexto="Falar com esse Produtor"
          />
        ))}
      </div>
    </main>
  );
}

function ErroCadastroNaoEncontrado({
  mensagem,
  linkHref,
  linkTexto,
}: {
  mensagem: string;
  linkHref: string;
  linkTexto: string;
}) {
  return (
    <main className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="font-heading text-2xl text-primary mb-2">
        Não encontramos esse cadastro
      </h1>
      <p className="text-text-muted mb-6">{mensagem}</p>
      <Link
        href={linkHref}
        className="inline-block bg-accent text-white font-heading font-semibold px-6 py-3 rounded-full"
      >
        {linkTexto}
      </Link>
    </main>
  );
}

function EstadoVazio({
  mensagem,
  linkHref,
  linkTexto,
}: {
  mensagem: string;
  linkHref: string;
  linkTexto: string;
}) {
  return (
    <main className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="font-heading text-2xl text-primary mb-2">
        Ainda não temos combinações
      </h1>
      <p className="text-text-muted mb-6">{mensagem}</p>
      <Link
        href={linkHref}
        className="inline-block bg-accent text-white font-heading font-semibold px-6 py-3 rounded-full"
      >
        {linkTexto}
      </Link>
    </main>
  );
}
