"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarProdutor } from "@/app/cadastro/actions";
import { formatarTelefone } from "@/lib/format-phone";
import { CATEGORIAS, PORTES, ESTADOS, ATIVIDADES } from "@/lib/constants";

export function ProdutorForm() {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setErro(null);
    setEnviando(true);
    formData.set("telefone", telefone);
    const resultado = await cadastrarProdutor(formData);
    setEnviando(false);
    if ("error" in resultado) {
      setErro(resultado.error);
      return;
    }
    router.push(`/matches/produtor/${resultado.id}`);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block font-medium mb-1">
          Nome completo <span className="text-accent">*</span>
        </label>
        <input
          id="nome"
          name="nome"
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
            placeholder="seu@email.com"
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
          <label htmlFor="municipio" className="block font-medium mb-1">
            Município <span className="text-accent">*</span>
          </label>
          <input
            id="municipio"
            name="municipio"
            type="text"
            placeholder="Ex: Campo Grande"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="uf" className="block font-medium mb-1">
            Estado (UF) <span className="text-accent">*</span>
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
      </div>

      <div>
        <label htmlFor="atividade" className="block font-medium mb-1">
          Atividade principal <span className="text-accent">*</span>
        </label>
        <select
          id="atividade"
          name="atividade"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {ATIVIDADES.map((atividade) => (
            <option key={atividade} value={atividade}>
              {atividade}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="categoriaDesafio" className="block font-medium mb-1">
          Categoria do desafio <span className="text-accent">*</span>
        </label>
        <select
          id="categoriaDesafio"
          name="categoriaDesafio"
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
        <span className="text-sm text-text-light">
          Escolha o assunto que mais tem a ver com o que está te atrapalhando.
        </span>
      </div>

      <div>
        <label htmlFor="descDesafio" className="block font-medium mb-1">
          Descrição do desafio
        </label>
        <textarea
          id="descDesafio"
          name="descDesafio"
          placeholder="Conte com suas palavras o que está te atrapalhando na fazenda..."
          className="w-full rounded-md border border-border-light px-4 py-3"
        />
      </div>

      <fieldset>
        <legend className="font-medium mb-1">
          Quão urgente é isso pra você? <span className="text-accent">*</span>
        </legend>
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3">
            <input type="radio" name="urgencia" value="baixa" required />
            Pode esperar
          </label>
          <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3">
            <input type="radio" name="urgencia" value="media" required />
            Média
          </label>
          <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3">
            <input type="radio" name="urgencia" value="alta" required />
            Preciso resolver logo
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="porte" className="block font-medium mb-1">
          Porte da propriedade <span className="text-accent">*</span>
        </label>
        <select
          id="porte"
          name="porte"
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
