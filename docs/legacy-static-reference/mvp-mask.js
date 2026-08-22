/* ==========================================================================
   RAIZ AGRO HUB - MÁSCARA DE TELEFONE
   Formata o campo de telefone/WhatsApp enquanto o usuário digita, no
   padrão brasileiro: (XX) XXXXX-XXXX (celular) ou (XX) XXXX-XXXX (fixo).
   ========================================================================== */

function mvpFormatarTelefone(valorBruto) {
    var digitos = valorBruto.replace(/\D/g, '').slice(0, 11);

    if (digitos.length === 0) return '';
    if (digitos.length <= 2) return '(' + digitos;

    var ddd = digitos.slice(0, 2);
    var resto = digitos.slice(2);

    if (resto.length <= 4) {
        return '(' + ddd + ') ' + resto;
    }
    if (digitos.length <= 10) {
        // Telefone fixo: (XX) XXXX-XXXX
        return '(' + ddd + ') ' + resto.slice(0, 4) + '-' + resto.slice(4);
    }
    // Celular: (XX) XXXXX-XXXX
    return '(' + ddd + ') ' + resto.slice(0, 5) + '-' + resto.slice(5);
}

/**
 * Aplica a máscara de telefone em tempo real a um <input>, preservando
 * a posição do cursor ao digitar no meio do texto.
 */
function mvpAplicarMascaraTelefone(input) {
    if (!input) return;

    input.addEventListener('input', function () {
        var posicaoAntes = input.selectionStart;
        var tamanhoAntes = input.value.length;

        input.value = mvpFormatarTelefone(input.value);

        var novoTamanho = input.value.length;
        var novaPosicao = posicaoAntes + (novoTamanho - tamanhoAntes);
        input.setSelectionRange(novaPosicao, novaPosicao);
    });

    input.setAttribute('maxlength', '15');
    input.setAttribute('inputmode', 'tel');
}
