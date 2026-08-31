import {
  Package,
  Sprout,
  Handshake,
  GraduationCap,
  Award,
  Users,
  CalendarCheck,
  PieChart,
  Landmark,
  Cpu,
  Leaf,
} from "lucide-react";

const MODELOS = [
  {
    icon: Package,
    titulo: "Assinaturas de Empresas de Tecnologia",
    texto:
      "Acesso a oportunidades qualificadas, catálogo de soluções, rodadas de conexão exclusivas, demonstrações guiadas e acompanhamento contínuo.",
  },
  {
    icon: Sprout,
    titulo: "Para o Produtor, é de Graça",
    texto:
      "Cadastrar sua propriedade e contar seu problema não custa nada. Você só paga se quiser recursos extras, como comparar soluções em mais detalhes.",
  },
  {
    icon: Handshake,
    titulo: "Participação em Negócios Gerados",
    texto:
      "Taxa de sucesso sobre vendas, contratações, projetos-piloto e serviços agrícolas originados dentro do Raiz Agro Hub.",
  },
];

const SERVICOS = [
  { icon: GraduationCap, texto: "Capacitações" },
  { icon: Award, texto: "Solução Conferida por Especialista" },
  { icon: Users, texto: "Rodadas de Conexão" },
  { icon: CalendarCheck, texto: "Eventos Setoriais" },
  { icon: PieChart, texto: "Inteligência de Dados" },
];

export function ModeloNegocio() {
  return (
    <section id="modelo" className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block text-xs font-heading font-semibold tracking-wide text-accent bg-accent-subtle px-3 py-1 rounded-full mb-3">
          MONETIZAÇÃO &amp; DIFERENCIAIS
        </span>
        <h2 className="font-heading text-3xl text-primary mb-3">Modelo de negócio sustentável</h2>
        <p className="text-text-muted">
          Um jeito de gerar valor para todo mundo que participa: produtor, empresa e o Raiz.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {MODELOS.map(({ icon: Icon, titulo, texto }) => (
          <div key={titulo} className="bg-bg-card border border-border-light rounded-lg p-6">
            <Icon className="text-accent mb-3" size={28} />
            <h3 className="font-heading text-base text-primary mb-2">{titulo}</h3>
            <p className="text-sm text-text-muted">{texto}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {SERVICOS.map(({ icon: Icon, texto }) => (
          <div
            key={texto}
            className="flex items-center gap-2 text-sm text-primary bg-accent-subtle px-4 py-2 rounded-full"
          >
            <Icon size={16} className="text-accent" />
            {texto}
          </div>
        ))}
      </div>

      <div className="bg-bg-card-alt rounded-lg p-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h3 className="font-heading text-2xl text-primary mb-2">Já conversamos com quem vive o campo</h3>
          <p className="text-text-muted">Ouvimos produtores e empresas de verdade antes de criar o Raiz.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-card rounded-lg p-5">
            <span className="block font-heading text-3xl font-bold text-accent mb-1">20</span>
            <strong className="block text-sm text-primary mb-1">produtores rurais que já conversamos</strong>
            <p className="text-sm text-text-muted">
              Produtores mostraram interesse real em receber soluções para os problemas que eles mesmos apontaram.
            </p>
          </div>
          <div className="bg-bg-card rounded-lg p-5">
            <span className="block font-heading text-3xl font-bold text-accent mb-1">11</span>
            <strong className="block text-sm text-primary mb-1">empresas de tecnologia que já conversamos</strong>
            <p className="text-sm text-text-muted">
              Empresas contaram que é muito difícil hoje chegar até o produtor certo, na hora certa.
            </p>
          </div>
          <div className="bg-bg-card rounded-lg p-5">
            <Landmark className="text-accent mb-2" size={24} />
            <strong className="block text-sm text-primary mb-1">Apoio de Quem Conhece o Agro</strong>
            <p className="text-sm text-text-muted">
              Apoio da Acrissul (Associação dos Criadores de Mato Grosso do Sul) e outras entidades do setor.
            </p>
          </div>
          <div className="bg-bg-card rounded-lg p-5">
            <Cpu className="text-accent mb-2" size={24} />
            <strong className="block text-sm text-primary mb-1">Sistema + Pessoas de Verdade</strong>
            <p className="text-sm text-text-muted">
              A gente acompanha o resultado da conexão até o final, direto no campo.
            </p>
          </div>
        </div>

        <div className="bg-primary text-white rounded-lg p-6 flex items-center gap-4 justify-center text-center">
          <Leaf className="text-accent-light shrink-0" size={28} />
          <p>
            <strong>O que o Raiz faz de diferente:</strong> em vez de você procurar sozinho entre centenas de
            empresas, a gente já te mostra{" "}
            <span className="text-accent-light font-semibold">só as que realmente resolvem seu problema</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
