// === CARROSSEL ===
document.querySelectorAll('.coluna').forEach(coluna => {
    const janela = coluna.querySelector('.janela-carrossel');
    const btnUp = coluna.querySelector('.up');
    const btnDown = coluna.querySelector('.down');
    
    // Altura Card (250) + Gap (15) = 265
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

    if(janela) {
        janela.addEventListener('wheel', (evento) => {
            evento.preventDefault(); 
            if (evento.deltaY > 0) moverScroll('down');
            else moverScroll('up');
        });
    }
});

// === CARRINHO ===
let carrinho = [];

function toggleCarrinho() {
    const sidebar = document.getElementById('carrinho-sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('aberto');
    overlay.classList.toggle('ativo');
}

function adicionar(nome, preco, imagem) {
    const itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
        itemExistente.quantidade += 1;
        alert(`+1 unidade de "${nome}" adicionada!`);
    } else {
        carrinho.push({
            nome: nome,
            preco: preco,
            imagem: imagem,
            quantidade: 1
        });
        toggleCarrinho(); 
    }
    atualizarCarrinhoVisual();
}

function alterarQtd(nome, acao) {
    const item = carrinho.find(item => item.nome === nome);
    if (!item) return;

    if (acao === 'aumentar') {
        item.quantidade += 1;
    } else if (acao === 'diminuir') {
        item.quantidade -= 1;
        if (item.quantidade <= 0) {
            carrinho = carrinho.filter(i => i.nome !== nome);
        }
    }
    atualizarCarrinhoVisual();
}

function atualizarCarrinhoVisual() {
    const lista = document.getElementById('lista-carrinho');
    const contador = document.getElementById('contador-carrinho');
    const precoTotalEl = document.getElementById('preco-total');
    
    lista.innerHTML = ''; 
    
    let total = 0;
    let qtdItens = 0;

    if (carrinho.length === 0) {
        lista.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio 😢</p>';
    } else {
        carrinho.forEach(item => {
            total += item.preco * item.quantidade;
            qtdItens += item.quantidade;

            const div = document.createElement('div');
            div.classList.add('item-carrinho');
            div.innerHTML = `
                <img src="${item.imagem}" alt="${item.nome}">
                <div class="item-info">
                    <span class="item-nome">${item.nome}</span>
                    <span class="item-preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="item-controles">
                    <button class="btn-qtd" onclick="alterarQtd('${item.nome}', 'diminuir')">-</button>
                    <span>${item.quantidade}</span>
                    <button class="btn-qtd" onclick="alterarQtd('${item.nome}', 'aumentar')">+</button>
                </div>
            `;
            lista.appendChild(div);
        });
    }

    contador.innerText = qtdItens;
    precoTotalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function finalizarCompra() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const telefone = "5521999999999"; // SEU NÚMERO AQUI
    let mensagem = "Olá! Gostaria de fazer o seguinte pedido:\n\n";

    let total = 0;
    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        mensagem += `• ${item.quantidade}x ${item.nome} - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    });

    mensagem += `\n*Total Geral: R$ ${total.toFixed(2).replace('.', ',')}*`;
    mensagem += "\n\nComo faço para retirar/pagar?";

    const link = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(link, '_blank');
}