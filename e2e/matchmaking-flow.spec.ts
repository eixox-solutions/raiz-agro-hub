import { test, expect, chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

function lerEnvLocal(chave: string): string | undefined {
  if (process.env[chave]) return process.env[chave];
  try {
    const conteudo = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
    const linha = conteudo.split("\n").find((l) => l.startsWith(`${chave}=`));
    return linha?.slice(chave.length + 1).trim();
  } catch {
    return undefined;
  }
}

// Categoria escolhida por ser rara nos dados manuais de outras tasks
// ("Automação e Dados" em vez de "Irrigação", que acumulou muitos matches
// de 100% em testes manuais anteriores e derrubava o registro deste teste
// para fora do top-5 exibido em /matches/produtor/[id] — ver ruling da
// Task 13 em progress.md para o histórico completo desse problema).
const CATEGORIA_TESTE = "Automação e Dados";

test.afterEach(async () => {
  const url = lerEnvLocal("NEXT_PUBLIC_SUPABASE_URL");
  const key = lerEnvLocal("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return;
  const supabase = createClient(url, key);

  const { data: produtoresTeste } = await supabase
    .from("produtores")
    .select("id")
    .like("email", "playwright.%@teste.com");
  const idsProdutores = (produtoresTeste ?? []).map((p) => p.id);

  if (idsProdutores.length > 0) {
    await supabase.from("matches").delete().in("produtor_id", idsProdutores);
  }
  await supabase.from("produtores").delete().like("email", "playwright.%@teste.com");
  await supabase.from("empresas").delete().like("email", "playwright.%@teste.com");
});

test("produtor cadastrado em um dispositivo aparece para empresa cadastrada em outro dispositivo", async () => {
  test.setTimeout(90_000);
  const browser = await chromium.launch();
  const timestamp = Date.now();

  // "Dispositivo" 1: produtor
  const contextoProdutor = await browser.newContext();
  const paginaProdutor = await contextoProdutor.newPage();

  await paginaProdutor.goto("/cadastro/produtor");
  await paginaProdutor.fill("#nome", "Playwright Produtor Teste");
  await paginaProdutor.fill("#email", `playwright.produtor+${timestamp}@teste.com`);
  await paginaProdutor.fill("#telefone", "67999998888");
  await paginaProdutor.fill("#municipio", "Bonito");
  await paginaProdutor.selectOption("#uf", "MS");
  await paginaProdutor.selectOption("#atividade", "Agricultura");
  await paginaProdutor.selectOption("#categoriaDesafio", CATEGORIA_TESTE);
  await paginaProdutor.fill("#descDesafio", "Perdendo água na irrigação");
  await paginaProdutor.check('input[name="urgencia"][value="alta"]');
  await paginaProdutor.selectOption("#porte", "Até 200 ha");
  await paginaProdutor.click('button[type="submit"]');

  await paginaProdutor.waitForURL(/\/matches\/produtor\//);
  const urlProdutor = paginaProdutor.url();
  const idProdutor = new URL(urlProdutor).pathname.split("/").pop()!;

  // Nesse momento a página de matches do produtor pode mostrar o estado
  // vazio OU cards de empresas pré-existentes no banco local (dados de
  // outras tasks/execuções) — não assumimos banco limpo. O que importa é
  // confirmar, mais abaixo, que depois do cadastro no "dispositivo 2" a
  // empresa recém-criada passa a aparecer no ranking do produtor com 100%
  // (prova de que o dado atravessou dispositivos via Supabase).
  await expect(paginaProdutor.locator("main")).toBeVisible();

  await contextoProdutor.close();

  // "Dispositivo" 2: empresa, contexto totalmente separado (sem cookies/localStorage compartilhado)
  const contextoEmpresa = await browser.newContext();
  const paginaEmpresa = await contextoEmpresa.newPage();

  const descSolucao = `Sensores de irrigação inteligente ${timestamp}`;

  await paginaEmpresa.goto("/cadastro/empresa");
  await paginaEmpresa.fill("#nomeEmpresa", "Playwright Irrigação Ltda");
  await paginaEmpresa.fill("#responsavel", "Responsável Teste");
  await paginaEmpresa.fill("#email", `playwright.empresa+${timestamp}@teste.com`);
  await paginaEmpresa.fill("#telefone", "67988887777");
  await paginaEmpresa.selectOption("#uf", "MS");
  await paginaEmpresa.check('input[name="regioesAtendidas"][value="nacional"]');
  await paginaEmpresa.selectOption("#categoriaSolucao", CATEGORIA_TESTE);
  await paginaEmpresa.fill("#descSolucao", descSolucao);
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
  // O banco local de dev não é limpo entre execuções, então pode haver
  // outros matches de 100% de tasks/execuções anteriores — usar `.first()`
  // aqui não provaria nada sobre o produtor específico deste teste. A
  // asserção que realmente prova a identidade (este produtor, cadastrado
  // no "dispositivo 1") é feita abaixo, no card do lado da empresa é só
  // uma checagem de fumaça de que a página carregou.
  await expect(paginaEmpresa.getByText("100%").first()).toBeVisible();

  await contextoEmpresa.close();

  // "Dispositivo" 1 de novo, contexto NOVO (não reaproveita o de antes),
  // confirma que agora vê a empresa que acabou de se cadastrar
  const contextoProdutorDeNovo = await browser.newContext();
  const paginaProdutorDeNovo = await contextoProdutorDeNovo.newPage();
  await paginaProdutorDeNovo.goto(`/matches/produtor/${idProdutor}`);

  // Identidade real: o card da empresa recém-cadastrada é localizado pela
  // descrição da solução, que recebeu um sufixo único (timestamp) no
  // cadastro acima — isso evita que `.first()`/índice posicional capture
  // um card de dados legados que por acaso também pontue 100% (o que
  // deixaria o teste passar mesmo se o matching cross-device estivesse
  // quebrado, desde que outro match 100% pré-existisse no banco).
  const cardEmpresaRecemCadastrada = paginaProdutorDeNovo
    .getByText(descSolucao, { exact: true })
    .locator("xpath=ancestor::div[contains(@class, 'rounded-lg')][1]");

  await expect(cardEmpresaRecemCadastrada).toBeVisible();
  await expect(cardEmpresaRecemCadastrada.getByText("100%")).toBeVisible();

  const botaoConectar = cardEmpresaRecemCadastrada.getByRole("button");
  await expect(botaoConectar).toHaveText("Falar com essa Empresa");
  await botaoConectar.click();
  await expect(botaoConectar).toHaveText("✓ Conexão Solicitada");

  await contextoProdutorDeNovo.close();
  await browser.close();
});
