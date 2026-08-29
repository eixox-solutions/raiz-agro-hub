import { describe, it, expect } from "vitest";
import { formatarTelefone } from "./format-phone";

describe("formatarTelefone", () => {
  it("formata progressivamente enquanto o usuário digita um celular", () => {
    expect(formatarTelefone("6")).toBe("(6");
    expect(formatarTelefone("67")).toBe("(67");
    expect(formatarTelefone("679")).toBe("(67) 9");
    expect(formatarTelefone("6799999999")).toBe("(67) 9999-9999");
    expect(formatarTelefone("67999999999")).toBe("(67) 99999-9999");
  });

  it("é idempotente: reformatar um valor já formatado não o altera", () => {
    expect(formatarTelefone("(67) 99999-9999")).toBe("(67) 99999-9999");
  });

  it("ignora dígitos além do 11º", () => {
    expect(formatarTelefone("679999999991234")).toBe("(67) 99999-9999");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(formatarTelefone("")).toBe("");
  });
});
