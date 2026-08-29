export function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-16 text-center">
      <h1 className="font-heading text-4xl sm:text-5xl text-primary mb-4">
        O jeito fácil de achar{" "}
        <span className="text-accent">quem resolve o seu problema</span> no
        campo
      </h1>
      <p className="text-lg text-text-muted max-w-2xl mx-auto mb-8">
        Você conta o problema da sua fazenda. A gente te mostra, de graça,
        quem já tem a solução: empresas de tecnologia do agro, prontas para
        te ajudar.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/cadastro/produtor"
          className="bg-accent text-white font-heading font-semibold px-8 py-4 rounded-full"
        >
          Sou Produtor Rural
        </a>
        <a
          href="/cadastro/empresa"
          className="border border-border-light text-primary font-heading font-semibold px-8 py-4 rounded-full"
        >
          Sou Empresa de Tecnologia
        </a>
      </div>
    </section>
  );
}
