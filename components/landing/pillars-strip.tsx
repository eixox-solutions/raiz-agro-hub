import { Sprout, Users, Lightbulb, TrendingUp, Handshake } from "lucide-react";

const PILARES = [
  { icon: Sprout, titulo: "Apresentação do negócio", texto: "Hub integrado de inteligência" },
  { icon: Users, titulo: "Conexão que gera valor", texto: "Combinações qualificadas" },
  { icon: Lightbulb, titulo: "Inovação que transforma", texto: "Tecnologia validada no campo" },
  { icon: TrendingUp, titulo: "Oportunidades que impulsionam", texto: "Negócios e recorrência" },
  { icon: Handshake, titulo: "Parcerias que fortalecem", texto: "Apoio institucional e Acrissul" },
];

export function PillarsStrip() {
  return (
    <section className="bg-bg-card-alt border-y border-border-light py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {PILARES.map(({ icon: Icon, titulo, texto }) => (
          <div key={titulo} className="flex items-start gap-3">
            <Icon className="text-accent shrink-0" size={28} strokeWidth={1.75} />
            <div>
              <strong className="block font-heading text-sm text-primary">{titulo}</strong>
              <span className="text-sm text-text-muted">{texto}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
