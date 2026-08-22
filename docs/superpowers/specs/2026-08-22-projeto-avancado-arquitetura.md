# Raiz Agro Hub — Arquitetura do Projeto Avançado

Status: aprovado para implementação
Data: 2026-08-22

## Contexto

O MVP de matchmaking (`docs/superpowers/specs/2026-08-22-mvp-matchmaking-design.md`)
foi implementado como demo estática: HTML/CSS/JS puro na raiz do
repositório, sem framework, sem build, dados em `localStorage` do
navegador. Isso serviu bem ao propósito original (demo para a banca do
Centelha MS 2026), mas tem uma limitação fundamental: **dados não são
compartilhados entre dispositivos**. Um produtor cadastrado no celular
dele nunca aparece para uma empresa acessando de outro aparelho — o que
inviabiliza o uso real em eventos presenciais do agronegócio, onde
múltiplas pessoas cadastram e consultam simultaneamente.

Este spec define a evolução para um **projeto de produção real**:
frontend com framework, backend com API, banco de dados compartilhado.

## Decisões já validadas com o usuário

- **Frontend**: Next.js (App Router) + React + TypeScript.
- **Backend**: dentro do próprio Next.js (Route Handlers / Server
  Actions) — sem uma API Hono separada. Um projeto só, deploy único.
- **Banco de dados**: Supabase (Postgres gerenciado, região `sa-east-1`
  — São Paulo, mais próxima do público-alvo), com Auth e Realtime
  nativos.
- **Justificativa de negócio** (já validada em conversa anterior):
  eventos presenciais do agro geram picos de acesso simultâneo pelo
  celular, muitas vezes com conectividade instável — Next.js em
  ambiente edge-ready (Vercel/Render) escala automaticamente sob
  rajada, e Supabase resolve dados compartilhados + autenticação sem
  precisar construir isso do zero.

## Fora de escopo desta fase

Realtime ao vivo (ex: notificação instantânea de match), app mobile
nativo, IA/ML real no motor de match (continua por regras, migrado do
`mvp-match.js`), networking opcional, agenda de eventos, Raiz Recomenda
— mesmos itens já adiados no spec do MVP, permanecem adiados aqui.

## Arquitetura

```
raiz-agro-hub/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                    → landing (conteúdo de index.html migrado)
│   ├── cadastro/
│   │   ├── produtor/page.tsx           → form produtor (client component)
│   │   └── empresa/page.tsx            → form empresa (client component)
│   ├── matches/
│   │   └── [tipo]/[id]/page.tsx        → resultado do ranking (server component,
│   │                                       busca dados no servidor via Supabase)
│   ├── admin/
│   │   ├── layout.tsx                  → guarda de autenticação (redireciona se não logado)
│   │   ├── login/page.tsx              → login via Supabase Auth
│   │   └── page.tsx                    → painel (contadores, tabelas, export CSV)
│   └── api/
│       └── conexoes/route.ts           → POST para registrar solicitação de conexão
│                                          (idempotente via constraint única no banco)
├── components/
│   ├── forms/                          → ProdutorForm, EmpresaForm (com máscara de telefone)
│   ├── matches/                        → MatchCard, ScoreDial
│   └── admin/                          → DataTable, CsvExportButton, StatCard
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   → cliente browser (chave publishable)
│   │   ├── server.ts                   → cliente server component (SSR)
│   │   └── middleware.ts               → refresh de sessão
│   ├── match.ts                        → mvpCalcularAderencia, rankeamentos — mesma
│   │                                       lógica de mvp-match.js, migrada para TS
│   └── constants.ts                    → MVP_CATEGORIAS, MVP_PORTES etc., migradas
│                                          de mvp-data.js
├── supabase/
│   └── migrations/                     → schema SQL versionado (ver seção abaixo)
├── middleware.ts                       → refresh de sessão Supabase em toda rota
├── next.config.ts
├── package.json
└── tsconfig.json
```

Os arquivos estáticos atuais (`index.html`, `app.js`, `styles.css`,
`mvp-*.js`, `*.html` do MVP) são a **fonte de conteúdo e lógica** a
migrar — não código morto a descartar sem olhar. Copy da landing, textos
simplificados, regras de match e schema de campos dos formulários vêm
de lá.

## Modelo de dados (Postgres / Supabase)

Schema conceitual, migrado 1:1 dos campos já usados em `mvp-data.js`:

```sql
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

create table matches (
  id uuid primary key default gen_random_uuid(),
  produtor_id uuid not null references produtores(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade,
  score int not null check (score >= 0 and score <= 100),
  status text not null default 'conexao_solicitada',
  criado_em timestamptz not null default now(),
  unique (produtor_id, empresa_id)  -- garante idempotência no próprio banco,
                                     -- não mais em código JS
);
```

`unique (produtor_id, empresa_id)` substitui a lógica de idempotência
que hoje vive em `mvpSolicitarConexao` (buscar antes de inserir) — o
endpoint da API faz `upsert` com `onConflict` nessa constraint.

### Row Level Security (RLS)

Aplicando o checklist da skill do Supabase:

- RLS **habilitado** em `produtores`, `empresas` e `matches` (schema
  `public`, exposto via Data API).
- **Cadastro (INSERT)**: aberto a `anon` — qualquer visitante pode se
  cadastrar sem login, replicando o comportamento atual do MVP (sem
  barreira de entrada para o produtor, conforme decisão de negócio já
  registrada no spec original: "estratégia é permitir que o produtor
  entre com uma barreira muito baixa").
- **Leitura pública (SELECT) dos campos usados no ranking/match**
  (categoria, UF, porte, descrição) é necessária para o cálculo de
  aderência funcionar sem exigir login do outro lado — mas **dados de
  contato direto (telefone, e-mail, responsável) não devem ser
  legíveis por `anon`**. Resolvido com uma **view pública** por tabela
  (`produtores_publico`, `empresas_publico`) expondo só os campos
  não-sensíveis, com `security_invoker = true` (conforme a skill:
  views não herdam RLS por padrão sem essa opção). A tabela base
  permanece sem SELECT para `anon`.
- **Leitura de contato completo**: só para usuários autenticados via
  Supabase Auth (papel do admin) — policy `to authenticated using
  (true)` na tabela base, já que neste estágio não há múltiplos
  administradores com escopos diferentes (revisar se isso mudar).
- **UPDATE/DELETE**: nenhuma policy de UPDATE/DELETE pública. Somente
  `service_role` (usado nas Server Actions de admin, nunca exposto ao
  browser) pode alterar/apagar registros.
- Nenhuma chave `service_role` é exposta em código client-side —
  Route Handlers/Server Actions rodam no servidor Next.js.

### Autenticação do admin

Substitui o "sem autenticação (é demo)" do MVP por Supabase Auth real
(e-mail/senha, criado manualmente para os administradores por enquanto
— sem self-signup público). `middleware.ts` protege `/admin/*`.

## Motor de match

Lógica idêntica à de `mvp-match.js` (pesos: categoria 60, região 25,
porte 15; faixas 0-40 baixa / 41-70 média / 71-100 alta), migrada para
`lib/match.ts` em TypeScript, com tipos derivados do schema Supabase
gerado (`supabase gen types typescript`). Continua sendo cálculo por
regras — nenhuma mudança de comportamento, só de linguagem/ambiente de
execução (roda no servidor via Route Handler em vez de no navegador).

## Fluxos principais

1. **Cadastro de produtor/empresa**: formulário client component com
   validação e máscara de telefone (reaproveita a lógica de
   `mvp-mask.js`), submete via Server Action que insere no Supabase e
   redireciona para `/matches/produtor/[id]` (ou `/matches/empresa/[id]`).
2. **Tela de matches**: server component busca o registro de origem +
   lista da view pública do lado oposto, calcula o ranking no servidor,
   renderiza. Botão "Falar com essa Empresa/Produtor" chama uma Server
   Action que faz `upsert` em `matches` (idempotente via constraint).
3. **Admin**: login obrigatório; contadores e tabelas via queries
   Supabase (SSR); export CSV client-side, igual ao MVP.

## Migração de conteúdo (não é reescrita de zero)

- Textos da landing (`index.html`) migram para `app/(marketing)/page.tsx`
  como JSX, preservando a linguagem simples já validada (sem jargão:
  "combina com você", não "matchmaking"/"aderência").
- Paleta de cores e tipografia (`styles.css` `:root`) migram para o
  tema do Tailwind (`tailwind.config.ts`), não para CSS solto.
- Categorias, portes, estados, atividades (constantes de `mvp-data.js`)
  migram para `lib/constants.ts`, tipadas.

## Testes

- Migrar a suíte de validação já escrita (33 assertions cobrindo
  caminho feliz + casos destrutivos: rage-click, double-submit,
  payload corrompido, XSS, scoring de borda, independência do seed)
  para testes reais com Vitest, rodando contra `lib/match.ts` e uma
  instância local do Supabase (`supabase start`).
- Playwright para o fluxo E2E completo (cadastro → matches → conexão →
  admin), incluindo dois "usuários" (browser contexts) diferentes para
  provar que os dados agora são de fato compartilhados entre eles —
  o ponto central que motiva esta migração.

## Riscos e mitigação

- **Curva de setup**: exige provisionar um projeto Supabase real
  (conta, projeto, chaves de ambiente) antes de rodar localmente —
  documentar em `README.md` os passos de `supabase init` /
  `supabase start` / variáveis de ambiente necessárias.
- **RLS mal configurada expõe dados de contato**: mitigado pelo desenho
  de views públicas + tabela base fechada, e por rodar
  `supabase db advisors` antes de qualquer deploy, conforme a skill.
- **Regressão de comportamento no motor de match**: mitigado por
  portar a suíte de testes já validada no MVP antes de considerar a
  migração completa.
