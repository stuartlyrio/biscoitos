document.querySelectorAll('.coluna').forEach(coluna => {
    
    const janela = coluna.querySelector('.janela-carrossel');
    const btnUp = coluna.querySelector('.up');
    const btnDown = coluna.querySelector('.down');
    
    // Altura do Card (250px) + Gap do CSS (15px) = 265px
    // Isso garante que ele pule exatamente 1 produto por vez
    const step = 265; 

    function moverScroll(direcao) {
        if (!janela) return;

        if (direcao === 'down') {
            janela.scrollTop += step;
        } else {
            janela.scrollTop -= step;
        }
    }

    if(btnUp) btnUp.addEventListener('click', () => moverScroll('up'));
    if(btnDown) btnDown.addEventListener('click', () => moverScroll('down'));

    // Scroll com o Mouse (Rodinha)
    if(janela) {
        janela.addEventListener('wheel', (evento) => {
            evento.preventDefault(); 
            if (evento.deltaY > 0) {
                moverScroll('down');
            } else {
                moverScroll('up');
            }
        });
    }
});

// Função WhatsApp
function pedido(nomeProduto) {
    const telefone = "5521999999999"; 
    const mensagem = `Olá! Gostaria de reservar o produto: *${nomeProduto}*. Como faço para retirar?`;
    const link = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(link, '_blank');
}