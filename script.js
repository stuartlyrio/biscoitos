import { db, collection, getDocs } from './firebase-config.js';

// === VARIÁVEIS GLOBAIS ===
let carrinho = [];
const step = 225; // Altura Card (210) + Gap (15)

// === 1. CARREGAR PRODUTOS ===
async function carregarProdutos() {
    const listaBiscoitos = document.getElementById('lista-biscoitos');
    const listaCompotas = document.getElementById('lista-compotas');

    if(listaBiscoitos) listaBiscoitos.innerHTML = '';
    if(listaCompotas) listaCompotas.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        
        querySnapshot.forEach((doc) => {
            const produto = doc.data();
            const qtd = produto.quantidade || 0;
            
            // Define Status e Texto da Quantidade
            let statusClass = produto.estoque ? 'pronta-entrega' : 'encomenda';
            let statusTexto = produto.estoque ? 'Pronta Entrega' : 'Sob Encomenda';
            
            // Se for Pronta Entrega, mostra quantas unidades tem
            let htmlQtd = '';
            if (produto.estoque && qtd > 0) {
                htmlQtd = `<p class="estoque-qtd">${qtd} unid. disponíveis</p>`;
            } else {
                htmlQtd = `<p class="estoque-qtd" style="color:transparent;">.</p>`; // Mantém o espaço para não desalinha
            }
            
            const cardHTML = `
                <div class="card" onclick="window.adicionar('${produto.nome}', ${produto.preco}, '${produto.imagem}')">
                    <span class="status ${statusClass}">${statusTexto}</span>
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <div class="info-card">
                        <p class="nome">${produto.nome}</p>
                        ${htmlQtd}
                        <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>
            `;

            if (produto.categoria === 'biscoitos' && listaBiscoitos) {
                listaBiscoitos.innerHTML += cardHTML;
            } else if (produto.categoria === 'compotas' && listaCompotas) {
                listaCompotas.innerHTML += cardHTML;
            }
        });

        configurarScroll();

    } catch (error) {
        console.error("Erro ao carregar:", error);
    }
}

// === 2. CONFIGURAR SCROLL ===
function configurarScroll() {
    const colunas = document.querySelectorAll('.coluna');
    colunas.forEach(coluna => {
        const janela = coluna.querySelector('.janela-carrossel');
        const btnUp = coluna.querySelector('.up');
        const btnDown = coluna.querySelector('.down');

        if (!janela) return;

        const mover = (direcao) => {
            if (direcao === 'down') janela.scrollTop += step;
            else janela.scrollTop -= step;
        };

        if (btnUp) btnUp.onclick = () => mover('up');
        if (btnDown) btnDown.onclick = () => mover('down');
        
        janela.onwheel = (evento) => {
            evento.preventDefault();
            if (evento.deltaY > 0) mover('down');
            else mover('up');
        };
    });
}

// === 3. CARRINHO ===
function toggleCarrinho() {
    document.getElementById('carrinho-sidebar').classList.toggle('aberto');
    document.getElementById('overlay').classList.toggle('ativo');
}

function adicionar(nome, preco, imagem) {
    const itemExistente = carrinho.find(item => item.nome === nome);
    if (itemExistente) {
        itemExistente.quantidade += 1;
        animarBotao();
    } else {
        carrinho.push({ nome, preco, imagem, quantidade: 1 });
        toggleCarrinho(); 
    }
    atualizarCarrinhoVisual();
}

function animarBotao() {
    const btn = document.querySelector('.btn-carrinho-flutuante');
    if(btn) {
        btn.style.transform = "scale(1.2)";
        setTimeout(() => btn.style.transform = "scale(1)", 200);
    }
}

function alterarQtd(nome, acao) {
    const item = carrinho.find(item => item.nome === nome);
    if (!item) return;

    if (acao === 'aumentar') item.quantidade += 1;
    if (acao === 'diminuir') item.quantidade -= 1;
    
    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(i => i.nome !== nome);
    }
    atualizarCarrinhoVisual();
}

function atualizarCarrinhoVisual() {
    const lista = document.getElementById('lista-carrinho');
    const contador = document.getElementById('contador-carrinho');
    const totalEl = document.getElementById('preco-total');
    
    if(!lista) return;

    lista.innerHTML = ''; 
    let total = 0;
    let qtd = 0;

    if (carrinho.length === 0) {
        lista.innerHTML = '<p class="carrinho-vazio">Vazio 😢</p>';
    } else {
        carrinho.forEach(item => {
            total += item.preco * item.quantidade;
            qtd += item.quantidade;

            const div = document.createElement('div');
            div.className = 'item-carrinho';
            div.innerHTML = `
                <img src="${item.imagem}">
                <div class="item-info">
                    <div>${item.nome}</div>
                    <div style="color:#666">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="item-controles">
                    <button class="btn-qtd" onclick="window.alterarQtd('${item.nome}', 'diminuir')">-</button>
                    <span>${item.quantidade}</span>
                    <button class="btn-qtd" onclick="window.alterarQtd('${item.nome}', 'aumentar')">+</button>
                </div>
            `;
            lista.appendChild(div);
        });
    }

    if(contador) contador.innerText = qtd;
    if(totalEl) totalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function finalizarCompra() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    const telefone = "5521999999999"; 
    let msg = "Olá! Pedido:\n\n";
    let total = 0;
    carrinho.forEach(i => {
        let sub = i.preco * i.quantidade;
        total += sub;
        msg += `• ${i.quantidade}x ${i.nome}\n`;
    });
    msg += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;
    window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// EXPÕE FUNÇÕES
window.adicionar = adicionar;
window.toggleCarrinho = toggleCarrinho;
window.alterarQtd = alterarQtd;
window.finalizarCompra = finalizarCompra;

// INÍCIO
carregarProdutos();