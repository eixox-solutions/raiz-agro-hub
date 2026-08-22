/* ==========================================================================
   RAIZ AGRO HUB - MOTOR DE MATCH (REGRAS)
   Função pura de cálculo de aderência entre produtor e empresa.
   Ver docs/superpowers/specs/2026-08-22-mvp-matchmaking-design.md
   ========================================================================== */

/**
 * Calcula a aderência (0-100) entre um produtor e uma empresa, com base em:
 * categoria (peso 60), região (peso 25), porte (peso 15).
 * @returns {{score: number, faixa: 'baixa'|'media'|'alta'}}
 */
function mvpCalcularAderencia(produtor, empresa) {
    let score = 0;

    if (produtor.categoriaDesafio === empresa.categoriaSolucao) {
        score += 60;
    }

    if (empresa.regioesAtendidas === 'nacional') {
        score += 25;
    } else if (empresa.regioesAtendidas === 'estado' && empresa.uf === produtor.uf) {
        score += 25;
    }

    const indiceProdutor = MVP_PORTES.indexOf(produtor.porte);
    const indiceEmpresa = MVP_PORTES.indexOf(empresa.porteAlvo);
    if (indiceProdutor !== -1 && indiceEmpresa !== -1) {
        const distancia = Math.abs(indiceProdutor - indiceEmpresa);
        if (distancia === 0) {
            score += 15;
        } else if (distancia === 1) {
            score += 8;
        }
    }

    let faixa = 'baixa';
    if (score > 70) faixa = 'alta';
    else if (score > 40) faixa = 'media';

    return { score, faixa };
}

/**
 * Rankeia todas as empresas cadastradas pela aderência a um produtor,
 * do maior para o menor score.
 * @returns {Array<{empresa: object, score: number, faixa: string}>}
 */
function mvpRankearEmpresasParaProdutor(produtor, empresas) {
    return empresas
        .map(empresa => {
            const { score, faixa } = mvpCalcularAderencia(produtor, empresa);
            return { empresa, score, faixa };
        })
        .sort((a, b) => b.score - a.score);
}

/**
 * Rankeia todos os produtores cadastrados pela aderência a uma empresa,
 * do maior para o menor score.
 * @returns {Array<{produtor: object, score: number, faixa: string}>}
 */
function mvpRankearProdutoresParaEmpresa(empresa, produtores) {
    return produtores
        .map(produtor => {
            const { score, faixa } = mvpCalcularAderencia(produtor, empresa);
            return { produtor, score, faixa };
        })
        .sort((a, b) => b.score - a.score);
}
