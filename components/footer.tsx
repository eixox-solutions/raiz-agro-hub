import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row justify-between gap-6 text-sm text-text-muted">
        <div>
          <p className="font-heading font-semibold text-primary">
            Raiz Agro Hub
          </p>
          <p className="mt-1">
            Conectando agronegócio, inovação e oportunidades.
          </p>
          <p className="mt-1">
            Contato:{" "}
            <a
              href="mailto:comercial@kerossolucoes.com.br"
              className="hover:text-accent"
            >
              comercial@kerossolucoes.com.br
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/politica-de-privacidade" className="hover:text-accent">
            Política de Privacidade
          </Link>
          <Link href="/termos-de-uso" className="hover:text-accent">
            Termos de Uso
          </Link>
        </div>
      </div>
      <div className="border-t border-border-light px-4 py-4 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} Raiz Agro Hub. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
