# Raiz Agro Hub — MVP de Matchmaking (Produtor × Empresa/AgTech)

Status: aprovado para implementação
Data: 2026-08-22

## Contexto

A landing page (`index.html`) já foi reescrita para refletir o pitch deck do
Raiz Agro Hub: uma plataforma de matchmaking que conecta desafios de
produtores rurais a soluções de empresas/AgTechs, usando curadoria e um
motor de recomendação. A landing inclui um simulador visual de matchmaking
com três cenários fixos (ilustrativo, sem dados reais) e um formulário de
lead único que hoje não persiste nada nem calcula match de verdade.

Este spec cobre a construção do **MVP funcional**: cadastro real de
produtores e de empresas, e um motor de match por regras que cruza os dois
lados e produz um ranking de aderência, replicando em pequena escala a
lógica descrita no documento de escopo da plataforma (`Raiz_Agro_Hub_
Escopo_Plataforma_com_Networking.pdf`).

## Fora de escopo (adiado para próximas iterações)

Networking opcional, agenda de eventos/cursos, Raiz Recomenda (benefícios/
cupons), login de administrador com autenticação, pilotos assistidos,
planos de assinatura, IA/machine learning real, backend com banco de dados
persistente, notificações por e-mail/WhatsApp.

## Decisões de escopo já validadas com o usuário

- **Sem backend**: MVP roda 100% no navegador, dados salvos em
  `localStorage`. É uma demo para apresentação/banca (Centelha MS 2026),
  não uma captação de produção com dados compartilhados entre usuários.
- **Núcleo do match apenas**: cadastro de produtor, cadastro de empresa,
  motor de match, tela de resultado, painel admin simples. Sem vitrine
  tecnológica pública nem os demais módulos do documento de escopo.
- **Match por regras simples por categoria**: peso maior para categoria do
  desafio == categoria da solução, peso médio para região/UF, peso menor
  para porte de propriedade compatível.
- **Formulários enxutos**: ~8-10 campos por perfil, focados no que
  alimenta o match — não os ~20+ campos dos questionários oficiais completos.
- **Páginas MVP separadas** da landing, isoladas em arquivos próprios,
  sem alterar a estrutura de `index.html` além do destino de um link.
- **CTA da landing aponta para as páginas reais**: o toggle "Sou Produtor
  Rural" / "Sou AgTech / Empresa" na seção `#cadastro` do `index.html`
  passa a levar para `cadastro-produtor.html` / `cadastro-empresa.html`
  em vez do formulário de lead fictício atual.

## Arquitetura

Mini-app estático de 4 páginas HTML, comunicando exclusivamente via
`localStorage` (chave única `raizAgroHub_mvp`), sem build step, consistente
com o resto do repositório (HTML/CSS/JS puro).

```
cadastro-produtor.html   cadastro-empresa.html
        \                       /
         \                     /
          v                   v
         mvp-data.js (localStorage CRUD)
                    |
                    v
            mvp-match.js (scoring 0-100)
                    |
                    v
         matches.html  <-- também linkado do admin
                    |
                    v
            admin.html (contadores, listas, CSV, seed)
```

Arquivos novos:
- `mvp.css` — estilos do mini-app, reaproveitando variáveis de cor/tipografia
  já definidas em `styles.css` (paleta, fontes) via `<link>` adicional a
  `styles.css` + `mvp.css` por cima.
- `mvp-data.js` — schema, leitura/escrita em `localStorage`, seed de exemplo.
- `mvp-match.js` — função pura de cálculo de aderência (sem dependência de DOM,
  testável isoladamente).
- `mvp-ui.js` — bind de formulários e renderização de listas/cards nas 4 páginas
  (um único arquivo, com funções específicas por página, carregado em todas).

Nenhum arquivo da landing (`index.html`, `app.js`, `styles.css`) é reescrito;
apenas os `href` do toggle Produtor/AgTech na seção `#cadastro` mudam para
apontar às novas páginas.

## Modelo de dados

`localStorage['raizAgroHub_mvp']`:

```js
{
  produtores: [
    {
      id: "prod_<timestamp>_<rand>",
      nome, email, telefone,
      municipio, uf,
      atividade,           // ex: "Agricultura", "Pecuária de corte", etc.
      categoriaDesafio,     // enum fixo (ver categorias abaixo)
      descDesafio,          // texto livre curto
      urgencia,             // "baixa" | "media" | "alta"
      porte,                // enum de faixa de hectares
      criadoEm              // ISO string
    }
  ],
  empresas: [
    {
      id: "emp_<timestamp>_<rand>",
      nomeEmpresa, responsavel, email, telefone,
      uf,                    // sede
      regioesAtendidas,      // "estado" (só a UF da sede) | "nacional"
      categoriaSolucao,      // mesmo enum de categoriaDesafio
      descSolucao,           // texto livre curto
      estagio,               // "ideacao" | "prototipo" | "teste" | "validado" | "operacao"
      porteAlvo,             // enum de faixa de hectares que a solução atende melhor
      criadoEm
    }
  ],
  matches: [
    {
      id: "match_<timestamp>_<rand>",
      produtorId, empresaId,
      score,                 // 0-100, calculado no momento da ação
      status,                // "sugerido" | "conexao_solicitada"
      criadoEm
    }
  ]
}
```

**Categorias (compartilhadas entre desafio e solução)**, subconjunto das
categorias do documento de escopo, suficiente para a demo: Gestão da
Propriedade, Agricultura de Precisão, Pecuária de Precisão, Irrigação,
Clima e Previsão, Rastreabilidade, Comercialização, Crédito e Finanças,
Sustentabilidade, Automação e Dados, Logística.

**Porte** (faixas de hectares, iguais nos dois formulários para permitir
comparação direta): Até 200 ha, 201–1.000 ha, 1.001–5.000 ha, Acima de
5.000 ha.

## Motor de match (`mvp-match.js`)

Função pura `calcularAderencia(produtor, empresa)` → `{ score, faixa }`:

1. **Categoria** (peso 60): `categoriaDesafio === categoriaSolucao` → 60
   pontos; caso contrário → 0.
2. **Região** (peso 25): `empresa.regioesAtendidas === 'nacional'` → 25
   pontos; `empresa.regioesAtendidas === 'estado' && empresa.uf ===
   produtor.uf` → 25 pontos; caso contrário → 0.
3. **Porte** (peso 15): `produtor.porte === empresa.porteAlvo` → 15 pontos;
   faixa adjacente (uma posição de distância no enum ordenado) → 8 pontos;
   caso contrário → 0.

Score final = soma (0-100). Faixas: 0-40 baixa aderência, 41-70 média
aderência, 71-100 alta aderência — replicando os limiares do documento de
escopo.

Ao abrir `matches.html` para um registro, a função roda contra **todos os
registros do lado oposto** e retorna a lista ordenada por score
decrescente, mostrando os 5 melhores (ou todos, se houver menos de 5).

## Telas

### `cadastro-produtor.html`
Formulário: nome, e-mail, telefone, município, UF (select), atividade
(select curto), categoria do desafio (select), descrição do desafio
(textarea curto), urgência (baixa/média/alta), porte da propriedade
(select). Ao enviar: salva via `mvp-data.js`, redireciona para
`matches.html?tipo=produtor&id=<id>`.

### `cadastro-empresa.html`
Formulário: nome da empresa, responsável, e-mail, telefone, UF (sede),
regiões atendidas (estado da sede / nacional), categoria da solução
(select), descrição da solução (textarea curto), estágio (select), porte
de propriedade alvo (select). Ao enviar: salva, redireciona para
`matches.html?tipo=empresa&id=<id>`.

### `matches.html`
Lê `tipo` e `id` da query string, carrega o registro, roda o match contra
a base oposta, renderiza cards ordenados por score (visual inspirado no
"dial" de aderência já existente na landing — percentual + faixa de
estrelas), com botão "Solicitar conexão" por card. Esse botão grava um
registro em `matches[]` com `status: 'conexao_solicitada'` (idempotente —
se já existe match para o par, atualiza em vez de duplicar) e dá feedback
visual (toast ou troca do texto do botão), sem envio real de e-mail/
WhatsApp. Estado vazio: se a base oposta ainda não tem nenhum registro,
mostra mensagem "Ainda não há [produtores/empresas] cadastrados para
cruzar com seu perfil" com link para o admin (seed) ou para convidar o
outro lado.

### `admin.html`
Sem autenticação (é demo). Mostra:
- Contadores: total de produtores, total de empresas, total de matches
  com `status: 'conexao_solicitada'`.
- Tabela de produtores (nome, município/UF, categoria do desafio,
  urgência, data).
- Tabela de empresas (nome, UF, categoria da solução, estágio, data).
- Tabela de matches solicitados (produtor, empresa, score, data).
- Botão "Exportar CSV" por tabela (gera e baixa um `.csv` client-side).
- Botão "Carregar dados de exemplo" — popula 4-5 produtores e 4-5 empresas
  fictícios cobrindo várias categorias, para a demo não começar vazia.
- Botão "Limpar todos os dados" — com confirmação, apaga a chave do
  `localStorage`.

## Integração com a landing

Em `index.html`, dentro da seção `#cadastro` (linha ~739), os botões do
`type-selector` (`#btnTypeProducer`, `#btnTypeAgtech`) passam de alternar
campos de um formulário único para links diretos:
- "Sou Produtor Rural" → `cadastro-produtor.html`
- "Sou AgTech / Empresa" → `cadastro-empresa.html`

O formulário `#leadForm` e sua lógica de toggle em `app.js` são removidos
apenas na medida necessária para essa troca de destino — nenhuma outra
seção da landing é tocada. O simulador de matchmaking ilustrativo
(`#matchmaking`, cenários fixos) permanece como está, sem ligação com os
dados reais do MVP — são propósitos diferentes (marketing vs. produto
funcional).

## Testes

Sem framework de teste automatizado no projeto atualmente. Verificação
manual via `python3 -m http.server` (ou equivalente) cobrindo:
1. Cadastrar 1 produtor → cair em `matches.html` com estado vazio
   (nenhuma empresa ainda).
2. Cadastrar 2-3 empresas com categorias variadas → voltar ao match do
   produtor e conferir ranking coerente com as regras de pontuação.
3. Cadastrar empresa → ver matches do lado empresa contra os produtores
   existentes.
4. Solicitar conexão em um match → conferir que aparece em `admin.html`
   sem duplicar ao clicar de novo.
5. Seed de exemplo no admin → conferir contadores e exportação CSV.
6. Limpar dados → conferir que tudo volta a zero e as páginas tratam o
   estado vazio sem erro de JS.
7. CTA da landing (`#cadastro`) → conferir que os dois botões levam às
   páginas corretas.

## Riscos e limitações conhecidas (aceitos para esta iteração)

- Dados ficam presos ao navegador/dispositivo de quem preenche — não há
  compartilhamento real entre produtor e empresa em máquinas diferentes.
  Adequado para demo, não para captação real (documentado no README se
  necessário).
- Sem validação de e-mail/telefone além de HTML5 `required`/`type`.
- Sem proteção contra XSS além de inserir texto via `textContent`
  (nunca `innerHTML` com dados do usuário) nas listas e cards.
