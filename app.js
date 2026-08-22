/* ==========================================================================
   RAIZ AGRO HUB - INTERACTIVE LOGIC & ANIMATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMarketTicker();
    initNavbar();
    initStatsCounter();
    initRoiCalculator();
    initProposalForm();
});

/* ==========================================================================
   1. MARKET TICKER & COMMODITIES DATA
   ========================================================================== */
const marketData = [
    { id: 'soja', name: 'Soja Paranaguá', unit: 'Saca 60kg', price: 134.50, change: 1.45, isUp: true },
    { id: 'milho', name: 'Milho Campinas', unit: 'Saca 60kg', price: 68.20, change: -0.80, isUp: false },
    { id: 'boi', name: 'Boi Gordo CEPEA', unit: 'Arroba 15kg', price: 248.90, change: 2.10, isUp: true },
    { id: 'cafe', name: 'Café Arábica', unit: 'Saca 60kg', price: 1045.00, change: 0.95, isUp: true },
    { id: 'dolar', name: 'Dólar Comercial', unit: 'USD / BRL', price: 5.48, change: -0.32, isUp: false },
    { id: 'trigo', name: 'Trigo Paraná', unit: 'Tonalada', price: 1420.00, change: 0.50, isUp: true },
];

function initMarketTicker() {
    const tickerWrapper = document.getElementById('tickerWrapper');
    const marketCardsContainer = document.getElementById('marketCardsContainer');

    if (!tickerWrapper || !marketCardsContainer) return;

    // Render Ticker items (duplicated for infinite seamless loop)
    renderTickerItems([...marketData, ...marketData]);

    // Render Market Cards
    renderMarketCards(marketData);

    // Dynamic Price Fluctuation Simulator (Every 4 seconds)
    setInterval(() => {
        simulateMarketUpdates();
    }, 4000);
}

function renderTickerItems(items) {
    const tickerWrapper = document.getElementById('tickerWrapper');
    tickerWrapper.innerHTML = items.map(item => {
        const changeClass = item.isUp ? 'up' : 'down';
        const icon = item.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
        const sign = item.isUp ? '+' : '';
        return `
            <div class="ticker-item" id="ticker-${item.id}">
                <span class="name">${item.name}:</span>
                <span class="price">R$ ${item.price.toFixed(2)}</span>
                <span class="${changeClass}">
                    <i class="fa-solid ${icon}"></i> ${sign}${item.change.toFixed(2)}%
                </span>
            </div>
        `;
    }).join('');
}

function renderMarketCards(items) {
    const container = document.getElementById('marketCardsContainer');
    container.innerHTML = items.map(item => {
        const changeClass = item.isUp ? 'up' : 'down';
        const icon = item.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
        const sign = item.isUp ? '+' : '';
        return `
            <div class="market-card">
                <div class="mc-header">
                    <span class="mc-title">${item.name}</span>
                    <span class="mc-unit">${item.unit}</span>
                </div>
                <div class="mc-price" id="card-price-${item.id}">R$ ${item.price.toFixed(2)}</div>
                <div class="mc-change ${changeClass}" id="card-change-${item.id}">
                    <i class="fa-solid ${icon}"></i> ${sign}${item.change.toFixed(2)}% (Hoje)
                </div>
            </div>
        `;
    }).join('');
}

function simulateMarketUpdates() {
    // Pick a random commodity to fluctuate
    const randomIndex = Math.floor(Math.random() * marketData.length);
    const item = marketData[randomIndex];
    
    // Slight random variation (-0.4% to +0.4%)
    const delta = (Math.random() * 0.8 - 0.4);
    item.price = Math.max(1, item.price + (item.price * (delta / 100)));
    item.change = item.change + delta;
    item.isUp = item.change >= 0;

    // Update UI elements smoothly
    const priceEl = document.getElementById(`card-price-${item.id}`);
    const changeEl = document.getElementById(`card-change-${item.id}`);

    if (priceEl && changeEl) {
        priceEl.textContent = `R$ ${item.price.toFixed(2)}`;
        const icon = item.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
        const sign = item.isUp ? '+' : '';
        changeEl.className = `mc-change ${item.isUp ? 'up' : 'down'}`;
        changeEl.innerHTML = `<i class="fa-solid ${icon}"></i> ${sign}${item.change.toFixed(2)}% (Hoje)`;
    }
}

/* ==========================================================================
   2. NAVBAR & MOBILE MENU
   ========================================================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
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

        // Close mobile menu when clicking links
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }
}

/* ==========================================================================
   3. ANIMATED COUNTERS FOR STATS
   ========================================================================== */
function initStatsCounter() {
    const statCards = document.querySelectorAll('.stat-number');
    if (!statCards.length) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statCards.forEach(card => animateNumber(card));
            }
        });
    }, { threshold: 0.4 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);
}

function animateNumber(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (target - start) * easeOutExpo(progress);

        if (target >= 1000000) {
            element.textContent = `+${(current / 1000000).toFixed(1)}M`;
        } else if (target % 1 !== 0) {
            element.textContent = `${current.toFixed(1)}%`;
        } else if (target > 10000) {
            element.textContent = `R$ ${(current / 1000000).toFixed(0)}M`;
        } else {
            element.textContent = `+${Math.floor(current)}`;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

/* ==========================================================================
   4. INTERACTIVE ROI CALCULATOR
   ========================================================================== */
function initRoiCalculator() {
    const cropSelect = document.getElementById('cropSelect');
    const areaRange = document.getElementById('areaRange');
    const areaValue = document.getElementById('areaValue');
    const resEconomia = document.getElementById('resEconomia');
    const resProdutividade = document.getElementById('resProdutividade');

    if (!areaRange || !resEconomia || !resProdutividade) return;

    function updateCalculator() {
        const area = parseInt(areaRange.value, 10);
        const crop = cropSelect.value;

        areaValue.textContent = `${area.toLocaleString('pt-BR')} Hectares`;

        // Multipliers based on crop
        let economiaPorHa = 290; // R$/ha
        let ganhoTexto = '+3.5 Sacas/ha';

        if (crop === 'soja') {
            economiaPorHa = 310;
            ganhoTexto = `+${(3.2 + (area > 2000 ? 0.8 : 0)).toFixed(1)} Sacas/ha`;
        } else if (crop === 'milho') {
            economiaPorHa = 280;
            ganhoTexto = `+${(5.5 + (area > 2000 ? 1.2 : 0)).toFixed(1)} Sacas/ha`;
        } else if (crop === 'algodao') {
            economiaPorHa = 520;
            ganhoTexto = `+${(12.0).toFixed(1)} Arrobas/ha`;
        } else if (crop === 'pecuaria') {
            economiaPorHa = 190;
            ganhoTexto = `+${(0.4).toFixed(1)} @ / ha / ano`;
        }

        const totalEconomia = area * economiaPorHa;
        
        // Format Currency
        resEconomia.textContent = totalEconomia.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0
        });

        resProdutividade.textContent = ganhoTexto;
    }

    areaRange.addEventListener('input', updateCalculator);
    cropSelect.addEventListener('change', updateCalculator);
    
    // Initial call
    updateCalculator();
}

/* ==========================================================================
   5. PROPOSAL FORM & MODAL
   ========================================================================== */
function initProposalForm() {
    const proposalForm = document.getElementById('proposalForm');
    const successModal = document.getElementById('successModal');
    const btnCloseModal = document.getElementById('btnCloseModal');

    if (!proposalForm) return;

    proposalForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate basic fields
        const nome = document.getElementById('formNome').value.trim();
        const email = document.getElementById('formEmail').value.trim();
        const telefone = document.getElementById('formTelefone').value.trim();

        if (!nome || !email || !telefone) {
            alert('Por favor, preencha todos os campos obrigatórios (*).');
            return;
        }

        // Show Success Modal
        if (successModal) {
            successModal.classList.add('active');
        }

        // Reset Form
        proposalForm.reset();
    });

    if (btnCloseModal && successModal) {
        btnCloseModal.addEventListener('click', () => {
            successModal.classList.remove('active');
        });

        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }
}
