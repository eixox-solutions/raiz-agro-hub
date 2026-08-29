"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarEmpresa } from "@/app/cadastro/actions";
import { formatarTelefone } from "@/lib/format-phone";
import { CATEGORIAS, PORTES, ESTADOS, ESTAGIOS } from "@/lib/constants";

const ESTAGIO_LABELS: Record<string, string> = {
  ideacao: "Ainda é uma ideia",
  prototipo: "Já temos um protótipo",
  teste: "Em teste com produtores",
  validado: "Já validamos com produtores",
  operacao: "Já vendemos/operamos",
};

export function EmpresaForm() {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setErro(null);
    setEnviando(true);
    formData.set("telefone", telefone);
    const resultado = await cadastrarEmpresa(formData);
    setEnviando(false);
    if ("error" in resultado) {
      setErro(resultado.error);
      return;
    }
    const nomeEmpresa = formData.get("nomeEmpresa");
    const query = typeof nomeEmpresa === "string" && nomeEmpresa.trim() !== "" ? `?nome=${encodeURIComponent(nomeEmpresa.trim())}` : "";
    router.push(`/matches/empresa/${resultado.id}${query}`);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nomeEmpresa" className="block font-medium mb-1">
          Nome da empresa <span className="text-accent">*</span>
        </label>
        <input
          id="nomeEmpresa"
          name="nomeEmpresa"
          type="text"
          placeholder="Sua empresa"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        />
      </div>

      <div>
        <label htmlFor="responsavel" className="block font-medium mb-1">
          Responsável <span className="text-accent">*</span>
        </label>
        <input
          id="responsavel"
          name="responsavel"
          type="text"
          placeholder="Seu nome"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            E-mail <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="contato@suaempresa.com"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="telefone" className="block font-medium mb-1">
            Telefone / WhatsApp <span className="text-accent">*</span>
          </label>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            inputMode="tel"
            placeholder="(67) 99999-9999"
            required
            maxLength={15}
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="uf" className="block font-medium mb-1">
            Estado da sede (UF) <span className="text-accent">*</span>
          </label>
          <select
            id="uf"
            name="uf"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          >
            <option value="">Selecione</option>
            {ESTADOS.map((uf) => (
              <option key={uf} value={uf}>
                {uf === "OUTRO" ? "Outro Estado" : uf}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Onde vocês atendem? <span className="text-accent">*</span>
          </label>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3 flex-1">
              <input type="radio" name="regioesAtendidas" value="estado" required />
              Só no meu estado
            </label>
            <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3 flex-1">
              <input type="radio" name="regioesAtendidas" value="nacional" required />
              Brasil todo
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="categoriaSolucao" className="block font-medium mb-1">
          Categoria da solução <span className="text-accent">*</span>
        </label>
        <select
          id="categoriaSolucao"
          name="categoriaSolucao"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {CATEGORIAS.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="descSolucao" className="block font-medium mb-1">
          Descrição da solução
        </label>
        <textarea
          id="descSolucao"
          name="descSolucao"
          placeholder="Conte em poucas palavras o que sua empresa resolve..."
          className="w-full rounded-md border border-border-light px-4 py-3"
        />
      </div>

      <div>
        <label htmlFor="estagio" className="block font-medium mb-1">
          Estágio da empresa <span className="text-accent">*</span>
        </label>
        <select
          id="estagio"
          name="estagio"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {ESTAGIOS.map((estagio) => (
            <option key={estagio} value={estagio}>
              {ESTAGIO_LABELS[estagio]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="porteAlvo" className="block font-medium mb-1">
          Pra qual tamanho de propriedade sua solução é melhor?{" "}
          <span className="text-accent">*</span>
        </label>
        <select
          id="porteAlvo"
          name="porteAlvo"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {PORTES.map((porte) => (
            <option key={porte} value={porte}>
              {porte}
            </option>
          ))}
        </select>
      </div>

      {erro && <p className="text-red-600 text-sm">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-accent text-white font-heading font-semibold py-3 rounded-full disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar meu Cadastro"}
      </button>
    </form>
  );
}
