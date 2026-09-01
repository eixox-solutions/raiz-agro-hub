"use client";

import { useState } from "react";
import { solicitarConexao } from "@/app/matches/actions";
import type { Faixa } from "@/lib/match";

type Props = {
  produtorId: string;
  empresaId: string;
  score: number;
  faixa: Faixa;
  nome: string;
  categoria: string;
  descricao: string | null;
  extraLabel: string;
  extraValor: string;
  botaoTexto: string;
};

function Estrelas({ faixa }: { faixa: Faixa }) {
  const qtd = faixa === "alta" ? 5 : faixa === "media" ? 3 : 1;
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < qtd ? "text-accent" : "text-border-light"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function MatchCard({
  produtorId,
  empresaId,
  score,
  faixa,
  nome,
  categoria,
  descricao,
  extraLabel,
  extraValor,
  botaoTexto,
}: Props) {
  const [solicitado, setSolicitado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleClick() {
    setErro(null);
    const resultado = await solicitarConexao(produtorId, empresaId, score);
    if ("error" in resultado) {
      setErro(resultado.error);
      return;
    }
    setSolicitado(true);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-bg-card border border-border-light rounded-lg p-6">
      <div className="flex flex-col items-center justify-center sm:w-40 shrink-0">
        <span className="text-3xl font-heading font-bold text-accent">{score}%</span>
        <span className="text-sm text-text-muted text-center">combina com você</span>
        <Estrelas faixa={faixa} />
      </div>
      <div className="flex-1">
        <h3 className="font-heading text-lg text-primary">{nome}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs bg-accent-subtle text-primary px-3 py-1 rounded-full">
            {categoria}
          </span>
          {extraValor && (
            <span className="text-xs bg-bg-card-alt text-text-muted px-3 py-1 rounded-full">
              {extraLabel}: {extraValor}
            </span>
          )}
        </div>
        {descricao && <p className="text-text-muted mt-3">{descricao}</p>}
        <button
          type="button"
          onClick={handleClick}
          disabled={solicitado}
          className="mt-4 bg-accent text-primary font-heading font-semibold px-6 py-3 rounded-full disabled:opacity-60"
        >
          {solicitado ? "✓ Conexão Solicitada" : botaoTexto}
        </button>
        {solicitado && (
          <p className="text-sm text-text-muted mt-2">
            A gente já registrou seu interesse. Em breve vocês podem se falar!
          </p>
        )}
        {erro && <p className="text-red-600 text-sm mt-2">{erro}</p>}
      </div>
    </div>
  );
}
