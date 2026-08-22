/* ==========================================================================
   RAIZ AGRO HUB - PAINEL ADMIN
   Contadores, tabelas, exportação CSV e ações de seed/limpar dados.
   Depende de mvp-data.js (carregado antes deste script).
   ========================================================================== */

(function () {
    'use strict';

    function formatarData(isoString) {
        if (!isoString) return '—';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('pt-BR');
    }

    function capitalizar(texto) {
        if (!texto) return '—';
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    /** Cria uma célula de tabela com texto seguro (sem innerHTML). */
    function criarCelula(texto) {
        const td = document.createElement('td');
        td.textContent = (texto === null || texto === undefined || texto === '') ? '—' : texto;
        return td;
    }

    /** Renderiza linhas em um <tbody>, ou uma linha de "vazio" com a mensagem dada. */
    function renderizarTabela(tbody, linhas, numColunas, mensagemVazia) {
        tbody.textContent = '';
        if (!linhas.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = numColunas;
            td.textContent = mensagemVazia;
            td.className = 'mvp-table-empty';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }
        linhas.forEach(valores => {
            const tr = document.createElement('tr');
            valores.forEach(valor => tr.appendChild(criarCelula(valor)));
            tbody.appendChild(tr);
        });
    }

    function renderizarProdutores() {
        const produtores = mvpListarProdutores();
        const tbody = document.getElementById('bodyProdutores');
        const linhas = produtores.map(p => [
            p.nome,
            `${p.municipio || '—'}/${p.uf || '—'}`,
            p.categoriaDesafio,
            capitalizar(p.urgencia),
            formatarData(p.criadoEm)
        ]);
        renderizarTabela(tbody, linhas, 5, 'Nenhum produtor cadastrado ainda.');
        document.getElementById('countProdutores').textContent = produtores.length;
        return produtores;
    }

    function renderizarEmpresas() {
        const empresas = mvpListarEmpresas();
        const tbody = document.getElementById('bodyEmpresas');
        const linhas = empresas.map(e => [
            e.nomeEmpresa,
            e.uf,
            e.categoriaSolucao,
            capitalizar(e.estagio),
            formatarData(e.criadoEm)
        ]);
        renderizarTabela(tbody, linhas, 5, 'Nenhuma empresa cadastrada ainda.');
        document.getElementById('countEmpresas').textContent = empresas.length;
        return empresas;
    }

    function renderizarConexoes() {
        const matches = mvpListarMatches().filter(m => m.status === 'conexao_solicitada');
        const tbody = document.getElementById('bodyConexoes');
        const linhas = matches.map(m => {
            const produtor = mvpBuscarProdutorPorId(m.produtorId);
            const empresa = mvpBuscarEmpresaPorId(m.empresaId);
            return [
                produtor ? produtor.nome : 'Produtor removido',
                empresa ? empresa.nomeEmpresa : 'Empresa removida',
                `${m.score}% combina`,
                formatarData(m.criadoEm)
            ];
        });
        renderizarTabela(tbody, linhas, 4, 'Nenhuma conexão solicitada ainda.');
        document.getElementById('countConexoes').textContent = matches.length;
        return matches;
    }

    /** Escapa um campo para CSV: aspas duplicadas e valor entre aspas se contiver vírgula, aspas ou quebra de linha. */
    function escaparCampoCsv(valor) {
        const texto = (valor === null || valor === undefined) ? '' : String(valor);
        if (/[",\n\r]/.test(texto)) {
            return '"' + texto.replace(/"/g, '""') + '"';
        }
        return texto;
    }

    function gerarCsv(cabecalhos, linhas) {
        const todasLinhas = [cabecalhos, ...linhas];
        return todasLinhas
            .map(linha => linha.map(escaparCampoCsv).join(','))
            .join('\r\n');
    }

    function baixarCsv(conteudoCsv, nomeArquivo) {
        const blob = new Blob(['﻿' + conteudoCsv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function exportarProdutoresCsv() {
        const produtores = mvpListarProdutores();
        const cabecalhos = ['Nome', 'E-mail', 'Telefone', 'Município', 'UF', 'Atividade', 'Categoria do Desafio', 'Descrição do Desafio', 'Urgência', 'Porte', 'Data de Cadastro'];
        const linhas = produtores.map(p => [
            p.nome, p.email, p.telefone, p.municipio, p.uf, p.atividade,
            p.categoriaDesafio, p.descDesafio, p.urgencia, p.porte, formatarData(p.criadoEm)
        ]);
        baixarCsv(gerarCsv(cabecalhos, linhas), 'produtores.csv');
    }

    function exportarEmpresasCsv() {
        const empresas = mvpListarEmpresas();
        const cabecalhos = ['Nome da Empresa', 'Responsável', 'E-mail', 'Telefone', 'UF', 'Regiões Atendidas', 'Categoria da Solução', 'Descrição da Solução', 'Estágio', 'Porte Alvo', 'Data de Cadastro'];
        const linhas = empresas.map(e => [
            e.nomeEmpresa, e.responsavel, e.email, e.telefone, e.uf, e.regioesAtendidas,
            e.categoriaSolucao, e.descSolucao, e.estagio, e.porteAlvo, formatarData(e.criadoEm)
        ]);
        baixarCsv(gerarCsv(cabecalhos, linhas), 'empresas.csv');
    }

    function exportarConexoesCsv() {
        const matches = mvpListarMatches().filter(m => m.status === 'conexao_solicitada');
        const cabecalhos = ['Produtor', 'Empresa', 'Score', 'Data'];
        const linhas = matches.map(m => {
            const produtor = mvpBuscarProdutorPorId(m.produtorId);
            const empresa = mvpBuscarEmpresaPorId(m.empresaId);
            return [
                produtor ? produtor.nome : 'Produtor removido',
                empresa ? empresa.nomeEmpresa : 'Empresa removida',
                `${m.score}%`,
                formatarData(m.criadoEm)
            ];
        });
        baixarCsv(gerarCsv(cabecalhos, linhas), 'conexoes.csv');
    }

    function mostrarFeedback(mensagem) {
        const el = document.getElementById('seedFeedback');
        el.textContent = mensagem;
    }

    function inicializar() {
        renderizarProdutores();
        renderizarEmpresas();
        renderizarConexoes();

        document.getElementById('btnSeed').addEventListener('click', () => {
            const resultado = mvpCarregarSeed();
            if (resultado.produtores === 0 && resultado.empresas === 0) {
                mostrarFeedback('Já existiam dados cadastrados — nenhum dado de exemplo foi adicionado.');
                return;
            }
            mostrarFeedback(`Adicionados ${resultado.produtores} produtores e ${resultado.empresas} empresas de exemplo. Atualizando...`);
            setTimeout(() => location.reload(), 600);
        });

        document.getElementById('btnClear').addEventListener('click', () => {
            const confirmado = confirm('Tem certeza? Isso vai apagar todos os produtores, empresas e conexões cadastrados.');
            if (!confirmado) return;
            mvpLimparTudo();
            location.reload();
        });

        document.getElementById('btnExportProdutores').addEventListener('click', exportarProdutoresCsv);
        document.getElementById('btnExportEmpresas').addEventListener('click', exportarEmpresasCsv);
        document.getElementById('btnExportConexoes').addEventListener('click', exportarConexoesCsv);
    }

    document.addEventListener('DOMContentLoaded', inicializar);
})();
