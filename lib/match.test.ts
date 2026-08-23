// lib/match.test.ts
import { describe, it, expect } from "vitest";
import { calcularAderencia, rankearEmpresasParaProdutor, rankearProdutoresParaEmpresa } from "./match";

describe("calcularAderencia", () => {
  it("retorna 0 quando categoria, região e porte não combinam em nada", () => {
    const produtor = { categoriaDesafio: "Logística", uf: "RS", porte: "Acima de 5.000 ha" };
    const empresa = { categoriaSolucao: "Sustentabilidade", regioesAtendidas: "estado", uf: "AM", porteAlvo: "Até 200 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(0);
    expect(resultado.faixa).toBe("baixa");
  });

  it("retorna 100 quando categoria, região (nacional) e porte combinam totalmente", () => {
    const produtor = { categoriaDesafio: "Crédito e Finanças", uf: "GO", porte: "1.001 a 5.000 ha" };
    const empresa = { categoriaSolucao: "Crédito e Finanças", regioesAtendidas: "nacional", uf: "SP", porteAlvo: "1.001 a 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(100);
    expect(resultado.faixa).toBe("alta");
  });

  it("soma 25 pontos de região quando empresa atende só o estado e UF bate", () => {
    const produtor = { categoriaDesafio: "Logística", uf: "MS", porte: "Até 200 ha" };
    const empresa = { categoriaSolucao: "Outra", regioesAtendidas: "estado", uf: "MS", porteAlvo: "Acima de 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(25);
  });

  it("não soma pontos de região quando empresa atende só o estado e UF não bate", () => {
    const produtor = { categoriaDesafio: "Logística", uf: "MS", porte: "Até 200 ha" };
    const empresa = { categoriaSolucao: "Outra", regioesAtendidas: "estado", uf: "SP", porteAlvo: "Acima de 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(0);
  });

  it("soma 15 pontos de porte quando os portes são idênticos", () => {
    const produtor = { categoriaDesafio: "Outra", uf: "XX", porte: "201 a 1.000 ha" };
    const empresa = { categoriaSolucao: "Outra2", regioesAtendidas: "estado", uf: "YY", porteAlvo: "201 a 1.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(15);
  });

  it("soma 8 pontos de porte quando os portes são adjacentes (distância 1)", () => {
    const produtor = { categoriaDesafio: "Outra", uf: "XX", porte: "201 a 1.000 ha" };
    const empresa = { categoriaSolucao: "Outra2", regioesAtendidas: "estado", uf: "YY", porteAlvo: "1.001 a 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(8);
  });

  it("não soma pontos de porte quando a distância é maior que 1", () => {
    const produtor = { categoriaDesafio: "Outra", uf: "XX", porte: "Até 200 ha" };
    const empresa = { categoriaSolucao: "Outra2", regioesAtendidas: "estado", uf: "YY", porteAlvo: "Acima de 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(0);
  });

  it("calcula um score de borda combinando região (25) + porte adjacente (8) = 33, faixa baixa", () => {
    const produtor = { categoriaDesafio: "Rastreabilidade", uf: "MS", porte: "201 a 1.000 ha" };
    const empresa = { categoriaSolucao: "Logística", regioesAtendidas: "estado", uf: "MS", porteAlvo: "1.001 a 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(33);
    expect(resultado.faixa).toBe("baixa");
  });

  it("não lança erro quando o porte não está no enum conhecido, apenas não soma pontos de porte", () => {
    const produtor = { categoriaDesafio: "Irrigação", uf: "MS", porte: "PORTE_INEXISTENTE" };
    const empresa = { categoriaSolucao: "Irrigação", regioesAtendidas: "nacional", uf: "MS", porteAlvo: "Até 200 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(85); // categoria 60 + região 25
  });

  it("faixa é 'media' para score entre 41 e 70 (inclusive)", () => {
    const produtor = { categoriaDesafio: "Logística", uf: "MS", porte: "Até 200 ha" };
    const empresa = { categoriaSolucao: "Logística", regioesAtendidas: "estado", uf: "SP", porteAlvo: "201 a 1.000 ha" };
    // categoria 60 + região 0 (UF não bate) + porte 8 (adjacente) = 68
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(68);
    expect(resultado.faixa).toBe("media");
  });
});

describe("rankearEmpresasParaProdutor", () => {
  it("ordena empresas por score decrescente", () => {
    const produtor = { categoriaDesafio: "Irrigação", uf: "MS", porte: "Até 200 ha" };
    const empresas = [
      { id: "1", categoriaSolucao: "Logística", regioesAtendidas: "estado", uf: "SP", porteAlvo: "Acima de 5.000 ha" }, // score 0
      { id: "2", categoriaSolucao: "Irrigação", regioesAtendidas: "nacional", uf: "SP", porteAlvo: "Até 200 ha" }, // score 100
      { id: "3", categoriaSolucao: "Irrigação", regioesAtendidas: "estado", uf: "PR", porteAlvo: "Até 200 ha" }, // score 75 (60+0+15)
    ];
    const ranking = rankearEmpresasParaProdutor(produtor, empresas);
    expect(ranking.map((r) => r.empresa.id)).toEqual(["2", "3", "1"]);
    expect(ranking[0].score).toBe(100);
    expect(ranking[1].score).toBe(75);
    expect(ranking[2].score).toBe(0);
  });

  it("retorna lista vazia quando não há empresas", () => {
    const produtor = { categoriaDesafio: "Irrigação", uf: "MS", porte: "Até 200 ha" };
    expect(rankearEmpresasParaProdutor(produtor, [])).toEqual([]);
  });
});

describe("rankearProdutoresParaEmpresa", () => {
  it("ordena produtores por score decrescente (espelho do teste anterior)", () => {
    const empresa = { categoriaSolucao: "Irrigação", regioesAtendidas: "nacional", uf: "SP", porteAlvo: "Até 200 ha" };
    const produtores = [
      { id: "1", categoriaDesafio: "Logística", uf: "SP", porte: "Acima de 5.000 ha" }, // score 25 (só região)
      { id: "2", categoriaDesafio: "Irrigação", uf: "MS", porte: "Até 200 ha" }, // score 100
    ];
    const ranking = rankearProdutoresParaEmpresa(empresa, produtores);
    expect(ranking.map((r) => r.produtor.id)).toEqual(["2", "1"]);
  });
});
