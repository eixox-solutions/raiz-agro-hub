"use client";

import { useState } from "react";

function escaparCampoCsv(valor: string): string {
  if (valor.includes(",") || valor.includes('"') || valor.includes("\n")) {
    return '"' + valor.replace(/"/g, '""') + '"';
  }
  return valor;
}

function gerarCsv(cabecalho: string[], linhas: string[][]): string {
  const linhasCsv = [cabecalho, ...linhas].map((linha) =>
    linha.map(escaparCampoCsv).join(",")
  );
  return linhasCsv.join("\r\n");
}

export function CsvExportButton({
  nomeArquivo,
  cabecalho,
  buscarDados,
}: {
  nomeArquivo: string;
  cabecalho: string[];
  buscarDados: () => Promise<string[][]>;
}) {
  const [carregando, setCarregando] = useState(false);

  async function handleClick() {
    setCarregando(true);
    // Busca TODOS os registros (não só os da página atual visível na
    // tabela) para que o export não fique parcial só porque a listagem
    // está paginada.
    const linhas = await buscarDados();
    setCarregando(false);

    const csv = "﻿" + gerarCsv(cabecalho, linhas);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={carregando}
      className="text-sm border border-border-light rounded-md px-4 py-2 disabled:opacity-60"
    >
      {carregando ? "Exportando..." : "Exportar CSV"}
    </button>
  );
}
