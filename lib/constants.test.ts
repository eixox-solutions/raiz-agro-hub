import { describe, it, expect } from "vitest";
import { CATEGORIAS, PORTES, ESTADOS, ATIVIDADES, URGENCIAS, ESTAGIOS, REGIOES_ATENDIDAS } from "./constants";

describe("constants", () => {
  it("CATEGORIAS tem as 11 categorias na ordem original do MVP", () => {
    expect(CATEGORIAS).toEqual([
      "Gestão da Propriedade",
      "Agricultura de Precisão",
      "Pecuária de Precisão",
      "Irrigação",
      "Clima e Previsão",
      "Rastreabilidade",
      "Comercialização",
      "Crédito e Finanças",
      "Sustentabilidade",
      "Automação e Dados",
      "Logística",
    ]);
  });

  it("PORTES tem as 4 faixas na ordem exata (importa para cálculo de adjacência)", () => {
    expect(PORTES).toEqual([
      "Até 200 ha",
      "201 a 1.000 ha",
      "1.001 a 5.000 ha",
      "Acima de 5.000 ha",
    ]);
  });

  it("ESTADOS inclui OUTRO como opção final", () => {
    expect(ESTADOS).toContain("OUTRO");
    expect(ESTADOS[ESTADOS.length - 1]).toBe("OUTRO");
  });

  it("URGENCIAS tem exatamente baixa, media, alta", () => {
    expect(URGENCIAS).toEqual(["baixa", "media", "alta"]);
  });

  it("REGIOES_ATENDIDAS tem exatamente estado, nacional", () => {
    expect(REGIOES_ATENDIDAS).toEqual(["estado", "nacional"]);
  });
});
