import { EmpresaForm } from "@/components/forms/empresa-form";

export default function CadastroEmpresaPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <a href="/" className="text-sm text-text-muted mb-6 inline-block">
        ← Voltar para o site
      </a>
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
