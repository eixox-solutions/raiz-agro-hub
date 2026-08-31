import { MapPin, Globe, BarChart3, Home, Map, Sprout, Users } from "lucide-react";

const EXPANSAO = [
  { icon: MapPin, titulo: "De MS para o Brasil", texto: "Ponto de partida no coração do Centro-Oeste" },
  { icon: Globe, titulo: "Conexão com a Rota Bioceânica", texto: "Integração estratégica com corredores de exportação" },
  { icon: BarChart3, titulo: "Crescimento e impacto real", texto: "Digitalização de ponta a ponta na cadeia produtiva" },
];

export function MercadoOportunidade() {
  return (
    <section id="mercado" className="bg-bg-card-alt py-20">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <span className="inline-block text-xs font-heading font-semibold tracking-wide text-accent-dark bg-accent-subtle px-3 py-1 rounded-full mb-3">
            DIMENSIONAMENTO
          </span>
          <h2 className="font-heading text-3xl text-primary mb-4">Mercado e oportunidade</h2>
          <p className="text-text-muted mb-8">
            Validação inicial em <strong className="text-primary">Mato Grosso do Sul</strong>, com potencial de
            expansão nacional e conexão futura com a <strong className="text-primary">Rota Bioceânica</strong>.
          </p>

          <div className="space-y-5">
            {EXPANSAO.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="flex items-start gap-3">
                <Icon className="text-accent shrink-0 mt-1" size={22} />
                <div>
                  <strong className="block font-heading text-sm text-primary">{titulo}</strong>
                  <span className="text-sm text-text-muted">{texto}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border-light rounded-lg p-5">
            <Home className="text-accent mb-2" size={22} />
            <span className="block font-heading text-2xl text-primary">70 mil</span>
            <span className="text-sm text-text-muted">estabelecimentos rurais em MS</span>
          </div>
          <div className="bg-bg-card border border-border-light rounded-lg p-5">
            <MapPin className="text-accent mb-2" size={22} />
            <span className="block font-heading text-2xl text-primary">350 mil</span>
            <span className="text-sm text-text-muted">no Centro-Oeste</span>
          </div>
          <div className="bg-bg-card border border-border-light rounded-lg p-5">
            <Map className="text-accent mb-2" size={22} />
            <span className="block font-heading text-2xl text-primary">+5 milhões</span>
            <span className="text-sm text-text-muted">de estabelecimentos no Brasil</span>
          </div>
          <div className="bg-bg-card border border-border-light rounded-lg p-5">
            <Sprout className="text-accent mb-2" size={22} />
            <span className="block font-heading text-2xl text-primary">2.075</span>
            <span className="text-sm text-text-muted">empresas de tecnologia do agro ativas no país</span>
          </div>
          <div className="col-span-2 bg-primary text-white rounded-lg p-5">
            <Users className="text-accent-light mb-2" size={22} />
            <span className="block font-heading text-2xl text-accent-light">78%</span>
            <span className="text-sm text-white/80">
              das empresas de tecnologia do agro da América Latina e Caribe estão no Brasil
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
