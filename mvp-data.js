/* ==========================================================================
   RAIZ AGRO HUB - MVP DATA LAYER
   CRUD sobre localStorage para produtores, empresas e matches.
   Sem dependências de DOM. Ver docs/superpowers/specs/2026-08-22-mvp-matchmaking-design.md
   ========================================================================== */

const MVP_STORAGE_KEY = 'raizAgroHub_mvp';

const MVP_CATEGORIAS = [
    'Gestão da Propriedade',
    'Agricultura de Precisão',
    'Pecuária de Precisão',
    'Irrigação',
    'Clima e Previsão',
    'Rastreabilidade',
    'Comercialização',
    'Crédito e Finanças',
    'Sustentabilidade',
    'Automação e Dados',
    'Logística'
];

const MVP_PORTES = [
    'Até 200 ha',
    '201 a 1.000 ha',
    '1.001 a 5.000 ha',
    'Acima de 5.000 ha'
];

const MVP_ESTADOS = ['MS', 'MT', 'GO', 'PR', 'SP', 'MG', 'BA', 'RS', 'OUTRO'];

const MVP_ATIVIDADES = [
    'Agricultura',
    'Pecuária de Corte',
    'Pecuária de Leite',
    'Agropecuária',
    'Horticultura/Fruticultura',
    'Outra'
];

const MVP_URGENCIAS = ['baixa', 'media', 'alta'];

const MVP_ESTAGIOS = ['ideacao', 'prototipo', 'teste', 'validado', 'operacao'];

const MVP_REGIOES_ATENDIDAS = ['estado', 'nacional'];

function mvpGenerateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function mvpReadStore() {
    try {
        const raw = localStorage.getItem(MVP_STORAGE_KEY);
        if (!raw) return { produtores: [], empresas: [], matches: [] };
        const parsed = JSON.parse(raw);
        return {
            produtores: Array.isArray(parsed.produtores) ? parsed.produtores : [],
            empresas: Array.isArray(parsed.empresas) ? parsed.empresas : [],
            matches: Array.isArray(parsed.matches) ? parsed.matches : []
        };
    } catch (e) {
        console.error('MVP: falha ao ler localStorage, iniciando vazio.', e);
        return { produtores: [], empresas: [], matches: [] };
    }
}

function mvpWriteStore(store) {
    localStorage.setItem(MVP_STORAGE_KEY, JSON.stringify(store));
}

function mvpSalvarProdutor(dados) {
    const store = mvpReadStore();
    const produtor = {
        id: mvpGenerateId('prod'),
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        municipio: dados.municipio,
        uf: dados.uf,
        atividade: dados.atividade,
        categoriaDesafio: dados.categoriaDesafio,
        descDesafio: dados.descDesafio || '',
        urgencia: dados.urgencia,
        porte: dados.porte,
        criadoEm: new Date().toISOString()
    };
    store.produtores.push(produtor);
    mvpWriteStore(store);
    return produtor;
}

function mvpSalvarEmpresa(dados) {
    const store = mvpReadStore();
    const empresa = {
        id: mvpGenerateId('emp'),
        nomeEmpresa: dados.nomeEmpresa,
        responsavel: dados.responsavel,
        email: dados.email,
        telefone: dados.telefone,
        uf: dados.uf,
        regioesAtendidas: dados.regioesAtendidas,
        categoriaSolucao: dados.categoriaSolucao,
        descSolucao: dados.descSolucao || '',
        estagio: dados.estagio,
        porteAlvo: dados.porteAlvo,
        criadoEm: new Date().toISOString()
    };
    store.empresas.push(empresa);
    mvpWriteStore(store);
    return empresa;
}

function mvpListarProdutores() {
    return mvpReadStore().produtores;
}

function mvpListarEmpresas() {
    return mvpReadStore().empresas;
}

function mvpListarMatches() {
    return mvpReadStore().matches;
}

function mvpBuscarProdutorPorId(id) {
    return mvpReadStore().produtores.find(p => p.id === id) || null;
}

function mvpBuscarEmpresaPorId(id) {
    return mvpReadStore().empresas.find(e => e.id === id) || null;
}

/**
 * Registra (ou atualiza, se já existir para o par) uma solicitação de
 * conexão entre um produtor e uma empresa. Idempotente por par.
 */
function mvpSolicitarConexao(produtorId, empresaId, score) {
    const store = mvpReadStore();
    const existente = store.matches.find(
        m => m.produtorId === produtorId && m.empresaId === empresaId
    );
    if (existente) {
        existente.score = score;
        existente.status = 'conexao_solicitada';
        mvpWriteStore(store);
        return existente;
    }
    const match = {
        id: mvpGenerateId('match'),
        produtorId,
        empresaId,
        score,
        status: 'conexao_solicitada',
        criadoEm: new Date().toISOString()
    };
    store.matches.push(match);
    mvpWriteStore(store);
    return match;
}

function mvpLimparTudo() {
    localStorage.removeItem(MVP_STORAGE_KEY);
}

/**
 * Popula a base com registros de exemplo cobrindo várias categorias,
 * para a demo não começar vazia. Não duplica se já houver dados.
 */
function mvpCarregarSeed() {
    const store = mvpReadStore();
    const jaTinhaProdutores = store.produtores.length > 0;
    const jaTinhaEmpresas = store.empresas.length > 0;

    const produtoresSeed = [
        {
            nome: 'João Paulo Ferreira', email: 'joao.ferreira@exemplo.com.br', telefone: '(67) 99111-1111',
            municipio: 'Campo Grande', uf: 'MS', atividade: 'Agricultura',
            categoriaDesafio: 'Agricultura de Precisão', descDesafio: 'Mato tomando conta da lavoura de soja',
            urgencia: 'alta', porte: '201 a 1.000 ha'
        },
        {
            nome: 'Mariana Silveira', email: 'mariana.silveira@exemplo.com.br', telefone: '(65) 99222-2222',
            municipio: 'Sorriso', uf: 'MT', atividade: 'Agricultura',
            categoriaDesafio: 'Gestão da Propriedade', descDesafio: 'Gastando muito dinheiro com adubo',
            urgencia: 'media', porte: '1.001 a 5.000 ha'
        },
        {
            nome: 'Carlos Eduardo Mendes', email: 'carlos.mendes@exemplo.com.br', telefone: '(67) 99333-3333',
            municipio: 'Dourados', uf: 'MS', atividade: 'Pecuária de Corte',
            categoriaDesafio: 'Clima e Previsão', descDesafio: 'Não sabe a hora certa de tirar o gado do pasto',
            urgencia: 'media', porte: 'Acima de 5.000 ha'
        },
        {
            nome: 'Ana Beatriz Costa', email: 'ana.costa@exemplo.com.br', telefone: '(62) 99444-4444',
            municipio: 'Rio Verde', uf: 'GO', atividade: 'Pecuária de Leite',
            categoriaDesafio: 'Rastreabilidade', descDesafio: 'Dificuldade de controlar histórico do rebanho',
            urgencia: 'baixa', porte: '201 a 1.000 ha'
        },
        {
            nome: 'Roberto Almeida', email: 'roberto.almeida@exemplo.com.br', telefone: '(67) 99555-5555',
            municipio: 'Ponta Porã', uf: 'MS', atividade: 'Agropecuária',
            categoriaDesafio: 'Irrigação', descDesafio: 'Perdendo água na irrigação por gotejamento mal ajustado',
            urgencia: 'alta', porte: 'Até 200 ha'
        }
    ];

    const empresasSeed = [
        {
            nomeEmpresa: 'Geo IA', responsavel: 'Fernanda Duarte', email: 'contato@geoia.exemplo.com.br',
            telefone: '(11) 98111-1111', uf: 'SP', regioesAtendidas: 'nacional',
            categoriaSolucao: 'Agricultura de Precisão',
            descSolucao: 'Mostra onde está o mato na lavoura e diz o jeito certo de tirar',
            estagio: 'validado', porteAlvo: '201 a 1.000 ha'
        },
        {
            nomeEmpresa: 'AgriSmart', responsavel: 'Bruno Tavares', email: 'contato@agrismart.exemplo.com.br',
            telefone: '(65) 98222-2222', uf: 'MT', regioesAtendidas: 'estado',
            categoriaSolucao: 'Gestão da Propriedade',
            descSolucao: 'Testa a terra e diz a quantidade certa de adubo, economizando até 22%',
            estagio: 'operacao', porteAlvo: '1.001 a 5.000 ha'
        },
        {
            nomeEmpresa: 'TerraView Climate', responsavel: 'Camila Rocha', email: 'contato@terraview.exemplo.com.br',
            telefone: '(67) 98333-3333', uf: 'MS', regioesAtendidas: 'nacional',
            categoriaSolucao: 'Clima e Previsão',
            descSolucao: 'Manda alerta no celular 15 dias antes de mudança forte no tempo',
            estagio: 'validado', porteAlvo: 'Acima de 5.000 ha'
        },
        {
            nomeEmpresa: 'RastreiaBoi', responsavel: 'Diego Nunes', email: 'contato@rastreiaboi.exemplo.com.br',
            telefone: '(62) 98444-4444', uf: 'GO', regioesAtendidas: 'nacional',
            categoriaSolucao: 'Rastreabilidade',
            descSolucao: 'Registra o histórico de cada animal do rebanho pelo celular',
            estagio: 'operacao', porteAlvo: '201 a 1.000 ha'
        },
        {
            nomeEmpresa: 'IrrigaCerto', responsavel: 'Patrícia Lima', email: 'contato@irrigacerto.exemplo.com.br',
            telefone: '(67) 98555-5555', uf: 'MS', regioesAtendidas: 'estado',
            categoriaSolucao: 'Irrigação',
            descSolucao: 'Sensores que avisam quando a irrigação está desperdiçando água',
            estagio: 'teste', porteAlvo: 'Até 200 ha'
        }
    ];

    if (!jaTinhaProdutores) {
        produtoresSeed.forEach(mvpSalvarProdutor);
    }
    if (!jaTinhaEmpresas) {
        empresasSeed.forEach(mvpSalvarEmpresa);
    }

    return {
        produtores: jaTinhaProdutores ? 0 : produtoresSeed.length,
        empresas: jaTinhaEmpresas ? 0 : empresasSeed.length
    };
}
