import Link from "next/link";
import type { Metadata } from "next";
import { ProdutorForm } from "@/components/forms/produtor-form";

export const metadata: Metadata = {
  title: "Cadastro de Produtor Rural | Raiz Agro Hub",
  description:
    "Conte seu problema no campo e receba, de graça, uma lista de empresas e AgTechs que já resolvem esse desafio.",
};

export default function CadastroProdutorPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-text-muted mb-6 inline-block">
        ← Voltar para o site
      </Link>
      <span className="inline-block text-accent font-medium mb-2">
        Sou Produtor Rural
      </span>
      <h1 className="font-heading text-3xl text-primary mb-2">
        Conte seu problema e a gente te ajuda a resolver
      </h1>
      <p className="text-text-muted mb-8">
        É rápido, é de graça, e você vai ser um dos primeiros a usar o Raiz.
      </p>
      <ProdutorForm />
    </main>
  );
}
