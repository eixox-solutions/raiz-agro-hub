"use client";

import { useState } from "react";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErro(null);
    const resultado = await login(formData);
    if (resultado && "error" in resultado) {
      setErro(resultado.error);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-24">
      <h1 className="font-heading text-2xl text-primary mb-6">Painel Admin</h1>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="senha" className="block font-medium mb-1">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        <button
          type="submit"
          className="w-full bg-primary text-white font-heading font-semibold py-3 rounded-full"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
