import {
  Wheat,
  Building2,
  CircleDot,
  Clock,
  PieChart,
  ShieldCheck,
  Users,
  Target,
  FlaskConical,
  HandCoins,
  Lightbulb,
} from "lucide-react";

const ITENS_PRODUTOR = [
  { icon: CircleDot, titulo: "Muita opção espalhada", texto: "Difícil saber o que realmente funciona." },
  { icon: Clock, titulo: "Pouco tempo", texto: "O dia a dia no campo não sobra tempo pra pesquisar e comparar tecnologia." },
  { icon: PieChart, titulo: "O que importa de verdade", texto: "Gastar menos e colher mais na safra." },
  { icon: ShieldCheck, titulo: "Segurança na hora de escolher", texto: "Só decidir depois de ver que a solução realmente funciona." },
];

const ITENS_EMPRESA = [
  { icon: Users, titulo: "Dificuldade de acesso", texto: "Encontrar produtores rurais com o problema certo pra resolver." },
  { icon: Target, titulo: "Esforço comercial alto", texto: "Ciclos de vendas longos e pouco qualificados." },
  { icon: FlaskConical, titulo: "Necessidade de validação", texto: "Provar eficácia e gerar cases práticos no campo." },
  { icon: HandCoins, titulo: "Busca por novos negócios", texto: "Crescimento sustentável e recorrente." },
];

export function ProblemaOportunidade() {
  return (
    <section id="proposito" className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block text-xs font-heading font-semibold tracking-wide text-accent bg-accent-subtle px-3 py-1 rounded-full mb-3">
          DIAGNÓSTICO SETORIAL
        </span>
        <h2 className="font-heading text-3xl text-primary mb-3">O problema e a oportunidade</h2>
        <p className="text-text-muted">
          Entendemos a fundo as dores de quem produz e de quem desenvolve inovação para o campo.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-border-light rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wheat className="text-accent" size={24} />
            <h3 className="font-heading text-lg text-primary">Do lado do produtor</h3>
          </div>
          <ul className="space-y-4">
            {ITENS_PRODUTOR.map(({ icon: Icon, titulo, texto }) => (
              <li key={titulo} className="flex items-start gap-3">
                <Icon className="text-accent shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-text-muted">
                  <strong className="text-primary">{titulo}:</strong> {texto}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-bg-card border border-border-light rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="text-accent" size={24} />
            <h3 className="font-heading text-lg text-primary">Do lado das empresas de tecnologia do agro</h3>
          </div>
          <ul className="space-y-4">
            {ITENS_EMPRESA.map(({ icon: Icon, titulo, texto }) => (
              <li key={titulo} className="flex items-start gap-3">
                <Icon className="text-accent shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-text-muted">
                  <strong className="text-primary">{titulo}:</strong> {texto}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-primary text-white rounded-lg p-6 flex items-center gap-4 justify-center text-center">
        <Lightbulb className="text-accent-light shrink-0" size={28} />
        <p>
          <strong>Oportunidade:</strong> transformar demandas reais do agro em{" "}
          <span className="text-accent-light font-semibold">conexões qualificadas e negócios</span>.
        </p>
      </div>
    </section>
  );
}
