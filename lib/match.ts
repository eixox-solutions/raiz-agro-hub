// lib/match.ts
import { PORTES } from "./constants";

export type ProdutorParaMatch = {
  categoriaDesafio: string;
  uf: string;
  porte: string;
};

export type EmpresaParaMatch = {
  categoriaSolucao: string;
  regioesAtendidas: string;
  uf: string;
  porteAlvo: string;
};

export type Faixa = "baixa" | "media" | "alta";

export function calcularAderencia(
  produtor: ProdutorParaMatch,
  empresa: EmpresaParaMatch
): { score: number; faixa: Faixa } {
  let score = 0;

  if (produtor.categoriaDesafio === empresa.categoriaSolucao) {
    score += 60;
  }

  if (empresa.regioesAtendidas === "nacional") {
    score += 25;
  } else if (empresa.regioesAtendidas === "estado" && empresa.uf === produtor.uf) {
    score += 25;
  }

  const indiceProdutor = PORTES.indexOf(produtor.porte as (typeof PORTES)[number]);
  const indiceEmpresa = PORTES.indexOf(empresa.porteAlvo as (typeof PORTES)[number]);
  if (indiceProdutor !== -1 && indiceEmpresa !== -1) {
    const distancia = Math.abs(indiceProdutor - indiceEmpresa);
    if (distancia === 0) {
      score += 15;
    } else if (distancia === 1) {
      score += 8;
    }
  }

  let faixa: Faixa = "baixa";
  if (score > 70) faixa = "alta";
  else if (score > 40) faixa = "media";

  return { score, faixa };
}

export function rankearEmpresasParaProdutor<E extends EmpresaParaMatch>(
  produtor: ProdutorParaMatch,
  empresas: E[]
): Array<{ empresa: E; score: number; faixa: Faixa }> {
  return empresas
    .map((empresa) => {
      const { score, faixa } = calcularAderencia(produtor, empresa);
      return { empresa, score, faixa };
    })
    .sort((a, b) => b.score - a.score);
}

export function rankearProdutoresParaEmpresa<P extends ProdutorParaMatch>(
  empresa: EmpresaParaMatch,
  produtores: P[]
): Array<{ produtor: P; score: number; faixa: Faixa }> {
  return produtores
    .map((produtor) => {
      const { score, faixa } = calcularAderencia(produtor, empresa);
      return { produtor, score, faixa };
    })
    .sort((a, b) => b.score - a.score);
}
