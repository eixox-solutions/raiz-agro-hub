"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  UserCheck,
  BadgeCheck,
  TrendingUp,
  Sliders,
  Star,
  ShieldCheck,
  Satellite,
  Layers,
  Radar,
  Droplets,
  Sprout,
  CloudRain,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

type CenarioChave = "ervas" | "adubo" | "clima";

type OutraEmpresa = {
  icon: LucideIcon;
  nome: string;
  badge: string;
  texto: string;
};

type Cenario = {
  labelBotao: string;
  produtor: {
    nome: string;
    tipo: string;
    cultura: string;
    desafio: string;
    regiao: string;
    area: string;
    tags: string[];
  };
  score: string;
  empresa: {
    nome: string;
    categoria: string;
    especialidade: string;
    solucao: string;
    tags: string[];
  };
  outrasEmpresas: OutraEmpresa[];
};

const CENARIOS: Record<CenarioChave, Cenario> = {
  ervas: {
    labelBotao: "Cana / Soja - Mato no Meio da Lavoura",
    produtor: {
      nome: "João Paulo",
      tipo: "Produtor Rural",
      cultura: "Cana-de-açúcar e Soja",
      desafio: "Mato tomando conta da lavoura",
      regiao: "Centro-Sul (Mato Grosso do Sul)",
      area: "850 ha",
      tags: ["cana-de-açúcar", "manejo", "economia", "controle"],
    },
    score: "94%",
    empresa: {
      nome: "Geo IA",
      categoria: "Empresa Já Conferida",
      especialidade: "Olha o solo e avisa onde tem problema",
      solucao: "Mostra onde está o mato na lavoura e diz o jeito certo de tirar",
      tags: ["precisão", "economia", "dados", "monitoramento"],
    },
    outrasEmpresas: [
      {
        icon: Satellite,
        nome: "AgriSmart",
        badge: "86% combina",
        texto: "Olha sua lavoura de longe e avisa onde precisa de atenção",
      },
      {
        icon: Radar,
        nome: "CropTech",
        badge: "81% combina",
        texto: "Aplica defensivo só onde precisa, direto pelo drone",
      },
      {
        icon: Sprout,
        nome: "MatoZero",
        badge: "78% combina",
        texto: "Reconhece o tipo de mato e recomenda o manejo certo",
      },
    ],
  },
  adubo: {
    labelBotao: "Milho - Gastando Muito com Adubo",
    produtor: {
      nome: "Mariana Silveira",
      tipo: "Produtora & Gestora Rural",
      cultura: "Milho Safrinha e Soja",
      desafio: "Gastando muito dinheiro com adubo",
      regiao: "Norte / Centro-Oeste (MS/MT)",
      area: "2.400 ha",
      tags: ["milho", "adubação", "economia", "menos desperdício"],
    },
    score: "96%",
    empresa: {
      nome: "AgriSmart",
      categoria: "Empresa Já Conferida",
      especialidade: "Testa a terra e diz a quantidade certa de adubo",
      solucao: "Coloca adubo só onde precisa, economizando até 22% no gasto",
      tags: ["economia 22%", "menos desperdício", "sensores no solo"],
    },
    outrasEmpresas: [
      {
        icon: Layers,
        nome: "TerraView",
        badge: "83% combina",
        texto: "Testa a terra e diz qual adubo usar, sem desperdício",
      },
      {
        icon: Droplets,
        nome: "NutriSolo",
        badge: "79% combina",
        texto: "Mede os nutrientes da terra e monta um plano de adubação",
      },
      {
        icon: Radar,
        nome: "CropTech",
        badge: "75% combina",
        texto: "Aplica adubo só onde precisa, direto pelo drone",
      },
    ],
  },
  clima: {
    labelBotao: "Pecuária / Grãos - Saber Quando Vai Chover",
    produtor: {
      nome: "Carlos Eduardo Mendes",
      tipo: "Diretor de Cooperativa",
      cultura: "Pecuária de Corte e Grãos",
      desafio: "Não sabe a hora certa de plantar ou tirar o gado do pasto",
      regiao: "Centro-Oeste (MS/GO)",
      area: "5.200 ha",
      tags: ["pecuária", "clima", "hora certa de plantar", "pastagem"],
    },
    score: "92%",
    empresa: {
      nome: "TerraView Climate",
      categoria: "Empresa Já Conferida",
      especialidade: "Avisa com antecedência sobre chuva, seca e geada",
      solucao: "Manda alerta no celular 15 dias antes de mudança forte no tempo",
      tags: ["previsão 15 dias", "alerta de geada", "direto no celular"],
    },
    outrasEmpresas: [
      {
        icon: CloudRain,
        nome: "ChuvaCerta",
        badge: "85% combina",
        texto: "Mostra a previsão da chuva específica pra sua propriedade",
      },
      {
        icon: Thermometer,
        nome: "PastoSat",
        badge: "80% combina",
        texto: "Acompanha a condição do pasto e avisa a hora de trocar o gado",
      },
      {
        icon: Satellite,
        nome: "AgriSmart",
        badge: "77% combina",
        texto: "Olha sua propriedade de longe e avisa onde precisa de atenção",
      },
    ],
  },
};

const TAGS_RECURSO = [
  { icon: Cpu, texto: "Sistema próprio do Raiz" },
  { icon: UserCheck, texto: "Uma pessoa confere tudo" },
  { icon: BadgeCheck, texto: "Solução testada" },
  { icon: TrendingUp, texto: "Chance real de negócio" },
];

export function SimuladorCombinacao() {
  const [cenarioAtivo, setCenarioAtivo] = useState<CenarioChave>("ervas");
  const dados = CENARIOS[cenarioAtivo];

  return (
    <section id="combinacao" className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-block text-xs font-heading font-semibold tracking-wide text-accent-dark bg-accent-subtle px-3 py-1 rounded-full mb-3">
          VEJA UM EXEMPLO
        </span>
        <h2 className="font-heading text-3xl text-primary mb-3">
          Veja Como a Gente Encontra a Solução Certa
        </h2>
        <p className="text-text-muted">Um exemplo real de problema do campo sendo resolvido.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {TAGS_RECURSO.map(({ icon: Icon, texto }) => (
          <div
            key={texto}
            className="flex items-center gap-2 text-xs text-text-muted bg-bg-card-alt px-3 py-1.5 rounded-full"
          >
            <Icon size={14} className="text-accent" />
            {texto}
          </div>
        ))}
      </div>

      <div className="bg-bg-card border border-border-light rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-bg-card-alt px-4 py-3 border-b border-border-light">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="ml-3 text-xs text-text-muted bg-bg-page rounded-full px-3 py-1">
            raizagrohub.com.br
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-primary">
            <Sliders size={16} className="text-accent" />
            Escolha um problema pra ver o exemplo:
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {(Object.keys(CENARIOS) as CenarioChave[]).map((chave) => (
              <button
                key={chave}
                type="button"
                onClick={() => setCenarioAtivo(chave)}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  cenarioAtivo === chave
                    ? "bg-accent text-primary border-accent"
                    : "border-border-light text-text-muted hover:border-accent"
                }`}
              >
                {CENARIOS[chave].labelBotao}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="bg-bg-card-alt rounded-lg p-5">
              <span className="text-xs font-heading font-semibold text-primary bg-accent-subtle px-2 py-1 rounded-full">
                PRODUTOR RURAL
              </span>
              <h3 className="font-heading text-lg text-primary mt-3">{dados.produtor.nome}</h3>
              <p className="text-xs text-text-muted mb-3">{dados.produtor.tipo}</p>
              <dl className="text-sm space-y-1.5 text-text-muted">
                <div>
                  <dt className="inline font-medium text-primary">Planta: </dt>
                  <dd className="inline">{dados.produtor.cultura}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-primary">Problema: </dt>
                  <dd className="inline">{dados.produtor.desafio}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-primary">Onde fica: </dt>
                  <dd className="inline">{dados.produtor.regiao}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-primary">Tamanho da terra: </dt>
                  <dd className="inline">{dados.produtor.area}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {dados.produtor.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-bg-card text-text-muted px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-28 h-28 rounded-full border-4 border-accent flex items-center justify-center">
                <span className="font-heading text-3xl font-bold text-accent">{dados.score}</span>
              </div>
              <p className="text-sm text-text-muted">essa solução combina com você</p>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-accent text-accent" />
                ))}
              </div>
              <Link
                href="/cadastro/produtor"
                className="bg-accent text-primary text-sm font-heading font-semibold px-5 py-2.5 rounded-full"
              >
                Falar com essa Empresa
              </Link>
              <p className="flex items-center gap-1.5 text-xs text-text-muted">
                <ShieldCheck size={14} className="text-accent" />
                Seus dados ficam seguros com a gente
              </p>
            </div>

            <div className="bg-bg-card-alt rounded-lg p-5">
              <span className="text-xs font-heading font-semibold text-primary bg-accent-subtle px-2 py-1 rounded-full">
                QUEM PODE TE AJUDAR
              </span>
              <h3 className="font-heading text-lg text-primary mt-3">{dados.empresa.nome}</h3>
              <p className="text-xs text-text-muted mb-3">{dados.empresa.categoria}</p>
              <dl className="text-sm space-y-1.5 text-text-muted">
                <div>
                  <dt className="inline font-medium text-primary">Faz o quê: </dt>
                  <dd className="inline">{dados.empresa.especialidade}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-primary">Como ajuda: </dt>
                  <dd className="inline">{dados.empresa.solucao}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {dados.empresa.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-bg-card text-text-muted px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-border-light">
            <p className="text-sm font-medium text-primary mb-4">
              Outras empresas que também podem te ajudar:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {dados.outrasEmpresas.map(({ icon: Icon, nome, badge, texto }) => (
                <div key={nome} className="bg-bg-card-alt rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={20} className="text-accent" />
                    <span className="text-xs bg-accent-subtle text-primary px-2 py-1 rounded-full">
                      {badge}
                    </span>
                  </div>
                  <h4 className="font-heading text-sm text-primary">{nome}</h4>
                  <p className="text-xs text-text-muted mb-1">Empresa de Tecnologia</p>
                  <p className="text-sm text-text-muted">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
