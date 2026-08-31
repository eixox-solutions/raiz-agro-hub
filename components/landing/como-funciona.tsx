import { UserCog, Building2, Brain, FileCheck, Handshake, Sprout, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: UserCog, titulo: "Você conta seu problema", texto: "Fala sobre sua propriedade e qual dificuldade está enfrentando no campo hoje." },
  { icon: Building2, titulo: "As empresas se cadastram", texto: "Empresas de tecnologia do agro mostram pra gente o que elas sabem resolver." },
  { icon: Brain, titulo: "O Raiz encontra a solução", texto: "Nosso sistema compara seu problema com todas as soluções e acha as melhores pra você.", destaque: true },
  { icon: FileCheck, titulo: "Uma pessoa confere tudo", texto: "Antes de te indicar algo, nossa equipe olha se a solução realmente serve pra sua fazenda." },
  { icon: Handshake, titulo: "Vocês se conectam", texto: "Você conversa direto com a empresa: pode pedir uma demonstração, testar ou já contratar." },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-bg-card-alt py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-xs font-heading font-semibold tracking-wide text-accent bg-accent-subtle px-3 py-1 rounded-full mb-3">
            É SIMPLES ASSIM
          </span>
          <h2 className="font-heading text-3xl text-primary mb-3">Como o Raiz funciona</h2>
          <p className="text-accent font-semibold">Do seu problema até a solução certa, passo a passo</p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
          {STEPS.map(({ icon: Icon, titulo, texto, destaque }, i) => (
            <div key={titulo} className="flex flex-col lg:flex-row items-center gap-6 flex-1">
              <div
                className={`flex flex-col items-center text-center gap-3 rounded-lg p-6 flex-1 ${
                  destaque
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-bg-card border border-border-light"
                }`}
              >
                <span
                  className={`font-heading text-xs font-bold px-2 py-1 rounded-full ${
                    destaque ? "bg-accent text-white" : "bg-accent-subtle text-accent"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon className={destaque ? "text-accent-light" : "text-accent"} size={32} strokeWidth={1.5} />
                <h3 className={`font-heading text-base ${destaque ? "text-white" : "text-primary"}`}>{titulo}</h3>
                <p className={`text-sm ${destaque ? "text-white/80" : "text-text-muted"}`}>{texto}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden lg:block text-border-light shrink-0" size={20} />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-12 text-center max-w-xl mx-auto">
          <Sprout className="text-accent shrink-0" size={22} />
          <p className="text-text-muted text-sm">
            O Raiz olha o seu problema e o que cada empresa oferece, e te mostra só o que realmente combina com você.
          </p>
        </div>
      </div>
    </section>
  );
}
