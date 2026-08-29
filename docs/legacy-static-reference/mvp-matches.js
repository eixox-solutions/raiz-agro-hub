/* ==========================================================================
   RAIZ AGRO HUB - TELA DE COMBINAÇÕES (matches.html)
   Lê tipo/id da query string, roda o ranking de aderência e renderiza
   os cards de resultado. Nunca usa innerHTML com dados de usuário.
   Ver docs/superpowers/specs/2026-08-22-mvp-matchmaking-design.md
   ========================================================================== */

(function () {
    const MAX_RESULTADOS = 5;

    const titleEl = document.getElementById('mvpTitle');
    const subtitleEl = document.getElementById('mvpSubtitle');
    const eyebrowEl = document.getElementById('mvpEyebrow');
    const contentEl = document.getElementById('mvpContent');

    function clearEl(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    function clearContent() {
        clearEl(contentEl);
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }

    function renderErro(mensagem, linkHref, linkTexto) {
        titleEl.textContent = 'Não encontramos esse cadastro';
        subtitleEl.textContent = 'Pode ter sido feito em outro navegador, ou os dados podem ter sido limpos.';
        clearContent();

        const box = el('div', 'mvp-empty-state');
        box.appendChild(el('i', 'fa-solid fa-triangle-exclamation'));
        box.appendChild(el('p', null, mensagem));

        const actions = el('div', 'mvp-empty-actions');
        const link = el('a', 'btn btn-primary', linkTexto);
        link.href = linkHref;
        actions.appendChild(link);

        const homeLink = el('a', 'btn btn-outline', 'Voltar para o início');
        homeLink.href = 'index.html';
        actions.appendChild(homeLink);

        box.appendChild(actions);
        contentEl.appendChild(box);
    }

    function renderEstadoVazio(tipo) {
        clearContent();

        const box = el('div', 'mvp-empty-state');
        box.appendChild(el('i', 'fa-solid fa-seedling'));

        if (tipo === 'produtor') {
            box.appendChild(el('p', null,
                'Ainda não há empresas cadastradas com soluções pra te mostrar. Assim que uma empresa se cadastrar, a gente te avisa!'));
        } else {
            box.appendChild(el('p', null,
                'Ainda não há produtores cadastrados com desafios pra te mostrar. Assim que um produtor se cadastrar, a gente te avisa!'));
        }

        const actions = el('div', 'mvp-empty-actions');

        const cadastrarLink = el('a', 'btn btn-primary',
            tipo === 'produtor' ? 'Cadastrar Empresa' : 'Cadastrar Produtor');
        cadastrarLink.href = tipo === 'produtor' ? 'cadastro-empresa.html' : 'cadastro-produtor.html';
        actions.appendChild(cadastrarLink);

        const adminLink = el('a', 'btn btn-outline', 'Ver o painel admin');
        adminLink.href = 'admin.html';
        actions.appendChild(adminLink);

        box.appendChild(actions);

        const dica = el('p', 'mvp-hint');
        dica.appendChild(document.createTextNode('Dica: no '));
        const adminInlineLink = el('a', null, 'admin.html');
        adminInlineLink.href = 'admin.html';
        dica.appendChild(adminInlineLink);
        dica.appendChild(document.createTextNode(' dá pra carregar dados de exemplo para testar o sistema.'));
        box.appendChild(dica);

        contentEl.appendChild(box);
    }

    function estrelas(faixa) {
        const qtd = faixa === 'alta' ? 5 : faixa === 'media' ? 3 : 1;
        const wrap = el('div', 'mvp-dial-stars');
        for (let i = 0; i < 5; i++) {
            const icon = document.createElement('i');
            icon.className = i < qtd ? 'fa-solid fa-star' : 'fa-regular fa-star';
            wrap.appendChild(icon);
        }
        return wrap;
    }

    function criarCardResultado(item, tipo, origemId) {
        const card = el('div', 'mvp-match-card mvp-match-card-flex');

        // Lado esquerdo: dial de aderência (score + estrelas)
        const dial = el('div', 'mvp-dial');
        dial.appendChild(el('div', 'mvp-dial-score', item.score + '%'));
        dial.appendChild(el('div', 'mvp-dial-label', 'combina com você'));
        dial.appendChild(estrelas(item.faixa));
        card.appendChild(dial);

        // Lado direito: resumo + ação
        const info = el('div', 'mvp-match-info');

        let nome, categoria, descricao, extraLabel, extraValor, botaoTexto, produtorId, empresaId;

        if (tipo === 'produtor') {
            const empresa = item.empresa;
            nome = empresa.nomeEmpresa;
            categoria = empresa.categoriaSolucao;
            descricao = empresa.descSolucao;
            extraLabel = 'Estágio';
            extraValor = empresa.estagio;
            botaoTexto = 'Falar com essa Empresa';
            produtorId = origemId;
            empresaId = empresa.id;
        } else {
            const produtor = item.produtor;
            nome = produtor.nome;
            categoria = produtor.categoriaDesafio;
            descricao = produtor.descDesafio;
            extraLabel = 'Urgência';
            extraValor = produtor.urgencia;
            botaoTexto = 'Falar com esse Produtor';
            produtorId = produtor.id;
            empresaId = origemId;
        }

        info.appendChild(el('h3', 'mvp-match-name', nome));

        const tagsRow = el('div', 'mvp-match-tags');
        tagsRow.appendChild(el('span', 'mvp-score-badge', categoria));
        if (extraValor) {
            tagsRow.appendChild(el('span', 'mvp-score-badge mvp-score-badge-alt', extraLabel + ': ' + extraValor));
        }
        info.appendChild(tagsRow);

        if (descricao) {
            info.appendChild(el('p', 'mvp-match-desc', descricao));
        }

        const btn = el('button', 'btn btn-primary mvp-btn-conectar', botaoTexto);
        btn.type = 'button';

        const feedback = el('span', 'mvp-conexao-feedback');

        btn.addEventListener('click', function () {
            mvpSolicitarConexao(produtorId, empresaId, item.score);
            btn.disabled = true;
            btn.classList.add('is-solicitado');
            btn.textContent = '✓ Conexão Solicitada';
            feedback.textContent = 'A gente já registrou seu interesse. Em breve vocês podem se falar!';
        });

        info.appendChild(btn);
        info.appendChild(feedback);

        card.appendChild(info);
        return card;
    }

    function renderResultados(tipo, origem, ranking) {
        clearContent();

        const listaOrdenada = ranking.slice(0, MAX_RESULTADOS);

        const listWrap = el('div', 'mvp-match-list');
        listaOrdenada.forEach(function (item) {
            listWrap.appendChild(criarCardResultado(item, tipo, origem.id));
        });
        contentEl.appendChild(listWrap);
    }

    function init() {
        const params = new URLSearchParams(window.location.search);
        const tipo = params.get('tipo');
        const id = params.get('id');

        if (tipo !== 'produtor' && tipo !== 'empresa') {
            renderErro(
                'Não conseguimos identificar seu perfil. Faça seu cadastro para ver suas combinações.',
                'cadastro-produtor.html',
                'Fazer meu cadastro'
            );
            return;
        }

        if (!id) {
            renderErro(
                'Não encontramos um cadastro associado a este link. Faça seu cadastro para ver suas combinações.',
                tipo === 'empresa' ? 'cadastro-empresa.html' : 'cadastro-produtor.html',
                'Fazer meu cadastro'
            );
            return;
        }

        if (tipo === 'produtor') {
            const produtor = mvpBuscarProdutorPorId(id);
            if (!produtor) {
                renderErro(
                    'Não encontramos esse cadastro de produtor.',
                    'cadastro-produtor.html',
                    'Fazer novo cadastro'
                );
                return;
            }

            clearEl(eyebrowEl);
            eyebrowEl.appendChild(el('i', 'fa-solid fa-wheat-awn'));
            eyebrowEl.appendChild(document.createTextNode(' Suas Combinações'));
            titleEl.textContent = 'Suas melhores opções, ' + produtor.nome;
            subtitleEl.textContent = 'Empresas que podem resolver o seu desafio, começando pelas que mais combinam.';

            const empresas = mvpListarEmpresas();
            if (empresas.length === 0) {
                renderEstadoVazio('produtor');
                return;
            }

            const ranking = mvpRankearEmpresasParaProdutor(produtor, empresas);
            renderResultados('produtor', produtor, ranking);
        } else {
            const empresa = mvpBuscarEmpresaPorId(id);
            if (!empresa) {
                renderErro(
                    'Não encontramos esse cadastro de empresa.',
                    'cadastro-empresa.html',
                    'Fazer novo cadastro'
                );
                return;
            }

            clearEl(eyebrowEl);
            eyebrowEl.appendChild(el('i', 'fa-solid fa-microchip'));
            eyebrowEl.appendChild(document.createTextNode(' Suas Combinações'));
            titleEl.textContent = 'Produtores que combinam com sua solução';
            subtitleEl.textContent = empresa.nomeEmpresa + ', esses são os produtores mais alinhados com o que você resolve.';

            const produtores = mvpListarProdutores();
            if (produtores.length === 0) {
                renderEstadoVazio('empresa');
                return;
            }

            const ranking = mvpRankearProdutoresParaEmpresa(empresa, produtores);
            renderResultados('empresa', empresa, ranking);
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
