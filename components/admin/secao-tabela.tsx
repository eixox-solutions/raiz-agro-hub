"use client";

import { useState } from "react";
import { DataTable, type LinhaTabela } from "./data-table";
import { DetalhesModal, type CampoDetalhe } from "./detalhes-modal";
import { CsvExportButton } from "./csv-export-button";
import { Paginacao } from "./paginacao";
import { alternarAtivo } from "@/app/admin/(protegido)/actions";

export function SecaoTabela({
  titulo,
  colunas,
  linhas,
  detalhesPorId,
  mensagemVazia,
  tabelaAlternavel,
  paginaAtual,
  totalPaginas,
  parametroPagina,
  nomeArquivoCsv,
  buscarTodosParaExport,
}: {
  titulo: string;
  colunas: string[];
  linhas: LinhaTabela[];
  detalhesPorId: Record<string, CampoDetalhe[]>;
  mensagemVazia: string;
  tabelaAlternavel?: "produtores" | "empresas";
  paginaAtual: number;
  totalPaginas: number;
  parametroPagina: string;
  nomeArquivoCsv: string;
  buscarTodosParaExport: () => Promise<string[][]>;
}) {
  const [idDetalheAberto, setIdDetalheAberto] = useState<string | null>(null);

  async function handleToggleAtivo(id: string, ativoAtual: boolean) {
    if (!tabelaAlternavel) return;
    await alternarAtivo(tabelaAlternavel, id, !ativoAtual);
  }

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-heading text-lg text-primary">{titulo}</h2>
        <CsvExportButton nomeArquivo={nomeArquivoCsv} cabecalho={colunas} buscarDados={buscarTodosParaExport} />
      </div>
      <DataTable
        colunas={colunas}
        linhas={linhas}
        mensagemVazia={mensagemVazia}
        onLinhaClick={(id) => setIdDetalheAberto(id)}
        onToggleAtivo={tabelaAlternavel ? handleToggleAtivo : undefined}
      />
      <Paginacao paginaAtual={paginaAtual} totalPaginas={totalPaginas} parametro={parametroPagina} />

      <DetalhesModal
        titulo={titulo}
        campos={idDetalheAberto ? (detalhesPorId[idDetalheAberto] ?? []) : []}
        aberto={idDetalheAberto !== null}
        onClose={() => setIdDetalheAberto(null)}
      />
    </section>
  );
}
