"use client";

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
  linhas,
}: {
  nomeArquivo: string;
  cabecalho: string[];
  linhas: string[][];
}) {
  function handleClick() {
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
      className="text-sm border border-border-light rounded-md px-4 py-2"
    >
      Exportar CSV
    </button>
  );
}
