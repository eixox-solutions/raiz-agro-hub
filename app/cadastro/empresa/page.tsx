import Link from "next/link";
import type { Metadata } from "next";
import { EmpresaForm } from "@/components/forms/empresa-form";

export const metadata: Metadata = {
  title: "Cadastro de Empresa e AgTech | Raiz Agro Hub",
  description:
    "Cadastre sua empresa ou AgTech e conecte-se, de graça, com produtores rurais que precisam da sua solução.",
};

export default function CadastroEmpresaPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-text-muted mb-6 inline-block">
        ← Voltar para o site
      </Link>
      <span className="inline-block text-accent font-medium mb-2">
        Sou Empresa de Tecnologia
      </span>
      <h1 className="font-heading text-3xl text-primary mb-2">
        Conte o que sua empresa resolve e a gente te conecta com quem precisa
      </h1>
      <EmpresaForm />
    </main>
  );
}
