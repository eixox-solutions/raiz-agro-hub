# Raiz Agro Hub — Projeto Avançado (Next.js + Supabase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o MVP estático de matchmaking (HTML/CSS/JS + localStorage) para uma aplicação Next.js + Supabase real, com dados compartilhados entre dispositivos e RLS protegendo contato de produtores/empresas.

**Architecture:** Next.js 15 (App Router, TypeScript) full-stack — Server Components para leitura, Server Actions para escrita — sobre Postgres gerenciado pelo Supabase (RLS habilitada, views públicas para os campos não-sensíveis usados no ranking). Um projeto só, sem API separada.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, @supabase/ssr, @supabase/supabase-js, Vitest (testes unitários de `lib/match.ts`), Playwright (E2E multi-contexto).

**Spec:** `docs/superpowers/specs/2026-08-22-projeto-avancado-arquitetura.md`

## Global Constraints

- Motor de match: pesos fixos — categoria 60, região 25, porte 15 (soma máxima 100). Faixas: score > 70 = "alta", score > 40 = "média", caso contrário "baixa" (limites exatos herdados de `mvp-match.js`, não arredondar/alterar).
- Categorias válidas (11, ordem exata): Gestão da Propriedade, Agricultura de Precisão, Pecuária de Precisão, Irrigação, Clima e Previsão, Rastreabilidade, Comercialização, Crédito e Finanças, Sustentabilidade, Automação e Dados, Logística.
- Portes válidos (4, ordem exata — a ordem importa para o cálculo de "porte adjacente"): Até 200 ha, 201 a 1.000 ha, 1.001 a 5.000 ha, Acima de 5.000 ha.
- Estados válidos: MS, MT, GO, PR, SP, MG, BA, RS, OUTRO.
- Atividades válidas: Agricultura, Pecuária de Corte, Pecuária de Leite, Agropecuária, Horticultura/Fruticultura, Outra.
- Urgências válidas: baixa, media, alta.
- Estágios válidos: ideacao, prototipo, teste, validado, operacao.
- Regiões atendidas válidas: estado, nacional.
- Linguagem de UI: sem jargão técnico ("matchmaking", "aderência", "algoritmo", "AgTech" sozinho). Usar "combina com você", "Empresa de Tecnologia", conforme já validado na landing atual (`index.html`).
- Nenhum dado de contato (telefone, e-mail, responsável) pode ser lido por usuário anônimo — só campos usados no ranking (categoria, UF, porte, descrição) via view pública.
- Nunca usar `dangerouslySetInnerHTML` com dado de usuário — React já escapa por padrão via JSX; não introduzir exceção a isso.
- Chave `service_role` do Supabase nunca em código client-side nem em variável `NEXT_PUBLIC_*`.

---

## FASE 1 — Setup do projeto e schema do banco

### Task 1: Inicializar o projeto Next.js

**Files:**
- Create: `package.json` (substitui o atual, que é do site estático)
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `.env.local.example`
- Create: `.gitignore` (ajustar para incluir `.next/`, `node_modules/`, `.env.local`)
- Modify: `.gitignore` (mesclar com regras já existentes)

**Interfaces:**
- Produces: projeto Next.js rodável via `npm run dev` na porta 3000, com Tailwind configurado usando a paleta de cores extraída de `styles.css`.

- [ ] **Step 1: Backup dos arquivos estáticos atuais em uma pasta de referência**

O conteúdo de `index.html`, `app.js`, `styles.css` e dos arquivos `mvp-*` será consultado nas próximas tarefas para migrar copy e lógica. Não apagar nenhum arquivo estático ainda — eles continuam servindo de referência até a Fase 4 remover os antigos.

```bash
mkdir -p docs/legacy-static-reference
cp index.html app.js styles.css mvp-data.js mvp-match.js mvp-mask.js mvp-matches.js mvp-admin.js mvp.css cadastro-produtor.html cadastro-empresa.html matches.html admin.html docs/legacy-static-reference/
```

- [ ] **Step 2: Criar `package.json` do projeto Next.js**

```json
{
  "name": "raiz-agro-hub",
  "version": "2.0.0",
  "private": true,
  "description": "Raiz Agro Hub - Plataforma de matchmaking entre produtores rurais e empresas de tecnologia do agro",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "@supabase/ssr": "0.6.1",
    "@supabase/supabase-js": "2.48.0"
  },
  "devDependencies": {
    "typescript": "5.7.2",
    "@types/node": "22.10.2",
    "@types/react": "19.0.2",
    "@types/react-dom": "19.0.2",
    "tailwindcss": "3.4.17",
    "postcss": "8.4.49",
    "autoprefixer": "10.4.20",
    "vitest": "2.1.8",
    "@playwright/test": "1.49.1"
  }
}
```

- [ ] **Step 3: Instalar dependências**

```bash
npm install
```

Expected: `node_modules/` criado, `package-lock.json` gerado, sem erros.

- [ ] **Step 4: Criar `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Criar `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 6: Criar `tailwind.config.ts` com a paleta migrada de `styles.css`**

Valores de cor copiados verbatim de `docs/legacy-static-reference/styles.css` (bloco `:root`, linhas 7-36 do arquivo original).

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D3A22",
        "primary-dark": "#072213",
        accent: "#68B632",
        "accent-light": "#7FD046",
        "accent-subtle": "#EBF7E7",
        "earth-gold": "#D69E2E",
        "sky-blue": "#319795",
        "bg-page": "#F8FAF8",
        "bg-card": "#FFFFFF",
        "bg-card-alt": "#F2F7F3",
        "bg-dark-section": "#0B2B19",
        "text-main": "#14281C",
        "text-muted": "#556B5D",
        "text-light": "#879C8E",
        "border-light": "#DFEBE2",
      },
      fontFamily: {
        heading: ["var(--font-outfit)", "sans-serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 7: Criar `postcss.config.mjs`**

```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 8: Criar `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: theme(colors.bg-page);
  color: theme(colors.text-main);
}
```

- [ ] **Step 9: Criar `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Raiz Agro Hub | Conectando agronegócio, inovação e oportunidades",
  description:
    "Conte seu problema no campo e a gente te mostra, de graça, quem já tem a solução.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Criar `.env.local.example`**

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 11: Atualizar `.gitignore`**

Adicionar ao `.gitignore` existente (sem remover regras já presentes):

```
# Next.js
.next/
out/
node_modules/
.env.local
next-env.d.ts

# Testing
/test-results/
/playwright-report/
```

- [ ] **Step 12: Rodar o dev server e confirmar que sobe sem erro**

```bash
npm run dev
```

Expected: servidor sobe em `http://localhost:3000`, página inicial renderiza (mesmo que só com o `<body>` vazio do layout, já que `app/page.tsx` ainda não existe — Next.js mostra erro 404 apropriado nesse ponto, não crash). Parar o servidor após confirmar (Ctrl+C).

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs app/layout.tsx app/globals.css .env.local.example .gitignore docs/legacy-static-reference
git commit -m "feat: bootstrap Next.js 15 project with Tailwind, migrated color palette"
```

---

### Task 2: Provisionar o projeto Supabase e criar o schema

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/00000000000001_initial_schema.sql`
- Modify: `.env.local` (não versionado — instruções para o usuário preencher)

**Interfaces:**
- Produces: tabelas `produtores`, `empresas`, `matches` no Postgres local (via `supabase start`), views públicas `produtores_publico` e `empresas_publico`, RLS habilitada e testada.

- [ ] **Step 1: Inicializar o Supabase CLI no projeto**

```bash
npx supabase init
```

Expected: cria `supabase/config.toml` e `supabase/` com a estrutura padrão.

- [ ] **Step 2: Subir o Supabase local**

```bash
npx supabase start
```

Expected: containers Docker sobem (Postgres, Auth, Realtime, Studio), output mostra `API URL`, `anon key`, `service_role key` — anotar esses valores para o `.env.local` local (não commitado).

- [ ] **Step 3: Escrever o schema SQL via `execute_sql` (iterando localmente antes de gerar a migration)**

Usar o MCP Supabase (`execute_sql`) ou `npx supabase db query` para rodar o SQL abaixo contra o banco local. Não usar `apply_migration` nesta etapa (ver skill do Supabase: isso trava a possibilidade de iterar).

```sql
-- Tabela de produtores
create table produtores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefone text not null,
  municipio text not null,
  uf text not null,
  atividade text not null,
  categoria_desafio text not null,
  desc_desafio text,
  urgencia text not null check (urgencia in ('baixa', 'media', 'alta')),
  porte text not null,
  criado_em timestamptz not null default now()
);

-- Tabela de empresas
create table empresas (
  id uuid primary key default gen_random_uuid(),
  nome_empresa text not null,
  responsavel text not null,
  email text not null,
  telefone text not null,
  uf text not null,
  regioes_atendidas text not null check (regioes_atendidas in ('estado', 'nacional')),
  categoria_solucao text not null,
  desc_solucao text,
  estagio text not null,
  porte_alvo text not null,
  criado_em timestamptz not null default now()
);

-- Tabela de matches (conexões solicitadas)
create table matches (
  id uuid primary key default gen_random_uuid(),
  produtor_id uuid not null references produtores(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade,
  score int not null check (score >= 0 and score <= 100),
  status text not null default 'conexao_solicitada',
  criado_em timestamptz not null default now(),
  unique (produtor_id, empresa_id)
);

-- Habilitar RLS em todas as tabelas
alter table produtores enable row level security;
alter table empresas enable row level security;
alter table matches enable row level security;

-- INSERT público (cadastro sem login, conforme decisão de negócio: barreira baixa para o produtor)
create policy "qualquer_um_pode_cadastrar_produtor"
  on produtores for insert
  to anon, authenticated
  with check (true);

create policy "qualquer_um_pode_cadastrar_empresa"
  on empresas for insert
  to anon, authenticated
  with check (true);

-- SELECT completo (com dados de contato) só para authenticated (admin)
create policy "admin_le_produtores_completo"
  on produtores for select
  to authenticated
  using (true);

create policy "admin_le_empresas_completo"
  on empresas for select
  to authenticated
  using (true);

create policy "admin_le_matches"
  on matches for select
  to authenticated
  using (true);

-- INSERT/UPDATE de matches: público pode solicitar conexão (upsert),
-- mas precisa de SELECT para o upsert funcionar (regra da skill do Supabase:
-- UPDATE exige SELECT policy, senão retorna 0 linhas silenciosamente)
create policy "qualquer_um_pode_solicitar_conexao_insert"
  on matches for insert
  to anon, authenticated
  with check (true);

create policy "qualquer_um_pode_ler_proprio_match_recem_criado"
  on matches for select
  to anon
  using (true);

create policy "qualquer_um_pode_atualizar_match_existente"
  on matches for update
  to anon, authenticated
  using (true)
  with check (true);

-- Views públicas: só campos não-sensíveis, usados no cálculo de ranking.
-- security_invoker = true é obrigatório (Postgres 15+): sem isso a view
-- roda com privilégio do dono e ignora RLS da tabela base.
create view produtores_publico
  with (security_invoker = true) as
  select id, municipio, uf, atividade, categoria_desafio, desc_desafio,
         urgencia, porte, criado_em
  from produtores;

create view empresas_publico
  with (security_invoker = true) as
  select id, uf, regioes_atendidas, categoria_solucao, desc_solucao,
         estagio, porte_alvo, criado_em
  from empresas;

-- Views precisam de SELECT explícito para anon (RLS da tabela base
-- ainda protege as colunas de contato, já excluídas da view)
grant select on produtores_publico to anon, authenticated;
grant select on empresas_publico to anon, authenticated;
```

- [ ] **Step 4: Rodar os advisors de segurança**

```bash
npx supabase db advisors
```

Expected: nenhum erro crítico relacionado às tabelas/views criadas. Se houver aviso sobre `security_invoker` ou RLS faltando, corrigir antes de prosseguir.

- [ ] **Step 5: Verificar manualmente com queries de teste**

Via `execute_sql` ou `psql`, confirmar:

```sql
-- Como anon, SELECT direto na tabela produtores deve retornar 0 linhas (RLS bloqueando)
set role anon;
select count(*) from produtores; -- deve ser permitido rodar mas trazer 0 por falta de policy de SELECT ampla na tabela base

-- Como anon, SELECT na view pública deve funcionar e não trazer telefone/email
select * from produtores_publico limit 1;

reset role;
```

Expected: a segunda query roda sem erro de coluna inexistente (telefone/email não fazem parte da view) e a primeira não expõe dados de contato mesmo que a policy de INSERT exista.

- [ ] **Step 6: Gerar a migration a partir do estado atual do banco local**

```bash
npx supabase db pull initial_schema --local --yes
```

Expected: cria `supabase/migrations/<timestamp>_initial_schema.sql` refletindo o schema aplicado nos steps anteriores.

- [ ] **Step 7: Verificar a migration gerada**

```bash
npx supabase migration list --local
```

Expected: a migration `initial_schema` aparece na lista, aplicada.

- [ ] **Step 8: Gerar os tipos TypeScript do schema**

```bash
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

- [ ] **Step 9: Commit**

```bash
git add supabase/ lib/supabase/database.types.ts .env.local.example
git commit -m "feat: add Supabase schema (produtores, empresas, matches) with RLS and public views"
```

---

## FASE 2 — Lógica de negócio (motor de match, constantes, clientes Supabase)

### Task 3: Migrar as constantes de domínio

**Files:**
- Create: `lib/constants.ts`
- Test: `lib/constants.test.ts`

**Interfaces:**
- Produces: `CATEGORIAS: readonly string[]`, `PORTES: readonly string[]`, `ESTADOS: readonly string[]`, `ATIVIDADES: readonly string[]`, `URGENCIAS: readonly ('baixa' | 'media' | 'alta')[]`, `ESTAGIOS: readonly string[]`, `REGIOES_ATENDIDAS: readonly ('estado' | 'nacional')[]` — usados por `lib/match.ts` (Task 4) e pelos formulários (Task 6, 7).

- [ ] **Step 1: Write the failing test**

```typescript
// lib/constants.test.ts
import { describe, it, expect } from "vitest";
import { CATEGORIAS, PORTES, ESTADOS, ATIVIDADES, URGENCIAS, ESTAGIOS, REGIOES_ATENDIDAS } from "./constants";

describe("constants", () => {
  it("CATEGORIAS tem as 11 categorias na ordem original do MVP", () => {
    expect(CATEGORIAS).toEqual([
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
    ]);
  });

  it("PORTES tem as 4 faixas na ordem exata (importa para cálculo de adjacência)", () => {
    expect(PORTES).toEqual([
      "Até 200 ha",
      "201 a 1.000 ha",
      "1.001 a 5.000 ha",
      "Acima de 5.000 ha",
    ]);
  });

  it("ESTADOS inclui OUTRO como opção final", () => {
    expect(ESTADOS).toContain("OUTRO");
    expect(ESTADOS[ESTADOS.length - 1]).toBe("OUTRO");
  });

  it("URGENCIAS tem exatamente baixa, media, alta", () => {
    expect(URGENCIAS).toEqual(["baixa", "media", "alta"]);
  });

  it("REGIOES_ATENDIDAS tem exatamente estado, nacional", () => {
    expect(REGIOES_ATENDIDAS).toEqual(["estado", "nacional"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/constants.test.ts
```

Expected: FAIL com "Cannot find module './constants'" ou similar (arquivo ainda não existe).

- [ ] **Step 3: Write minimal implementation**

```typescript
// lib/constants.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/constants.test.ts
```

Expected: PASS, 5/5 testes.

- [ ] **Step 5: Commit**

```bash
git add lib/constants.ts lib/constants.test.ts
git commit -m "feat: add domain constants migrated from mvp-data.js"
```

---

### Task 4: Migrar o motor de match para TypeScript

**Files:**
- Create: `lib/match.ts`
- Test: `lib/match.test.ts`

**Interfaces:**
- Consumes: `PORTES` de `lib/constants.ts` (Task 3).
- Produces: `type ProdutorParaMatch = { categoriaDesafio: string; uf: string; porte: string }`, `type EmpresaParaMatch = { categoriaSolucao: string; regioesAtendidas: string; uf: string; porteAlvo: string }`, `calcularAderencia(produtor: ProdutorParaMatch, empresa: EmpresaParaMatch): { score: number; faixa: 'baixa' | 'media' | 'alta' }`, `rankearEmpresasParaProdutor<E extends EmpresaParaMatch>(produtor: ProdutorParaMatch, empresas: E[]): Array<{ empresa: E; score: number; faixa: string }>`, `rankearProdutoresParaEmpresa<P extends ProdutorParaMatch>(empresa: EmpresaParaMatch, produtores: P[]): Array<{ produtor: P; score: number; faixa: string }>` — usados pela Server Action de matches (Task 8) e pela página de resultado (Task 9).

- [ ] **Step 1: Write the failing test**

Esta suíte porta os 33 asserts já validados manualmente no MVP (ver `docs/superpowers/specs/2026-08-22-mvp-matchmaking-design.md`), agora como testes reais.

```typescript
// lib/match.test.ts
import { describe, it, expect } from "vitest";
import { calcularAderencia, rankearEmpresasParaProdutor, rankearProdutoresParaEmpresa } from "./match";

describe("calcularAderencia", () => {
  it("retorna 0 quando categoria, região e porte não combinam em nada", () => {
    const produtor = { categoriaDesafio: "Logística", uf: "RS", porte: "Acima de 5.000 ha" };
    const empresa = { categoriaSolucao: "Sustentabilidade", regioesAtendidas: "estado", uf: "AM", porteAlvo: "Até 200 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(0);
    expect(resultado.faixa).toBe("baixa");
  });

  it("retorna 100 quando categoria, região (nacional) e porte combinam totalmente", () => {
    const produtor = { categoriaDesafio: "Crédito e Finanças", uf: "GO", porte: "1.001 a 5.000 ha" };
    const empresa = { categoriaSolucao: "Crédito e Finanças", regioesAtendidas: "nacional", uf: "SP", porteAlvo: "1.001 a 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(100);
    expect(resultado.faixa).toBe("alta");
  });

  it("soma 25 pontos de região quando empresa atende só o estado e UF bate", () => {
    const produtor = { categoriaDesafio: "Logística", uf: "MS", porte: "Até 200 ha" };
    const empresa = { categoriaSolucao: "Outra", regioesAtendidas: "estado", uf: "MS", porteAlvo: "Acima de 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(25);
  });

  it("não soma pontos de região quando empresa atende só o estado e UF não bate", () => {
    const produtor = { categoriaDesafio: "Logística", uf: "MS", porte: "Até 200 ha" };
    const empresa = { categoriaSolucao: "Outra", regioesAtendidas: "estado", uf: "SP", porteAlvo: "Acima de 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(0);
  });

  it("soma 15 pontos de porte quando os portes são idênticos", () => {
    const produtor = { categoriaDesafio: "Outra", uf: "XX", porte: "201 a 1.000 ha" };
    const empresa = { categoriaSolucao: "Outra2", regioesAtendidas: "estado", uf: "YY", porteAlvo: "201 a 1.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(15);
  });

  it("soma 8 pontos de porte quando os portes são adjacentes (distância 1)", () => {
    const produtor = { categoriaDesafio: "Outra", uf: "XX", porte: "201 a 1.000 ha" };
    const empresa = { categoriaSolucao: "Outra2", regioesAtendidas: "estado", uf: "YY", porteAlvo: "1.001 a 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(8);
  });

  it("não soma pontos de porte quando a distância é maior que 1", () => {
    const produtor = { categoriaDesafio: "Outra", uf: "XX", porte: "Até 200 ha" };
    const empresa = { categoriaSolucao: "Outra2", regioesAtendidas: "estado", uf: "YY", porteAlvo: "Acima de 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(0);
  });

  it("calcula um score de borda combinando região (25) + porte adjacente (8) = 33, faixa baixa", () => {
    const produtor = { categoriaDesafio: "Rastreabilidade", uf: "MS", porte: "201 a 1.000 ha" };
    const empresa = { categoriaSolucao: "Logística", regioesAtendidas: "estado", uf: "MS", porteAlvo: "1.001 a 5.000 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(33);
    expect(resultado.faixa).toBe("baixa");
  });

  it("não lança erro quando o porte não está no enum conhecido, apenas não soma pontos de porte", () => {
    const produtor = { categoriaDesafio: "Irrigação", uf: "MS", porte: "PORTE_INEXISTENTE" };
    const empresa = { categoriaSolucao: "Irrigação", regioesAtendidas: "nacional", uf: "MS", porteAlvo: "Até 200 ha" };
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(85); // categoria 60 + região 25
  });

  it("faixa é 'media' para score entre 41 e 70 (inclusive)", () => {
    const produtor = { categoriaDesafio: "Logística", uf: "MS", porte: "Até 200 ha" };
    const empresa = { categoriaSolucao: "Logística", regioesAtendidas: "estado", uf: "SP", porteAlvo: "201 a 1.000 ha" };
    // categoria 60 + região 0 (UF não bate) + porte 8 (adjacente) = 68
    const resultado = calcularAderencia(produtor, empresa);
    expect(resultado.score).toBe(68);
    expect(resultado.faixa).toBe("media");
  });
});

describe("rankearEmpresasParaProdutor", () => {
  it("ordena empresas por score decrescente", () => {
    const produtor = { categoriaDesafio: "Irrigação", uf: "MS", porte: "Até 200 ha" };
    const empresas = [
      { id: "1", categoriaSolucao: "Logística", regioesAtendidas: "estado", uf: "SP", porteAlvo: "Acima de 5.000 ha" }, // score 0
      { id: "2", categoriaSolucao: "Irrigação", regioesAtendidas: "nacional", uf: "SP", porteAlvo: "Até 200 ha" }, // score 100
      { id: "3", categoriaSolucao: "Irrigação", regioesAtendidas: "estado", uf: "PR", porteAlvo: "Até 200 ha" }, // score 75 (60+0+15)
    ];
    const ranking = rankearEmpresasParaProdutor(produtor, empresas);
    expect(ranking.map((r) => r.empresa.id)).toEqual(["2", "3", "1"]);
    expect(ranking[0].score).toBe(100);
    expect(ranking[1].score).toBe(75);
    expect(ranking[2].score).toBe(0);
  });

  it("retorna lista vazia quando não há empresas", () => {
    const produtor = { categoriaDesafio: "Irrigação", uf: "MS", porte: "Até 200 ha" };
    expect(rankearEmpresasParaProdutor(produtor, [])).toEqual([]);
  });
});

describe("rankearProdutoresParaEmpresa", () => {
  it("ordena produtores por score decrescente (espelho do teste anterior)", () => {
    const empresa = { categoriaSolucao: "Irrigação", regioesAtendidas: "nacional", uf: "SP", porteAlvo: "Até 200 ha" };
    const produtores = [
      { id: "1", categoriaDesafio: "Logística", uf: "SP", porte: "Acima de 5.000 ha" }, // score 25 (só região)
      { id: "2", categoriaDesafio: "Irrigação", uf: "MS", porte: "Até 200 ha" }, // score 100
    ];
    const ranking = rankearProdutoresParaEmpresa(empresa, produtores);
    expect(ranking.map((r) => r.produtor.id)).toEqual(["2", "1"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/match.test.ts
```

Expected: FAIL com "Cannot find module './match'".

- [ ] **Step 3: Write minimal implementation**

```typescript
// lib/match.ts
import { PORTES } from "./constants";

export type ProdutorParaMatch = {
  categoriaDesafio: string;
  uf: string;
  porte: string;
};

export type EmpresaParaMatch = {
  categoriaSolucao: string;
  regioesAtendidas: string;
  uf: string;
  porteAlvo: string;
};

export type Faixa = "baixa" | "media" | "alta";

export function calcularAderencia(
  produtor: ProdutorParaMatch,
  empresa: EmpresaParaMatch
): { score: number; faixa: Faixa } {
  let score = 0;

  if (produtor.categoriaDesafio === empresa.categoriaSolucao) {
    score += 60;
  }

  if (empresa.regioesAtendidas === "nacional") {
    score += 25;
  } else if (empresa.regioesAtendidas === "estado" && empresa.uf === produtor.uf) {
    score += 25;
  }

  const indiceProdutor = PORTES.indexOf(produtor.porte as (typeof PORTES)[number]);
  const indiceEmpresa = PORTES.indexOf(empresa.porteAlvo as (typeof PORTES)[number]);
  if (indiceProdutor !== -1 && indiceEmpresa !== -1) {
    const distancia = Math.abs(indiceProdutor - indiceEmpresa);
    if (distancia === 0) {
      score += 15;
    } else if (distancia === 1) {
      score += 8;
    }
  }

  let faixa: Faixa = "baixa";
  if (score > 70) faixa = "alta";
  else if (score > 40) faixa = "media";

  return { score, faixa };
}

export function rankearEmpresasParaProdutor<E extends EmpresaParaMatch>(
  produtor: ProdutorParaMatch,
  empresas: E[]
): Array<{ empresa: E; score: number; faixa: Faixa }> {
  return empresas
    .map((empresa) => {
      const { score, faixa } = calcularAderencia(produtor, empresa);
      return { empresa, score, faixa };
    })
    .sort((a, b) => b.score - a.score);
}

export function rankearProdutoresParaEmpresa<P extends ProdutorParaMatch>(
  empresa: EmpresaParaMatch,
  produtores: P[]
): Array<{ produtor: P; score: number; faixa: Faixa }> {
  return produtores
    .map((produtor) => {
      const { score, faixa } = calcularAderencia(produtor, empresa);
      return { produtor, score, faixa };
    })
    .sort((a, b) => b.score - a.score);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/match.test.ts
```

Expected: PASS, 13/13 testes.

- [ ] **Step 5: Commit**

```bash
git add lib/match.ts lib/match.test.ts
git commit -m "feat: port match scoring engine to TypeScript with full test coverage"
```

---

### Task 5: Clientes Supabase (browser, server, middleware)

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

**Interfaces:**
- Consumes: `Database` type de `lib/supabase/database.types.ts` (Task 2).
- Produces: `createClient()` (browser, em `lib/supabase/client.ts`) e `createClient()` (server, async, em `lib/supabase/server.ts`) — usados por todos os Server Components/Actions das fases seguintes.

- [ ] **Step 1: Criar o cliente de browser**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

- [ ] **Step 2: Criar o cliente de servidor**

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado de um Server Component sem permissão de escrita;
            // middleware.ts cuida do refresh de sessão nesse caso.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Criar o middleware de refresh de sessão**

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 4: Preencher `.env.local` com as chaves do Supabase local**

Copiar `.env.local.example` para `.env.local` e preencher com os valores impressos pelo `npx supabase start` (Task 2, Step 2): `API URL` → `NEXT_PUBLIC_SUPABASE_URL`, `anon key` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`.

```bash
cp .env.local.example .env.local
# preencher manualmente com os valores do supabase start
```

- [ ] **Step 5: Verificar que o build não quebra com os novos arquivos**

```bash
npx tsc --noEmit
```

Expected: sem erros de tipo.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts middleware.ts
git commit -m "feat: add Supabase browser/server clients and session-refresh middleware"
```

---

## FASE 3 — Formulários de cadastro

### Task 6: Máscara de telefone reutilizável

**Files:**
- Create: `lib/format-phone.ts`
- Test: `lib/format-phone.test.ts`

**Interfaces:**
- Produces: `formatarTelefone(valorBruto: string): string` — usado pelos componentes de formulário (Task 7).

- [ ] **Step 1: Write the failing test**

```typescript
// lib/format-phone.test.ts
import { describe, it, expect } from "vitest";
import { formatarTelefone } from "./format-phone";

describe("formatarTelefone", () => {
  it("formata progressivamente enquanto o usuário digita um celular", () => {
    expect(formatarTelefone("6")).toBe("(6");
    expect(formatarTelefone("67")).toBe("(67");
    expect(formatarTelefone("679")).toBe("(67) 9");
    expect(formatarTelefone("6799999999")).toBe("(67) 9999-9999");
    expect(formatarTelefone("67999999999")).toBe("(67) 99999-9999");
  });

  it("é idempotente: reformatar um valor já formatado não o altera", () => {
    expect(formatarTelefone("(67) 99999-9999")).toBe("(67) 99999-9999");
  });

  it("ignora dígitos além do 11º", () => {
    expect(formatarTelefone("679999999991234")).toBe("(67) 99999-9999");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(formatarTelefone("")).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/format-phone.test.ts
```

Expected: FAIL com "Cannot find module './format-phone'".

- [ ] **Step 3: Write minimal implementation**

Lógica portada verbatim de `docs/legacy-static-reference/mvp-mask.js` (`mvpFormatarTelefone`), já validada.

```typescript
// lib/format-phone.ts
export function formatarTelefone(valorBruto: string): string {
  const digitos = valorBruto.replace(/\D/g, "").slice(0, 11);

  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return "(" + digitos;

  const ddd = digitos.slice(0, 2);
  const resto = digitos.slice(2);

  if (resto.length <= 4) {
    return "(" + ddd + ") " + resto;
  }
  if (digitos.length <= 10) {
    return "(" + ddd + ") " + resto.slice(0, 4) + "-" + resto.slice(4);
  }
  return "(" + ddd + ") " + resto.slice(0, 5) + "-" + resto.slice(5);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/format-phone.test.ts
```

Expected: PASS, 4/4 testes.

- [ ] **Step 5: Commit**

```bash
git add lib/format-phone.ts lib/format-phone.test.ts
git commit -m "feat: port phone mask formatter to TypeScript"
```

---

### Task 7: Server Actions de cadastro (produtor e empresa)

**Files:**
- Create: `app/cadastro/actions.ts`

**Interfaces:**
- Consumes: `createClient()` de `lib/supabase/server.ts` (Task 5); `CATEGORIAS`, `PORTES`, `ESTADOS`, `ATIVIDADES`, `URGENCIAS` de `lib/constants.ts` (Task 3).
- Produces: `cadastrarProdutor(formData: FormData): Promise<{ id: string } | { error: string }>`, `cadastrarEmpresa(formData: FormData): Promise<{ id: string } | { error: string }>` — usados pelos formulários client component (Task 8).

- [ ] **Step 1: Criar as Server Actions**

```typescript
// app/cadastro/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { CATEGORIAS, ESTADOS, ATIVIDADES, URGENCIAS, PORTES } from "@/lib/constants";

function campoObrigatorio(formData: FormData, campo: string): string | null {
  const valor = formData.get(campo);
  if (typeof valor !== "string" || valor.trim() === "") return null;
  return valor.trim();
}

export async function cadastrarProdutor(
  formData: FormData
): Promise<{ id: string } | { error: string }> {
  const nome = campoObrigatorio(formData, "nome");
  const email = campoObrigatorio(formData, "email");
  const telefone = campoObrigatorio(formData, "telefone");
  const municipio = campoObrigatorio(formData, "municipio");
  const uf = campoObrigatorio(formData, "uf");
  const atividade = campoObrigatorio(formData, "atividade");
  const categoriaDesafio = campoObrigatorio(formData, "categoriaDesafio");
  const urgencia = campoObrigatorio(formData, "urgencia");
  const porte = campoObrigatorio(formData, "porte");
  const descDesafio = formData.get("descDesafio");

  if (!nome || !email || !telefone || !municipio || !uf || !atividade || !categoriaDesafio || !urgencia || !porte) {
    return { error: "Preencha todos os campos obrigatórios." };
  }
  if (!ESTADOS.includes(uf as (typeof ESTADOS)[number])) {
    return { error: "Estado inválido." };
  }
  if (!ATIVIDADES.includes(atividade as (typeof ATIVIDADES)[number])) {
    return { error: "Atividade inválida." };
  }
  if (!CATEGORIAS.includes(categoriaDesafio as (typeof CATEGORIAS)[number])) {
    return { error: "Categoria de desafio inválida." };
  }
  if (!URGENCIAS.includes(urgencia as (typeof URGENCIAS)[number])) {
    return { error: "Urgência inválida." };
  }
  if (!PORTES.includes(porte as (typeof PORTES)[number])) {
    return { error: "Porte inválido." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtores")
    .insert({
      nome,
      email,
      telefone,
      municipio,
      uf,
      atividade,
      categoria_desafio: categoriaDesafio,
      desc_desafio: typeof descDesafio === "string" ? descDesafio.trim() : "",
      urgencia,
      porte,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível salvar seu cadastro. Tente novamente." };
  }

  return { id: data.id };
}

export async function cadastrarEmpresa(
  formData: FormData
): Promise<{ id: string } | { error: string }> {
  const nomeEmpresa = campoObrigatorio(formData, "nomeEmpresa");
  const responsavel = campoObrigatorio(formData, "responsavel");
  const email = campoObrigatorio(formData, "email");
  const telefone = campoObrigatorio(formData, "telefone");
  const uf = campoObrigatorio(formData, "uf");
  const regioesAtendidas = campoObrigatorio(formData, "regioesAtendidas");
  const categoriaSolucao = campoObrigatorio(formData, "categoriaSolucao");
  const estagio = campoObrigatorio(formData, "estagio");
  const porteAlvo = campoObrigatorio(formData, "porteAlvo");
  const descSolucao = formData.get("descSolucao");

  if (!nomeEmpresa || !responsavel || !email || !telefone || !uf || !regioesAtendidas || !categoriaSolucao || !estagio || !porteAlvo) {
    return { error: "Preencha todos os campos obrigatórios." };
  }
  if (!ESTADOS.includes(uf as (typeof ESTADOS)[number])) {
    return { error: "Estado inválido." };
  }
  if (regioesAtendidas !== "estado" && regioesAtendidas !== "nacional") {
    return { error: "Região atendida inválida." };
  }
  if (!CATEGORIAS.includes(categoriaSolucao as (typeof CATEGORIAS)[number])) {
    return { error: "Categoria de solução inválida." };
  }
  if (!PORTES.includes(porteAlvo as (typeof PORTES)[number])) {
    return { error: "Porte alvo inválido." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .insert({
      nome_empresa: nomeEmpresa,
      responsavel,
      email,
      telefone,
      uf,
      regioes_atendidas: regioesAtendidas,
      categoria_solucao: categoriaSolucao,
      desc_solucao: typeof descSolucao === "string" ? descSolucao.trim() : "",
      estagio,
      porte_alvo: porteAlvo,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível salvar seu cadastro. Tente novamente." };
  }

  return { id: data.id };
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Expected: sem erros (a tabela `produtores`/`empresas` já existe em `database.types.ts`, gerado na Task 2).

- [ ] **Step 3: Commit**

```bash
git add app/cadastro/actions.ts
git commit -m "feat: add cadastro Server Actions with domain validation"
```

---

### Task 8: Formulários de cadastro (produtor e empresa)

**Files:**
- Create: `components/forms/produtor-form.tsx`
- Create: `components/forms/empresa-form.tsx`
- Create: `app/cadastro/produtor/page.tsx`
- Create: `app/cadastro/empresa/page.tsx`

**Interfaces:**
- Consumes: `cadastrarProdutor`, `cadastrarEmpresa` de `app/cadastro/actions.ts` (Task 7); `formatarTelefone` de `lib/format-phone.ts` (Task 6); `CATEGORIAS`, `PORTES`, `ESTADOS`, `ATIVIDADES`, `URGENCIAS`, `ESTAGIOS`, `REGIOES_ATENDIDAS` de `lib/constants.ts` (Task 3).
- Produces: rotas `/cadastro/produtor` e `/cadastro/empresa` navegáveis, que redirecionam para `/matches/produtor/[id]` ou `/matches/empresa/[id]` após submissão bem-sucedida (rota consumida pela Task 9).

- [ ] **Step 1: Criar o componente de formulário do produtor**

Copy migrada verbatim de `docs/legacy-static-reference/cadastro-produtor.html` (labels, placeholders, texto de urgência já validados na linguagem simples do produto).

```tsx
// components/forms/produtor-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarProdutor } from "@/app/cadastro/actions";
import { formatarTelefone } from "@/lib/format-phone";
import { CATEGORIAS, PORTES, ESTADOS, ATIVIDADES } from "@/lib/constants";

export function ProdutorForm() {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setErro(null);
    setEnviando(true);
    formData.set("telefone", telefone);
    const resultado = await cadastrarProdutor(formData);
    setEnviando(false);
    if ("error" in resultado) {
      setErro(resultado.error);
      return;
    }
    router.push(`/matches/produtor/${resultado.id}`);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block font-medium mb-1">
          Nome completo <span className="text-accent">*</span>
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          placeholder="Seu nome"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            E-mail <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="telefone" className="block font-medium mb-1">
            Telefone / WhatsApp <span className="text-accent">*</span>
          </label>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            inputMode="tel"
            placeholder="(67) 99999-9999"
            required
            maxLength={15}
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="municipio" className="block font-medium mb-1">
            Município <span className="text-accent">*</span>
          </label>
          <input
            id="municipio"
            name="municipio"
            type="text"
            placeholder="Ex: Campo Grande"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="uf" className="block font-medium mb-1">
            Estado (UF) <span className="text-accent">*</span>
          </label>
          <select
            id="uf"
            name="uf"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          >
            <option value="">Selecione</option>
            {ESTADOS.map((uf) => (
              <option key={uf} value={uf}>
                {uf === "OUTRO" ? "Outro Estado" : uf}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="atividade" className="block font-medium mb-1">
          Atividade principal <span className="text-accent">*</span>
        </label>
        <select
          id="atividade"
          name="atividade"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {ATIVIDADES.map((atividade) => (
            <option key={atividade} value={atividade}>
              {atividade}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="categoriaDesafio" className="block font-medium mb-1">
          Categoria do desafio <span className="text-accent">*</span>
        </label>
        <select
          id="categoriaDesafio"
          name="categoriaDesafio"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {CATEGORIAS.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
        <span className="text-sm text-text-light">
          Escolha o assunto que mais tem a ver com o que está te atrapalhando.
        </span>
      </div>

      <div>
        <label htmlFor="descDesafio" className="block font-medium mb-1">
          Descrição do desafio
        </label>
        <textarea
          id="descDesafio"
          name="descDesafio"
          placeholder="Conte com suas palavras o que está te atrapalhando na fazenda..."
          className="w-full rounded-md border border-border-light px-4 py-3"
        />
      </div>

      <fieldset>
        <legend className="font-medium mb-1">
          Quão urgente é isso pra você? <span className="text-accent">*</span>
        </legend>
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3">
            <input type="radio" name="urgencia" value="baixa" required />
            Pode esperar
          </label>
          <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3">
            <input type="radio" name="urgencia" value="media" required />
            Média
          </label>
          <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3">
            <input type="radio" name="urgencia" value="alta" required />
            Preciso resolver logo
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="porte" className="block font-medium mb-1">
          Porte da propriedade <span className="text-accent">*</span>
        </label>
        <select
          id="porte"
          name="porte"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {PORTES.map((porte) => (
            <option key={porte} value={porte}>
              {porte}
            </option>
          ))}
        </select>
      </div>

      {erro && <p className="text-red-600 text-sm">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-accent text-white font-heading font-semibold py-3 rounded-full disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar meu Cadastro"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Criar o componente de formulário da empresa**

Estrutura análoga (campos exatos conforme `docs/legacy-static-reference/cadastro-empresa.html`), com o mapa de labels do estágio:

```tsx
// components/forms/empresa-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarEmpresa } from "@/app/cadastro/actions";
import { formatarTelefone } from "@/lib/format-phone";
import { CATEGORIAS, PORTES, ESTADOS, ESTAGIOS } from "@/lib/constants";

const ESTAGIO_LABELS: Record<string, string> = {
  ideacao: "Ainda é uma ideia",
  prototipo: "Já temos um protótipo",
  teste: "Em teste com produtores",
  validado: "Já validamos com produtores",
  operacao: "Já vendemos/operamos",
};

export function EmpresaForm() {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setErro(null);
    setEnviando(true);
    formData.set("telefone", telefone);
    const resultado = await cadastrarEmpresa(formData);
    setEnviando(false);
    if ("error" in resultado) {
      setErro(resultado.error);
      return;
    }
    router.push(`/matches/empresa/${resultado.id}`);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nomeEmpresa" className="block font-medium mb-1">
          Nome da empresa <span className="text-accent">*</span>
        </label>
        <input
          id="nomeEmpresa"
          name="nomeEmpresa"
          type="text"
          placeholder="Sua empresa"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        />
      </div>

      <div>
        <label htmlFor="responsavel" className="block font-medium mb-1">
          Responsável <span className="text-accent">*</span>
        </label>
        <input
          id="responsavel"
          name="responsavel"
          type="text"
          placeholder="Seu nome"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            E-mail <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="contato@suaempresa.com"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="telefone" className="block font-medium mb-1">
            Telefone / WhatsApp <span className="text-accent">*</span>
          </label>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            inputMode="tel"
            placeholder="(67) 99999-9999"
            required
            maxLength={15}
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="uf" className="block font-medium mb-1">
            Estado da sede (UF) <span className="text-accent">*</span>
          </label>
          <select
            id="uf"
            name="uf"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          >
            <option value="">Selecione</option>
            {ESTADOS.map((uf) => (
              <option key={uf} value={uf}>
                {uf === "OUTRO" ? "Outro Estado" : uf}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Onde vocês atendem? <span className="text-accent">*</span>
          </label>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3 flex-1">
              <input type="radio" name="regioesAtendidas" value="estado" required />
              Só no meu estado
            </label>
            <label className="flex items-center gap-2 border border-border-light rounded-md px-4 py-3 flex-1">
              <input type="radio" name="regioesAtendidas" value="nacional" required />
              Brasil todo
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="categoriaSolucao" className="block font-medium mb-1">
          Categoria da solução <span className="text-accent">*</span>
        </label>
        <select
          id="categoriaSolucao"
          name="categoriaSolucao"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {CATEGORIAS.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="descSolucao" className="block font-medium mb-1">
          Descrição da solução
        </label>
        <textarea
          id="descSolucao"
          name="descSolucao"
          placeholder="Conte em poucas palavras o que sua empresa resolve..."
          className="w-full rounded-md border border-border-light px-4 py-3"
        />
      </div>

      <div>
        <label htmlFor="estagio" className="block font-medium mb-1">
          Estágio da empresa <span className="text-accent">*</span>
        </label>
        <select
          id="estagio"
          name="estagio"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {ESTAGIOS.map((estagio) => (
            <option key={estagio} value={estagio}>
              {ESTAGIO_LABELS[estagio]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="porteAlvo" className="block font-medium mb-1">
          Pra qual tamanho de propriedade sua solução é melhor?{" "}
          <span className="text-accent">*</span>
        </label>
        <select
          id="porteAlvo"
          name="porteAlvo"
          required
          className="w-full rounded-md border border-border-light px-4 py-3"
        >
          <option value="">Selecione</option>
          {PORTES.map((porte) => (
            <option key={porte} value={porte}>
              {porte}
            </option>
          ))}
        </select>
      </div>

      {erro && <p className="text-red-600 text-sm">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-accent text-white font-heading font-semibold py-3 rounded-full disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar meu Cadastro"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Criar as páginas que renderizam os formulários**

```tsx
// app/cadastro/produtor/page.tsx
import { ProdutorForm } from "@/components/forms/produtor-form";

export default function CadastroProdutorPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <a href="/" className="text-sm text-text-muted mb-6 inline-block">
        ← Voltar para o site
      </a>
      <span className="inline-block text-accent font-medium mb-2">
        Sou Produtor Rural
      </span>
      <h1 className="font-heading text-3xl text-primary mb-2">
        Conte seu problema e a gente te ajuda a resolver
      </h1>
      <p className="text-text-muted mb-8">
        É rápido, é de graça, e você vai ser um dos primeiros a usar o Raiz.
      </p>
      <ProdutorForm />
    </main>
  );
}
```

```tsx
// app/cadastro/empresa/page.tsx
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
```

- [ ] **Step 4: Verificar tipos e lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: sem erros.

- [ ] **Step 5: Testar manualmente no dev server**

```bash
npm run dev
```

Acessar `http://localhost:3000/cadastro/produtor`, preencher o formulário, submeter. Expected: sem erro no console, redireciona para `/matches/produtor/<id>` (rota ainda não existe — 404 esperado até a Task 9; o importante aqui é confirmar que o registro foi criado). Verificar via `execute_sql`: `select * from produtores order by criado_em desc limit 1;` deve retornar o registro recém-criado.

- [ ] **Step 6: Commit**

```bash
git add components/forms/ app/cadastro/produtor/ app/cadastro/empresa/
git commit -m "feat: add produtor and empresa registration forms"
```

---

## FASE 4 — Tela de matches e admin

### Task 9: Página de resultado do ranking (matches)

**Files:**
- Create: `app/matches/actions.ts`
- Create: `components/matches/match-card.tsx`
- Create: `app/matches/[tipo]/[id]/page.tsx`

**Interfaces:**
- Consumes: `createClient()` de `lib/supabase/server.ts` (Task 5); `rankearEmpresasParaProdutor`, `rankearProdutoresParaEmpresa` de `lib/match.ts` (Task 4).
- Produces: rota `/matches/[tipo]/[id]` (tipo é `"produtor"` ou `"empresa"`) navegável a partir dos formulários de cadastro (Task 8); `solicitarConexao(produtorId: string, empresaId: string, score: number): Promise<{ ok: true } | { error: string }>` usada pelo `match-card.tsx`.

- [ ] **Step 1: Criar a Server Action de solicitar conexão**

```typescript
// app/matches/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function solicitarConexao(
  produtorId: string,
  empresaId: string,
  score: number
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("matches")
    .upsert(
      { produtor_id: produtorId, empresa_id: empresaId, score, status: "conexao_solicitada" },
      { onConflict: "produtor_id,empresa_id" }
    );

  if (error) {
    return { error: "Não foi possível registrar seu interesse. Tente novamente." };
  }

  return { ok: true };
}
```

- [ ] **Step 2: Criar o componente de card de resultado**

```tsx
// components/matches/match-card.tsx
"use client";

import { useState } from "react";
import { solicitarConexao } from "@/app/matches/actions";
import type { Faixa } from "@/lib/match";

type Props = {
  produtorId: string;
  empresaId: string;
  score: number;
  faixa: Faixa;
  nome: string;
  categoria: string;
  descricao: string | null;
  extraLabel: string;
  extraValor: string;
  botaoTexto: string;
};

function Estrelas({ faixa }: { faixa: Faixa }) {
  const qtd = faixa === "alta" ? 5 : faixa === "media" ? 3 : 1;
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < qtd ? "text-accent" : "text-border-light"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function MatchCard({
  produtorId,
  empresaId,
  score,
  faixa,
  nome,
  categoria,
  descricao,
  extraLabel,
  extraValor,
  botaoTexto,
}: Props) {
  const [solicitado, setSolicitado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleClick() {
    setErro(null);
    const resultado = await solicitarConexao(produtorId, empresaId, score);
    if ("error" in resultado) {
      setErro(resultado.error);
      return;
    }
    setSolicitado(true);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-bg-card border border-border-light rounded-lg p-6">
      <div className="flex flex-col items-center justify-center sm:w-40 shrink-0">
        <span className="text-3xl font-heading font-bold text-accent">{score}%</span>
        <span className="text-sm text-text-muted text-center">combina com você</span>
        <Estrelas faixa={faixa} />
      </div>
      <div className="flex-1">
        <h3 className="font-heading text-lg text-primary">{nome}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs bg-accent-subtle text-primary px-3 py-1 rounded-full">
            {categoria}
          </span>
          {extraValor && (
            <span className="text-xs bg-bg-card-alt text-text-muted px-3 py-1 rounded-full">
              {extraLabel}: {extraValor}
            </span>
          )}
        </div>
        {descricao && <p className="text-text-muted mt-3">{descricao}</p>}
        <button
          type="button"
          onClick={handleClick}
          disabled={solicitado}
          className="mt-4 bg-accent text-white font-heading font-semibold px-6 py-3 rounded-full disabled:opacity-60"
        >
          {solicitado ? "✓ Conexão Solicitada" : botaoTexto}
        </button>
        {solicitado && (
          <p className="text-sm text-text-muted mt-2">
            A gente já registrou seu interesse. Em breve vocês podem se falar!
          </p>
        )}
        {erro && <p className="text-red-600 text-sm mt-2">{erro}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Criar a página de resultado (server component)**

```tsx
// app/matches/[tipo]/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { rankearEmpresasParaProdutor, rankearProdutoresParaEmpresa } from "@/lib/match";
import { MatchCard } from "@/components/matches/match-card";

const MAX_RESULTADOS = 5;

type Params = { tipo: string; id: string };

export default async function MatchesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { tipo, id } = await params;

  if (tipo !== "produtor" && tipo !== "empresa") {
    return (
      <ErroCadastroNaoEncontrado
        mensagem="Não conseguimos identificar seu perfil. Faça seu cadastro para ver suas combinações."
        linkHref="/cadastro/produtor"
        linkTexto="Fazer meu cadastro"
      />
    );
  }

  const supabase = await createClient();

  if (tipo === "produtor") {
    const { data: produtor } = await supabase
      .from("produtores")
      .select("id, nome, categoria_desafio, uf, porte")
      .eq("id", id)
      .maybeSingle();

    if (!produtor) {
      return (
        <ErroCadastroNaoEncontrado
          mensagem="Não encontramos esse cadastro de produtor."
          linkHref="/cadastro/produtor"
          linkTexto="Fazer novo cadastro"
        />
      );
    }

    const { data: empresas } = await supabase
      .from("empresas_publico")
      .select("id, categoria_solucao, regioes_atendidas, uf, porte_alvo, desc_solucao, estagio");

    if (!empresas || empresas.length === 0) {
      return (
        <EstadoVazio
          mensagem="Ainda não há empresas cadastradas com soluções pra te mostrar. Assim que uma empresa se cadastrar, a gente te avisa!"
          linkHref="/cadastro/empresa"
          linkTexto="Cadastrar Empresa"
        />
      );
    }

    const ranking = rankearEmpresasParaProdutor(
      { categoriaDesafio: produtor.categoria_desafio, uf: produtor.uf, porte: produtor.porte },
      empresas.map((e) => ({
        id: e.id!,
        categoriaSolucao: e.categoria_solucao!,
        regioesAtendidas: e.regioes_atendidas!,
        uf: e.uf!,
        porteAlvo: e.porte_alvo!,
        descSolucao: e.desc_solucao,
        estagio: e.estagio!,
      }))
    ).slice(0, MAX_RESULTADOS);

    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <a href="/" className="text-sm text-text-muted mb-6 inline-block">
          ← Voltar para o site
        </a>
        <h1 className="font-heading text-3xl text-primary mb-2">
          Suas melhores opções, {produtor.nome}
        </h1>
        <p className="text-text-muted mb-8">
          Empresas que podem resolver o seu desafio, começando pelas que mais
          combinam.
        </p>
        <div className="flex flex-col gap-4">
          {ranking.map(({ empresa, score, faixa }) => (
            <MatchCard
              key={empresa.id}
              produtorId={produtor.id}
              empresaId={empresa.id}
              score={score}
              faixa={faixa}
              nome={empresa.categoriaSolucao}
              categoria={empresa.categoriaSolucao}
              descricao={empresa.descSolucao}
              extraLabel="Estágio"
              extraValor={empresa.estagio}
              botaoTexto="Falar com essa Empresa"
            />
          ))}
        </div>
      </main>
    );
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nome_empresa, categoria_solucao, uf, regioes_atendidas, porte_alvo")
    .eq("id", id)
    .maybeSingle();

  if (!empresa) {
    return (
      <ErroCadastroNaoEncontrado
        mensagem="Não encontramos esse cadastro de empresa."
        linkHref="/cadastro/empresa"
        linkTexto="Fazer novo cadastro"
      />
    );
  }

  const { data: produtores } = await supabase
    .from("produtores_publico")
    .select("id, categoria_desafio, uf, porte, desc_desafio, urgencia");

  if (!produtores || produtores.length === 0) {
    return (
      <EstadoVazio
        mensagem="Ainda não há produtores cadastrados com desafios pra te mostrar. Assim que um produtor se cadastrar, a gente te avisa!"
        linkHref="/cadastro/produtor"
        linkTexto="Cadastrar Produtor"
      />
    );
  }

  const ranking = rankearProdutoresParaEmpresa(
    {
      categoriaSolucao: empresa.categoria_solucao,
      regioesAtendidas: empresa.regioes_atendidas,
      uf: empresa.uf,
      porteAlvo: empresa.porte_alvo,
    },
    produtores.map((p) => ({
      id: p.id!,
      categoriaDesafio: p.categoria_desafio!,
      uf: p.uf!,
      porte: p.porte!,
      descDesafio: p.desc_desafio,
      urgencia: p.urgencia!,
    }))
  ).slice(0, MAX_RESULTADOS);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <a href="/" className="text-sm text-text-muted mb-6 inline-block">
        ← Voltar para o site
      </a>
      <h1 className="font-heading text-3xl text-primary mb-2">
        Produtores que combinam com sua solução
      </h1>
      <p className="text-text-muted mb-8">
        {empresa.nome_empresa}, esses são os produtores mais alinhados com o
        que você resolve.
      </p>
      <div className="flex flex-col gap-4">
        {ranking.map(({ produtor, score, faixa }) => (
          <MatchCard
            key={produtor.id}
            produtorId={produtor.id}
            empresaId={empresa.id}
            score={score}
            faixa={faixa}
            nome={produtor.categoriaDesafio}
            categoria={produtor.categoriaDesafio}
            descricao={produtor.descDesafio}
            extraLabel="Urgência"
            extraValor={produtor.urgencia}
            botaoTexto="Falar com esse Produtor"
          />
        ))}
      </div>
    </main>
  );
}

function ErroCadastroNaoEncontrado({
  mensagem,
  linkHref,
  linkTexto,
}: {
  mensagem: string;
  linkHref: string;
  linkTexto: string;
}) {
  return (
    <main className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="font-heading text-2xl text-primary mb-2">
        Não encontramos esse cadastro
      </h1>
      <p className="text-text-muted mb-6">{mensagem}</p>
      <a
        href={linkHref}
        className="inline-block bg-accent text-white font-heading font-semibold px-6 py-3 rounded-full"
      >
        {linkTexto}
      </a>
    </main>
  );
}

function EstadoVazio({
  mensagem,
  linkHref,
  linkTexto,
}: {
  mensagem: string;
  linkHref: string;
  linkTexto: string;
}) {
  return (
    <main className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="font-heading text-2xl text-primary mb-2">
        Ainda não temos combinações
      </h1>
      <p className="text-text-muted mb-6">{mensagem}</p>
      <a
        href={linkHref}
        className="inline-block bg-accent text-white font-heading font-semibold px-6 py-3 rounded-full"
      >
        {linkTexto}
      </a>
    </main>
  );
}
```

- [ ] **Step 4: Verificar tipos**

```bash
npx tsc --noEmit
```

Expected: sem erros (os tipos das colunas `_publico` batem com `database.types.ts` gerado na Task 2 — se a view retornar tipos `string | null` para colunas que a Server Action garante como não-nulas na tabela base, ajustar os campos `!` non-null assertion já usados acima, ou adicionar checagem defensiva se `tsc` reclamar).

- [ ] **Step 5: Testar manualmente o fluxo completo**

```bash
npm run dev
```

1. Acessar `/cadastro/produtor`, preencher e enviar.
2. Confirmar redirecionamento para `/matches/produtor/<id>`.
3. Se não houver empresas ainda, confirmar que aparece o estado vazio com link para `/cadastro/empresa`.
4. Cadastrar uma empresa com categoria igual à do produtor, mesma UF, mesmo porte.
5. Voltar para `/matches/produtor/<id-do-produtor>` (recarregar a página) e confirmar que a empresa aparece com score 100%.
6. Clicar em "Falar com essa Empresa" e confirmar que o botão muda para "✓ Conexão Solicitada".
7. Verificar via `execute_sql`: `select * from matches;` deve conter 1 linha com `status = 'conexao_solicitada'`.
8. Clicar de novo no botão (se ainda habilitado antes do re-render) ou recarregar e tentar de novo — confirmar via SQL que ainda há só 1 linha (idempotência garantida pela constraint `unique (produtor_id, empresa_id)`).

- [ ] **Step 6: Commit**

```bash
git add app/matches/ components/matches/
git commit -m "feat: add matches ranking page with connection request action"
```

---

### Task 10: Autenticação do admin

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/login/actions.ts`
- Create: `app/admin/layout.tsx`

**Interfaces:**
- Consumes: `createClient()` de `lib/supabase/server.ts` (Task 5).
- Produces: rota `/admin/login` funcional; `app/admin/layout.tsx` redireciona para `/admin/login` se não houver sessão — usado por todas as sub-rotas de `/admin/*` (Task 11).

- [ ] **Step 1: Criar um usuário admin no Supabase local (para testar)**

```bash
npx supabase --help
```

Confirmar o subcomando correto (varia por versão do CLI) para criar um usuário via Auth Admin API, ou usar o Supabase Studio local (URL impressa no `supabase start`, geralmente `http://127.0.0.1:54323`) → Authentication → Add User, com e-mail/senha de teste (ex: `admin@raizagrohub.com.br` / senha gerada, guardada apenas localmente).

- [ ] **Step 2: Criar a Server Action de login**

```typescript
// app/admin/login/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(
  formData: FormData
): Promise<{ error: string } | never> {
  const email = formData.get("email");
  const senha = formData.get("senha");

  if (typeof email !== "string" || typeof senha !== "string" || !email || !senha) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect("/admin");
}
```

- [ ] **Step 3: Criar a página de login**

```tsx
// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErro(null);
    const resultado = await login(formData);
    if (resultado && "error" in resultado) {
      setErro(resultado.error);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-24">
      <h1 className="font-heading text-2xl text-primary mb-6">Painel Admin</h1>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="senha" className="block font-medium mb-1">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            className="w-full rounded-md border border-border-light px-4 py-3"
          />
        </div>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        <button
          type="submit"
          className="w-full bg-primary text-white font-heading font-semibold py-3 rounded-full"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Criar o layout protegido de `/admin`**

```tsx
// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <div>{children}</div>;
}
```

Nota: `app/admin/login/page.tsx` fica fora deste layout guard porque está em `app/admin/login/`, uma rota irmã — mover `layout.tsx` para dentro de um grupo de rotas se o Next.js aplicar o layout também ao login e causar loop de redirecionamento. Verificar no Step 5 abaixo e ajustar se necessário (mover `admin/page.tsx` e as futuras sub-páginas protegidas para `app/admin/(protegido)/` com o `layout.tsx` dentro desse grupo, deixando `app/admin/login/` fora).

- [ ] **Step 5: Testar manualmente**

```bash
npm run dev
```

Acessar `http://localhost:3000/admin` sem estar logado. Expected: redireciona para `/admin/login` sem loop infinito. Se houver loop (login redirecionando para login), aplicar o ajuste de route group mencionado no Step 4 antes de prosseguir. Fazer login com o usuário criado no Step 1. Expected: redireciona para `/admin` (a página em si ainda não existe até a Task 11 — 404 esperado nesse ponto, mas sem redirecionar de volta ao login).

- [ ] **Step 6: Commit**

```bash
git add app/admin/login/ app/admin/layout.tsx
git commit -m "feat: add admin authentication (login page + protected layout)"
```

---

### Task 11: Painel admin (contadores, tabelas, export CSV)

**Files:**
- Create: `components/admin/data-table.tsx`
- Create: `components/admin/csv-export-button.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/actions.ts`

**Interfaces:**
- Consumes: `createClient()` de `lib/supabase/server.ts` (Task 5).
- Produces: rota `/admin` (protegida pelo layout da Task 10) com contadores, 3 tabelas e exportação CSV.

- [ ] **Step 1: Criar o componente de exportação CSV**

```tsx
// components/admin/csv-export-button.tsx
"use client";

function escaparCampoCsv(valor: string): string {
  if (valor.includes(",") || valor.includes('"') || valor.includes("\n")) {
    return '"' + valor.replace(/"/g, '""') + '"';
  }
  return valor;
}

function gerarCsv(cabecalho: string[], linhas: string[][]): string {
  const linhasCsv = [cabecalho, ...linhas].map((linha) =>
    linha.map(escaparCampoCsv).join(",")
  );
  return linhasCsv.join("\r\n");
}

export function CsvExportButton({
  nomeArquivo,
  cabecalho,
  linhas,
}: {
  nomeArquivo: string;
  cabecalho: string[];
  linhas: string[][];
}) {
  function handleClick() {
    const csv = "﻿" + gerarCsv(cabecalho, linhas);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm border border-border-light rounded-md px-4 py-2"
    >
      Exportar CSV
    </button>
  );
}
```

- [ ] **Step 2: Criar o componente de tabela genérico**

```tsx
// components/admin/data-table.tsx
export function DataTable({
  colunas,
  linhas,
  mensagemVazia,
}: {
  colunas: string[];
  linhas: Array<Array<string | number>>;
  mensagemVazia: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-border-light">
            {colunas.map((coluna) => (
              <th key={coluna} className="py-2 pr-4 font-medium text-text-muted">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} className="py-4 text-text-light">
                {mensagemVazia}
              </td>
            </tr>
          ) : (
            linhas.map((linha, i) => (
              <tr key={i} className="border-b border-border-light">
                {linha.map((valor, j) => (
                  <td key={j} className="py-2 pr-4">
                    {valor}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Criar a Server Action de logout**

```typescript
// app/admin/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
```

- [ ] **Step 4: Criar a página do admin (server component)**

```tsx
// app/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/admin/data-table";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { logout } from "./actions";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: produtores } = await supabase
    .from("produtores")
    .select("nome, municipio, uf, categoria_desafio, urgencia, criado_em")
    .order("criado_em", { ascending: false });

  const { data: empresas } = await supabase
    .from("empresas")
    .select("nome_empresa, uf, categoria_solucao, estagio, criado_em")
    .order("criado_em", { ascending: false });

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "score, criado_em, produtores(nome), empresas(nome_empresa)"
    )
    .eq("status", "conexao_solicitada")
    .order("criado_em", { ascending: false });

  const totalProdutores = produtores?.length ?? 0;
  const totalEmpresas = empresas?.length ?? 0;
  const totalConexoes = matches?.length ?? 0;

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR");

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-2xl text-primary">
          Raiz Agro Hub — Painel
        </h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-text-muted underline">
            Sair
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-bg-card-alt rounded-lg p-4 text-center">
          <span className="block text-3xl font-heading font-bold text-primary">
            {totalProdutores}
          </span>
          <span className="text-sm text-text-muted">Produtores cadastrados</span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 text-center">
          <span className="block text-3xl font-heading font-bold text-primary">
            {totalEmpresas}
          </span>
          <span className="text-sm text-text-muted">Empresas cadastradas</span>
        </div>
        <div className="bg-bg-card-alt rounded-lg p-4 text-center">
          <span className="block text-3xl font-heading font-bold text-primary">
            {totalConexoes}
          </span>
          <span className="text-sm text-text-muted">Conexões solicitadas</span>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-heading text-lg text-primary">Produtores</h2>
          <CsvExportButton
            nomeArquivo="produtores.csv"
            cabecalho={["Nome", "Município", "UF", "Categoria do Desafio", "Urgência", "Data"]}
            linhas={(produtores ?? []).map((p) => [
              p.nome,
              p.municipio,
              p.uf,
              p.categoria_desafio,
              p.urgencia,
              formatarData(p.criado_em),
            ])}
          />
        </div>
        <DataTable
          colunas={["Nome", "Município/UF", "Categoria do Desafio", "Urgência", "Data de Cadastro"]}
          linhas={(produtores ?? []).map((p) => [
            p.nome,
            `${p.municipio}/${p.uf}`,
            p.categoria_desafio,
            p.urgencia,
            formatarData(p.criado_em),
          ])}
          mensagemVazia="Nenhum produtor cadastrado ainda."
        />
      </section>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-heading text-lg text-primary">Empresas</h2>
          <CsvExportButton
            nomeArquivo="empresas.csv"
            cabecalho={["Nome da Empresa", "UF", "Categoria da Solução", "Estágio", "Data"]}
            linhas={(empresas ?? []).map((e) => [
              e.nome_empresa,
              e.uf,
              e.categoria_solucao,
              e.estagio,
              formatarData(e.criado_em),
            ])}
          />
        </div>
        <DataTable
          colunas={["Nome da Empresa", "UF", "Categoria da Solução", "Estágio", "Data de Cadastro"]}
          linhas={(empresas ?? []).map((e) => [
            e.nome_empresa,
            e.uf,
            e.categoria_solucao,
            e.estagio,
            formatarData(e.criado_em),
          ])}
          mensagemVazia="Nenhuma empresa cadastrada ainda."
        />
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-heading text-lg text-primary">
            Conexões Solicitadas
          </h2>
          <CsvExportButton
            nomeArquivo="conexoes.csv"
            cabecalho={["Produtor", "Empresa", "Combina", "Data"]}
            linhas={(matches ?? []).map((m) => [
              (m.produtores as unknown as { nome: string } | null)?.nome ?? "Produtor removido",
              (m.empresas as unknown as { nome_empresa: string } | null)?.nome_empresa ?? "Empresa removida",
              `${m.score}%`,
              formatarData(m.criado_em),
            ])}
          />
        </div>
        <DataTable
          colunas={["Produtor", "Empresa", "Combina", "Data"]}
          linhas={(matches ?? []).map((m) => [
            (m.produtores as unknown as { nome: string } | null)?.nome ?? "Produtor removido",
            (m.empresas as unknown as { nome_empresa: string } | null)?.nome_empresa ?? "Empresa removida",
            `${m.score}%`,
            formatarData(m.criado_em),
          ])}
          mensagemVazia="Nenhuma conexão solicitada ainda."
        />
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Verificar tipos**

```bash
npx tsc --noEmit
```

Expected: sem erros. Se o join `produtores(nome)`/`empresas(nome_empresa)` do Supabase gerar um tipo diferente do assumido (`as unknown as` acima é um workaround), ajustar conforme o tipo real gerado por `database.types.ts` — rodar `npx supabase gen types typescript --local` de novo se o schema mudou.

- [ ] **Step 6: Testar manualmente o fluxo completo de admin**

```bash
npm run dev
```

1. Logar em `/admin/login`.
2. Confirmar que os 3 contadores refletem os dados reais do banco (comparar com `select count(*) from produtores;` etc via SQL).
3. Clicar em "Exportar CSV" em cada uma das 3 tabelas, confirmar que o arquivo baixa e abre corretamente (acentuação legível — o BOM UTF-8 resolve isso).
4. Clicar em "Sair", confirmar que redireciona para `/admin/login` e que acessar `/admin` de novo pede login.

- [ ] **Step 7: Commit**

```bash
git add components/admin/ app/admin/page.tsx app/admin/actions.ts
git commit -m "feat: add admin panel with counters, tables, and CSV export"
```

---

## FASE 5 — Landing page e remoção dos arquivos estáticos

### Task 12: Migrar a landing page

**Files:**
- Create: `app/page.tsx`
- Create: `components/landing/hero.tsx`

**Interfaces:**
- Produces: rota `/` funcional, linkando para `/cadastro/produtor` e `/cadastro/empresa` (rotas já existentes desde a Task 8).

- [ ] **Step 1: Migrar o hero e os CTAs principais da landing**

Copy migrada verbatim de `docs/legacy-static-reference/index.html` (linhas do `<section class="hero-section">` e do botão de CTA de cadastro, já com a linguagem simples validada — sem jargão).

```tsx
// components/landing/hero.tsx
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
```

- [ ] **Step 2: Criar a página inicial**

```tsx
// app/page.tsx
import { Hero } from "@/components/landing/hero";

export default function HomePage() {
  return (
    <main>
      <Hero />
    </main>
  );
}
```

Nota: esta task entrega a landing mínima com o hero e os dois CTAs de cadastro — suficiente para o fluxo principal funcionar ponta a ponta. As demais seções institucionais de `docs/legacy-static-reference/index.html` (Como Funciona, Mercado, Modelo de Negócio, Validação, Equipe, Footer) ficam para uma task de continuação fora deste plano inicial, seguindo o mesmo padrão de migração de copy verbatim demonstrado aqui — não bloqueiam o funcionamento do produto.

- [ ] **Step 3: Testar manualmente**

```bash
npm run dev
```

Acessar `http://localhost:3000/`, confirmar que os dois botões levam para `/cadastro/produtor` e `/cadastro/empresa` respectivamente.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/landing/
git commit -m "feat: add landing page hero with registration CTAs"
```

---

### Task 13: Testes E2E multi-usuário (prova de que os dados são compartilhados)

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/matchmaking-flow.spec.ts`

**Interfaces:**
- Consumes: rotas `/cadastro/produtor`, `/cadastro/empresa`, `/matches/[tipo]/[id]`, `/admin` (todas as tasks anteriores).

- [ ] **Step 1: Criar a configuração do Playwright**

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- [ ] **Step 2: Write the failing test**

Este teste usa **dois `browser.newContext()` separados** — simulando dois dispositivos físicos diferentes (produtor no celular, empresa no computador) — para provar o ponto central desta migração: dados agora são compartilhados entre dispositivos, o que o MVP em `localStorage` nunca fez.

```typescript
// e2e/matchmaking-flow.spec.ts
import { test, expect, chromium } from "@playwright/test";

test("produtor cadastrado em um dispositivo aparece para empresa cadastrada em outro dispositivo", async () => {
  const browser = await chromium.launch();

  // "Dispositivo" 1: produtor
  const contextoProdutor = await browser.newContext();
  const paginaProdutor = await contextoProdutor.newPage();

  await paginaProdutor.goto("/cadastro/produtor");
  await paginaProdutor.fill("#nome", "Playwright Produtor Teste");
  await paginaProdutor.fill("#email", "playwright.produtor@teste.com");
  await paginaProdutor.fill("#telefone", "67999998888");
  await paginaProdutor.fill("#municipio", "Bonito");
  await paginaProdutor.selectOption("#uf", "MS");
  await paginaProdutor.selectOption("#atividade", "Agricultura");
  await paginaProdutor.selectOption("#categoriaDesafio", "Irrigação");
  await paginaProdutor.fill("#descDesafio", "Perdendo água na irrigação");
  await paginaProdutor.check('input[name="urgencia"][value="alta"]');
  await paginaProdutor.selectOption("#porte", "Até 200 ha");
  await paginaProdutor.click('button[type="submit"]');

  await paginaProdutor.waitForURL(/\/matches\/produtor\//);
  const urlProdutor = paginaProdutor.url();
  const idProdutor = urlProdutor.split("/").pop()!;

  await expect(
    paginaProdutor.getByText("Ainda não há empresas cadastradas")
  ).toBeVisible();

  await contextoProdutor.close();

  // "Dispositivo" 2: empresa, contexto totalmente separado (sem cookies/localStorage compartilhado)
  const contextoEmpresa = await browser.newContext();
  const paginaEmpresa = await contextoEmpresa.newPage();

  await paginaEmpresa.goto("/cadastro/empresa");
  await paginaEmpresa.fill("#nomeEmpresa", "Playwright Irrigação Ltda");
  await paginaEmpresa.fill("#responsavel", "Responsável Teste");
  await paginaEmpresa.fill("#email", "playwright.empresa@teste.com");
  await paginaEmpresa.fill("#telefone", "67988887777");
  await paginaEmpresa.selectOption("#uf", "MS");
  await paginaEmpresa.check('input[name="regioesAtendidas"][value="nacional"]');
  await paginaEmpresa.selectOption("#categoriaSolucao", "Irrigação");
  await paginaEmpresa.fill("#descSolucao", "Sensores de irrigação inteligente");
  await paginaEmpresa.selectOption("#estagio", "validado");
  await paginaEmpresa.selectOption("#porteAlvo", "Até 200 ha");
  await paginaEmpresa.click('button[type="submit"]');

  await paginaEmpresa.waitForURL(/\/matches\/empresa\//);

  // A prova central: a empresa (dispositivo 2) enxerga o produtor
  // cadastrado no dispositivo 1, sem nunca terem compartilhado
  // localStorage/cookies.
  await expect(
    paginaEmpresa.getByText("Produtores que combinam com sua solução")
  ).toBeVisible();
  await expect(paginaEmpresa.getByText("100%")).toBeVisible();

  await contextoEmpresa.close();

  // "Dispositivo" 1 de novo, contexto NOVO (não reaproveita o de antes),
  // confirma que agora vê a empresa que acabou de se cadastrar
  const contextoProdutorDeNovo = await browser.newContext();
  const paginaProdutorDeNovo = await contextoProdutorDeNovo.newPage();
  await paginaProdutorDeNovo.goto(`/matches/produtor/${idProdutor}`);

  await expect(paginaProdutorDeNovo.getByText("100%")).toBeVisible();
  await paginaProdutorDeNovo
    .getByRole("button", { name: "Falar com essa Empresa" })
    .click();
  await expect(paginaProdutorDeNovo.getByText("✓ Conexão Solicitada")).toBeVisible();

  await contextoProdutorDeNovo.close();
  await browser.close();
});
```

- [ ] **Step 3: Run test to verify it fails (banco vazio ou app não rodando)**

```bash
npx playwright install chromium
npx playwright test
```

Expected: se o Supabase local (`npx supabase start`) e o dev server (`npm run dev`) não estiverem rodando, o teste falha na navegação ou no preenchimento de campos. Subir ambos antes de rodar de novo.

- [ ] **Step 4: Rodar com o ambiente de pé e confirmar que passa**

```bash
npx supabase start   # se ainda não estiver rodando
npx playwright test
```

Expected: PASS. Este teste é a validação final de que o objetivo desta migração — dados compartilhados entre dispositivos — foi atingido de fato, não apenas presumido.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e/
git commit -m "test: add E2E test proving cross-device data sharing via Supabase"
```

---

### Task 14: Remover os arquivos estáticos do MVP

**Files:**
- Delete: `index.html`, `app.js`, `styles.css`, `mvp-data.js`, `mvp-match.js`, `mvp-mask.js`, `mvp-matches.js`, `mvp-admin.js`, `mvp.css`, `cadastro-produtor.html`, `cadastro-empresa.html`, `matches.html`, `admin.html`
- Modify: `README.md` (atualizar instruções de setup para o projeto Next.js)

**Interfaces:**
- Nenhuma (task de limpeza; depende de todas as tasks anteriores estarem completas e verificadas).

- [ ] **Step 1: Confirmar que toda a funcionalidade do MVP estático tem equivalente funcionando no Next.js**

Checklist manual (marcar cada item após confirmar via teste manual ou o Playwright da Task 13):
- [ ] Cadastro de produtor → `/cadastro/produtor` (Task 8)
- [ ] Cadastro de empresa → `/cadastro/empresa` (Task 8)
- [ ] Ranking de matches → `/matches/[tipo]/[id]` (Task 9)
- [ ] Solicitar conexão (idempotente) → Server Action em `app/matches/actions.ts` (Task 9)
- [ ] Painel admin com login → `/admin` (Task 10, 11)
- [ ] Export CSV → `components/admin/csv-export-button.tsx` (Task 11)
- [ ] Landing com CTAs → `/` (Task 12)

- [ ] **Step 2: Remover os arquivos estáticos**

```bash
git rm index.html app.js styles.css mvp-data.js mvp-match.js mvp-mask.js mvp-matches.js mvp-admin.js mvp.css cadastro-produtor.html cadastro-empresa.html matches.html admin.html
```

Nota: a cópia de referência em `docs/legacy-static-reference/` (criada na Task 1, Step 1) permanece no repositório como histórico de migração — não remover essa pasta.

- [ ] **Step 3: Atualizar o `README.md`**

Substituir as instruções de "abrir index.html" / `npm run serve` (Python http.server) pelas instruções reais do projeto Next.js:

```markdown
## Rodando localmente

1. Instale as dependências: `npm install`
2. Suba o Supabase local: `npx supabase start`
3. Copie `.env.local.example` para `.env.local` e preencha com as chaves impressas pelo comando acima
4. Rode o servidor de desenvolvimento: `npm run dev`
5. Acesse `http://localhost:3000`

## Testes

- Testes unitários: `npm test`
- Testes E2E (requer app + Supabase local rodando): `npm run test:e2e`
```

(Preservar as demais seções do `README.md` atual que não descrevem o setup de execução — título do projeto, descrição, licença, etc. — ajustando apenas a seção de instruções de execução.)

- [ ] **Step 4: Rodar o dev server uma última vez para confirmar que nada quebrou**

```bash
npm run dev
```

Acessar `/`, `/cadastro/produtor`, `/cadastro/empresa`, `/admin/login`. Expected: todas as rotas carregam sem erro 404 nem erro de módulo faltando (confirma que nenhum arquivo estático removido ainda era referenciado pelo projeto Next.js).

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "chore: remove legacy static MVP files, update README for Next.js setup"
```

---

## Phase X: Verificação final

- [ ] **Rodar toda a suíte de testes unitários**

```bash
npm test
```

Expected: PASS — 4 (constants) + 13 (match) + 4 (format-phone) = 21 testes, 0 falhas.

- [ ] **Rodar o teste E2E**

```bash
npx supabase start
npm run dev &
npx playwright test
```

Expected: PASS.

- [ ] **Rodar o build de produção**

```bash
npm run build
```

Expected: build completa sem erros de tipo nem de lint bloqueante.

- [ ] **Rodar os advisors de segurança do Supabase mais uma vez, contra o schema final**

```bash
npx supabase db advisors
```

Expected: nenhum problema crítico não resolvido.

- [ ] **Checklist de conformidade com o spec** (`docs/superpowers/specs/2026-08-22-projeto-avancado-arquitetura.md`)

- [ ] Next.js App Router + TypeScript + Tailwind — confirmado (Task 1)
- [ ] Backend dentro do próprio Next.js, sem Hono separado — confirmado (Server Actions em todas as tasks de escrita)
- [ ] Supabase Postgres com RLS — confirmado (Task 2)
- [ ] Views públicas não expõem contato — confirmado (Task 2, Step 5)
- [ ] Admin com autenticação real — confirmado (Task 10)
- [ ] Motor de match com mesmos pesos/faixas do MVP — confirmado (Task 4, testes)
- [ ] Dados compartilhados entre dispositivos — confirmado (Task 13, teste E2E multi-contexto)
- [ ] Linguagem sem jargão preservada — confirmado (copy migrada verbatim nas Tasks 8, 9, 12)

- [ ] **Commit final marcando a fase completa**

```bash
git add -A
git commit -m "docs: mark advanced project migration complete" --allow-empty
```
