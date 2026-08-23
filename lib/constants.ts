export const CATEGORIAS = [
  "Gestão da Propriedade",
  "Agricultura de Precisão",
  "Pecuária de Precisão",
  "Irrigação",
  "Clima e Previsão",
  "Rastreabilidade",
  "Comercialização",
  "Crédito e Finanças",
  "Sustentabilidade",
  "Automação e Dados",
  "Logística",
] as const;

export const PORTES = [
  "Até 200 ha",
  "201 a 1.000 ha",
  "1.001 a 5.000 ha",
  "Acima de 5.000 ha",
] as const;

export const ESTADOS = [
  "MS",
  "MT",
  "GO",
  "PR",
  "SP",
  "MG",
  "BA",
  "RS",
  "OUTRO",
] as const;

export const ATIVIDADES = [
  "Agricultura",
  "Pecuária de Corte",
  "Pecuária de Leite",
  "Agropecuária",
  "Horticultura/Fruticultura",
  "Outra",
] as const;

export const URGENCIAS = ["baixa", "media", "alta"] as const;

export const ESTAGIOS = [
  "ideacao",
  "prototipo",
  "teste",
  "validado",
  "operacao",
] as const;

export const REGIOES_ATENDIDAS = ["estado", "nacional"] as const;

export type Categoria = (typeof CATEGORIAS)[number];
export type Porte = (typeof PORTES)[number];
export type Estado = (typeof ESTADOS)[number];
export type Atividade = (typeof ATIVIDADES)[number];
export type Urgencia = (typeof URGENCIAS)[number];
export type Estagio = (typeof ESTAGIOS)[number];
export type RegiaoAtendida = (typeof REGIOES_ATENDIDAS)[number];
