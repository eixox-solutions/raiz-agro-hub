/* ==========================================================================
   RAIZ AGRO HUB - INTERATIVIDADE & SIMULADOR DE MATCHMAKING IA
   Inspirado na arquitetura do Pitch Deck Oficial do Raiz Agro Hub
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMatchmakingSimulator();
});

/* ==========================================================================
   1. NAVBAR & MENU MOBILE
   ========================================================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }
}

/* ==========================================================================
   2. SIMULADOR DE MATCHMAKING INTELIGENTE (SLIDE 7)
   ========================================================================== */
const scenarios = {
    ervas: {
        producer: {
            name: 'João Paulo',
            type: 'Produtor Rural',
            cultura: 'Cana-de-açúcar e Soja',
            desafio: 'Mato tomando conta da lavoura',
            regiao: 'Centro-Sul (Mato Grosso do Sul)',
            area: '850 ha',
            tags: ['cana-de-açúcar', 'manejo', 'economia', 'controle']
        },
        match: {
            score: '94%',
            stars: 5
        },
        agtech: {
            name: 'Geo IA',
            category: 'Empresa Já Conferida',
            especialidade: 'Olha o solo e avisa onde tem problema',
            solucao: 'Mostra onde está o mato na lavoura e diz o jeito certo de tirar',
            tags: ['precisão', 'economia', 'dados', 'monitoramento']
        }
    },
    adubo: {
        producer: {
            name: 'Mariana Silveira',
            type: 'Produtora & Gestora Rural',
            cultura: 'Milho Safrinha e Soja',
            desafio: 'Gastando muito dinheiro com adubo',
            regiao: 'Norte / Centro-Oeste (MS/MT)',
            area: '2.400 ha',
            tags: ['milho', 'adubação', 'economia', 'menos desperdício']
        },
        match: {
            score: '96%',
            stars: 5
        },
        agtech: {
            name: 'AgriSmart',
            category: 'Empresa Já Conferida',
            especialidade: 'Testa a terra e diz a quantidade certa de adubo',
            solucao: 'Coloca adubo só onde precisa, economizando até 22% no gasto',
            tags: ['economia 22%', 'menos desperdício', 'sensores no solo']
        }
    },
    clima: {
        producer: {
            name: 'Carlos Eduardo Mendes',
            type: 'Diretor de Cooperativa',
            cultura: 'Pecuária de Corte e Grãos',
            desafio: 'Não sabe a hora certa de plantar ou tirar o gado do pasto',
            regiao: 'Centro-Oeste (MS/GO)',
            area: '5.200 ha',
            tags: ['pecuária', 'clima', 'hora certa de plantar', 'pastagem']
        },
        match: {
            score: '92%',
            stars: 5
        },
        agtech: {
            name: 'TerraView Climate',
            category: 'Empresa Já Conferida',
            especialidade: 'Avisa com antecedência sobre chuva, seca e geada',
            solucao: 'Manda alerta no celular 15 dias antes de mudança forte no tempo',
            tags: ['previsão 15 dias', 'alerta de geada', 'direto no celular']
        }
    }
};

function initMatchmakingSimulator() {
    const simButtons = document.querySelectorAll('.sim-btn');
    if (!simButtons.length) return;

    simButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            simButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const scenarioKey = btn.getAttribute('data-scenario');
            loadScenario(scenarioKey);
        });
    });
}

function loadScenario(key) {
    const data = scenarios[key];
    if (!data) return;

    // Elements
    const prodName = document.getElementById('prodName');
    const prodType = document.getElementById('prodType');
    const prodCultura = document.getElementById('prodCultura');
    const prodDesafio = document.getElementById('prodDesafio');
    const prodRegiao = document.getElementById('prodRegiao');
    const prodArea = document.getElementById('prodArea');
    const prodTags = document.getElementById('prodTags');

    const matchScore = document.getElementById('matchScore');

    const agtechName = document.getElementById('agtechName');
    const agtechCategory = document.getElementById('agtechCategory');
    const agtechEspecialidade = document.getElementById('agtechEspecialidade');
    const agtechSolucao = document.getElementById('agtechSolucao');
    const agtechTags = document.getElementById('agtechTags');

    // Producer update
    if (prodName) prodName.textContent = data.producer.name;
    if (prodType) prodType.textContent = data.producer.type;
    if (prodCultura) prodCultura.textContent = data.producer.cultura;
    if (prodDesafio) prodDesafio.textContent = data.producer.desafio;
    if (prodRegiao) prodRegiao.textContent = data.producer.regiao;
    if (prodArea) prodArea.textContent = data.producer.area;
    if (prodTags) {
        prodTags.innerHTML = data.producer.tags.map(t => `<span class="tag">${t}</span>`).join('');
    }

    // Match Dial Update with slight animation
    if (matchScore) {
        matchScore.textContent = data.match.score;
    }

    // AgTech update
    if (agtechName) agtechName.textContent = data.agtech.name;
    if (agtechCategory) agtechCategory.textContent = data.agtech.category;
    if (agtechEspecialidade) agtechEspecialidade.textContent = data.agtech.especialidade;
    if (agtechSolucao) agtechSolucao.textContent = data.agtech.solucao;
    if (agtechTags) {
        agtechTags.innerHTML = data.agtech.tags.map(t => `<span class="tag">${t}</span>`).join('');
    }
}

/* ==========================================================================
   3. SEÇÃO DE CADASTRO (PRODUTOR / EMPRESA)
   Os botões "Sou Produtor Rural" / "Sou Empresa de Tecnologia" agora são
   links diretos para cadastro-produtor.html / cadastro-empresa.html
   (formulários reais do MVP), sem lógica de toggle/submit aqui.
   ========================================================================== */
