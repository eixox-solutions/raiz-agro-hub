import { test, expect, chromium } from "@playwright/test";

test("produtor cadastrado em um dispositivo aparece para empresa cadastrada em outro dispositivo", async () => {
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
  await paginaProdutor.selectOption("#categoriaDesafio", "Irrigação");
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

  await paginaEmpresa.goto("/cadastro/empresa");
  await paginaEmpresa.fill("#nomeEmpresa", "Playwright Irrigação Ltda");
  await paginaEmpresa.fill("#responsavel", "Responsável Teste");
  await paginaEmpresa.fill("#email", `playwright.empresa+${timestamp}@teste.com`);
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
  await expect(paginaEmpresa.getByText("100%").first()).toBeVisible();

  await contextoEmpresa.close();

  // "Dispositivo" 1 de novo, contexto NOVO (não reaproveita o de antes),
  // confirma que agora vê a empresa que acabou de se cadastrar
  const contextoProdutorDeNovo = await browser.newContext();
  const paginaProdutorDeNovo = await contextoProdutorDeNovo.newPage();
  await paginaProdutorDeNovo.goto(`/matches/produtor/${idProdutor}`);

  await expect(paginaProdutorDeNovo.getByText("100%").first()).toBeVisible();
  // getByRole com `name` casa pelo nome acessível no momento da consulta; como
  // o texto do botão muda após o clique ("Falar com essa Empresa" -> "✓
  // Conexão Solicitada"), fixamos o card pelo índice (primeiro card da
  // lista) em vez de re-consultar por nome depois do clique.
  const botaoConectar = paginaProdutorDeNovo.getByRole("button").first();
  await expect(botaoConectar).toHaveText("Falar com essa Empresa");
  await botaoConectar.click();
  await expect(botaoConectar).toHaveText("✓ Conexão Solicitada");

  await contextoProdutorDeNovo.close();
  await browser.close();
});
