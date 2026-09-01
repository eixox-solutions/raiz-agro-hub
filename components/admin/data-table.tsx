"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export type LinhaTabela = {
  id: string;
  ativo?: boolean;
  celulas: Array<string | number>;
};

export function DataTable({
  colunas,
  linhas,
  mensagemVazia,
  onLinhaClick,
  onToggleAtivo,
}: {
  colunas: string[];
  linhas: LinhaTabela[];
  mensagemVazia: string;
  onLinhaClick?: (id: string) => void;
  onToggleAtivo?: (id: string, ativoAtual: boolean) => Promise<void>;
}) {
  const [pendente, startTransition] = useTransition();
  const router = useRouter();
  const mostraStatus = onToggleAtivo !== undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-border-light">
            {colunas.map((coluna) => (
              <th key={coluna} className="py-2 pr-4 font-medium text-text-muted">
                {coluna}
              </th>
            ))}
            {mostraStatus && (
              <th className="py-2 pr-4 font-medium text-text-muted">Status</th>
            )}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr>
              <td colSpan={colunas.length + (mostraStatus ? 1 : 0)} className="py-4 text-text-muted">
                {mensagemVazia}
              </td>
            </tr>
          ) : (
            linhas.map((linha) => (
              <tr
                key={linha.id}
                onClick={() => onLinhaClick?.(linha.id)}
                className={`border-b border-border-light ${
                  onLinhaClick ? "cursor-pointer hover:bg-bg-card-alt" : ""
                } ${linha.ativo === false ? "opacity-50" : ""}`}
              >
                {linha.celulas.map((valor, j) => (
                  <td key={j} className="py-2 pr-4">
                    {valor}
                  </td>
                ))}
                {mostraStatus && (
                  <td className="py-2 pr-4">
                    <button
                      type="button"
                      disabled={pendente}
                      onClick={(evento) => {
                        evento.stopPropagation();
                        startTransition(async () => {
                          await onToggleAtivo(linha.id, linha.ativo ?? true);
                          router.refresh();
                        });
                      }}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border disabled:opacity-50 ${
                        linha.ativo === false
                          ? "border-border-light text-text-muted"
                          : "border-accent-dark text-accent-dark bg-accent-subtle"
                      }`}
                    >
                      {linha.ativo === false ? "Inativo" : "Ativo"}
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
