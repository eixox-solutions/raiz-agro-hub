# 🌱 Raiz Agro Hub - Landing Page & Hub de Inteligência Agrícola

Plataforma integrada de inteligência agrícola, monitoramento IoT, gestão de safras e cotações de mercado em tempo real desenvolvida para elevar o patamar tecnológico e a rentabilidade do produtor rural brasileiro.

![Raiz Agro Hub Banner](assets/images/hero.jpg)

---

## ⚡ Recursos Principais da Landing Page

- **Hero Interactive Section:** Apresentação visual de alto impacto com badges flutuantes de produtividade e redução de insumos.
- **Painel de Cotações em Tempo Real:** Atualização dinâmica de commodities (Soja, Milho, Boi Gordo, Café Arábica, Dólar PTAX) com variação percentual simulada ao vivo.
- **Calculadora Interativa de ROI:** Simulador de economia financeira e ganho de produtividade ajustável por número de hectares e tipo de cultura agrícola.
- **Formulário Inteligente de Proposta:** Validação em tempo real e confirmação interativa em modal.
- **Métricas de Impacto:** Contadores numéricos animados ativados no scroll.
- **Design System Agro-Tech:** Estética *deep dark* moderna com acentos verdes vibrantes, efeito glassmorphism e responsividade total (Desktop, Tablet e Mobile).

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico & SEO Optmized:** Estruturação semântica, OpenGraph meta tags para compartilhamento em redes sociais.
- **Vanilla CSS3 Moderno:** Utilização de CSS Variables, Flexbox, CSS Grid, Glassmorphism e Keyframe Animations sem dependência de frameworks externos de CSS.
- **JavaScript (ES6+):** Manipulação dinâmica do DOM, simulação do mercado financeiro agrícola, cálculos matemáticos de ROI e animações via `IntersectionObserver`.
- **Google Fonts:** `Outfit` & `Plus Jakarta Sans`.
- **FontAwesome 6:** Ícones vetoriais em alta resolução.

---

## 🚀 Como Executar Localmente

Como a aplicação é construída com tecnologias web puras, não é necessária a instalação de dependências pesadas.

### Opção 1: Servidor HTTP Simples (Python)
```bash
python3 -m http.server 8000
```
Acesse [http://localhost:8000](http://localhost:8000) no seu navegador.

### Opção 2: Servidor Node (`serve` ou Live Server)
```bash
npx serve .
```

---

## 📦 Estrutura de Arquivos

```
raiz-agro-hub/
├── index.html            # Estrutura principal da landing page
├── styles.css            # Design system, temas, layouts e animações
├── app.js                # Lógica interativa, calculadora ROI e cotações
├── README.md             # Documentação do projeto
├── .gitignore            # Regras para versionamento
└── assets/
    └── images/
        └── hero.jpg      # Imagem visual do dashboard e ecossistema no campo
```

---

## 📜 Licença

Desenvolvido para **Raiz Agro Hub**. Todos os direitos reservados.
