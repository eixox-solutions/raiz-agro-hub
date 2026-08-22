/* ==========================================================================
   RAIZ AGRO HUB - INTERATIVIDADE & SIMULADOR DE MATCHMAKING IA
   Inspirado na arquitetura do Pitch Deck Oficial do Raiz Agro Hub
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMatchmakingSimulator();
    initLeadForm();
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
            desafio: 'Ervas daninhas e eficiência no manejo',
            regiao: 'Centro-Sul (Mato Grosso do Sul)',
            area: '850 ha',
            tags: ['cana-de-açúcar', 'manejo', 'eficiência', 'controle']
        },
        match: {
            score: '94%',
            stars: 5
        },
        agtech: {
            name: 'Geo IA',
            category: 'AgTech Validada',
            especialidade: 'Inteligência de solo e monitoramento',
            solucao: 'Mapeamento de áreas críticas, controle de ervas daninhas e recomendação de manejo',
            tags: ['precisão', 'economia', 'dados', 'monitoramento']
        }
    },
    adubo: {
        producer: {
            name: 'Mariana Silveira',
            type: 'Produtora & Gestora Rural',
            cultura: 'Milho Safrinha e Soja',
            desafio: 'Redução de custos com fertilizantes NPK e calagem',
            regiao: 'Norte / Centro-Oeste (MS/MT)',
            area: '2.400 ha',
            tags: ['milho', 'adubação', 'redução de custos', 'taxa variável']
        },
        match: {
            score: '96%',
            stars: 5
        },
        agtech: {
            name: 'AgriSmart',
            category: 'AgTech Validada',
            especialidade: 'Nutrição de Precisão & IoT de Solo',
            solucao: 'Mapas de aplicação em taxa variável e sensores em tempo real de absorção NPK',
            tags: ['taxa variável', 'NPK', 'economia 22%', 'sensores']
        }
    },
    clima: {
        producer: {
            name: 'Carlos Eduardo Mendes',
            type: 'Diretor de Cooperativa',
            cultura: 'Pecuária de Corte e Grãos',
            desafio: 'Previsão microclimática para janela ideal de plantio e pastagem',
            regiao: 'Centro-Oeste (MS/GO)',
            area: '5.200 ha',
            tags: ['pecuária', 'clima', 'janela de plantio', 'pastagem']
        },
        match: {
            score: '92%',
            stars: 5
        },
        agtech: {
            name: 'TerraView Climate',
            category: 'AgTech Validada',
            especialidade: 'Inteligência Climática e Sensoriamento Remoto',
            solucao: 'Modelagem preditiva hiperlocal com radar meteorológico e índice de umidade',
            tags: ['radar', 'previsão 15 dias', 'alerta geada', 'satélite']
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
   3. FORMULÁRIO DE CADASTRO (PRODUTOR / AGTECH)
   ========================================================================== */
function initLeadForm() {
    const btnTypeProducer = document.getElementById('btnTypeProducer');
    const btnTypeAgtech = document.getElementById('btnTypeAgtech');
    const leadTypeInput = document.getElementById('leadType');
    const lblSegmento = document.getElementById('lblSegmento');
    const lblDesc = document.getElementById('lblDesc');
    const leadSegmento = document.getElementById('leadSegmento');
    const leadDesc = document.getElementById('leadDesc');

    const leadForm = document.getElementById('leadForm');
    const feedbackModal = document.getElementById('feedbackModal');
    const btnModalClose = document.getElementById('btnModalClose');

    if (btnTypeProducer && btnTypeAgtech) {
        btnTypeProducer.addEventListener('click', () => {
            btnTypeProducer.classList.add('active');
            btnTypeAgtech.classList.remove('active');
            leadTypeInput.value = 'produtor';

            lblSegmento.textContent = 'Cultura Principal / Atividade *';
            leadSegmento.placeholder = 'Ex: Soja, Milho, Pecuária, Cana';

            lblDesc.textContent = 'Principal desafio ou dor que você enfrenta no campo';
            leadDesc.placeholder = 'Conte-nos sobre o problema que deseja resolver na sua propriedade...';
        });

        btnTypeAgtech.addEventListener('click', () => {
            btnTypeAgtech.classList.add('active');
            btnTypeProducer.classList.remove('active');
            leadTypeInput.value = 'agtech';

            lblSegmento.textContent = 'Nome da Solução / AgTech *';
            leadSegmento.placeholder = 'Ex: Plataforma de Drones, Bioinsumos, Software de Gestão';

            lblDesc.textContent = 'Descrição da solução e perfil de produtor que busca atender';
            leadDesc.placeholder = 'Descreva os diferenciais da sua solução técnica e estágio de validação...';
        });
    }

    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nome = document.getElementById('leadNome').value.trim();
            const email = document.getElementById('leadEmail').value.trim();
            const phone = document.getElementById('leadPhone').value.trim();

            if (!nome || !email || !phone) {
                alert('Por favor, preencha todos os campos obrigatórios (*).');
                return;
            }

            // Exibir modal de sucesso
            if (feedbackModal) {
                feedbackModal.classList.add('active');
            }

            leadForm.reset();
        });
    }

    if (btnModalClose && feedbackModal) {
        btnModalClose.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
        });

        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) {
                feedbackModal.classList.remove('active');
            }
        });
    }
}
