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
            const estoqueBool = produto.estoque ? 'true' : 'false'; // Converte para string para passar no HTML
            
            // Define Status e Texto da Quantidade
            let statusClass = produto.estoque ? 'pronta-entrega' : 'encomenda';
            let statusTexto = produto.estoque ? 'Pronta Entrega' : 'Sob Encomenda';
            
            let htmlQtd = '';
            if (produto.estoque && qtd > 0) {
                htmlQtd = `<p class="estoque-qtd">${qtd} unid. disponíveis</p>`;
            } else {
                htmlQtd = `<p class="estoque-qtd" style="color:transparent;">.</p>`;
            }
            
            // ATENÇÃO: Agora passamos 'produto.estoque' (true/false) para a função adicionar
            const cardHTML = `
                <div class="card" onclick="window.adicionar('${produto.nome}', ${produto.preco}, '${produto.imagem}', ${estoqueBool})">
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

        if (btnUp) { btnUp.onclick = null; btnUp.onclick = () => mover('up'); }
        if (btnDown) { btnDown.onclick = null; btnDown.onclick = () => mover('down'); }
        
        janela.onwheel = (evento) => {
            evento.preventDefault();
            if (evento.deltaY > 0) mover('down');
            else mover('up');
        };
    });
}

// === 3. CARRINHO E COMPRA ===
function toggleCarrinho() {
    document.getElementById('carrinho-sidebar').classList.toggle('aberto');
    document.getElementById('overlay').classList.toggle('ativo');
}

// ATUALIZADO: Agora recebe se está em estoque ou não
function adicionar(nome, preco, imagem, emEstoque) {
    
    // Converte string 'true'/'false' de volta para boolean se necessário
    const isEstoque = (emEstoque === true || emEstoque === 'true');

    // === AVISO AO CLIENTE ===
    if (!isEstoque) {
        alert("⚠️ ATENÇÃO: Este item é SOB ENCOMENDA.\nEle será produzido especialmente para você e pode levar mais tempo.");
    }

    const itemExistente = carrinho.find(item => item.nome === nome);
    if (itemExistente) {
        itemExistente.quantidade += 1;
        animarBotao();
    } else {
        // Salva se é encomenda ou não dentro do item
        carrinho.push({ 
            nome, 
            preco, 
            imagem, 
            quantidade: 1, 
            tipo: isEstoque ? 'Pronta Entrega' : 'Encomenda' 
        });
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

            // Mostra uma etiqueta pequena no carrinho também
            const etiqueta = item.tipo === 'Encomenda' ? 
                '<span style="font-size:0.7rem; color:orange; font-weight:bold;">(Encomenda)</span>' : '';

            const div = document.createElement('div');
            div.className = 'item-carrinho';
            div.innerHTML = `
                <img src="${item.imagem}">
                <div class="item-info">
                    <div>${item.nome} ${etiqueta}</div>
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

// === LÓGICA DE SEPARAÇÃO NO WHATSAPP ===
function finalizarCompra() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    const telefone = "5521999999999"; 
    
    // Separa os itens
    const prontos = carrinho.filter(i => i.tipo === 'Pronta Entrega');
    const encomendas = carrinho.filter(i => i.tipo === 'Encomenda');
    
    let msg = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    let total = 0;

    // Bloco Pronta Entrega
    if (prontos.length > 0) {
        msg += "*📦 PRONTA ENTREGA:*\n";
        prontos.forEach(i => {
            let sub = i.preco * i.quantidade;
            total += sub;
            msg += `• ${i.quantidade}x ${i.nome} - R$ ${sub.toFixed(2).replace('.', ',')}\n`;
        });
        msg += "\n";
    }

    // Bloco Encomendas
    if (encomendas.length > 0) {
        msg += "*⏳ SOB ENCOMENDA:*\n";
        encomendas.forEach(i => {
            let sub = i.preco * i.quantidade;
            total += sub;
            msg += `• ${i.quantidade}x ${i.nome} - R$ ${sub.toFixed(2).replace('.', ',')}\n`;
        });
        msg += "\n";
    }

    msg += `*Total Geral: R$ ${total.toFixed(2).replace('.', ',')}*`;
    msg += "\n\nComo faço para retirar/pagar?";
    
    window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// EXPÕE FUNÇÕES
window.adicionar = adicionar;
window.toggleCarrinho = toggleCarrinho;
window.alterarQtd = alterarQtd;
window.finalizarCompra = finalizarCompra;

// INÍCIO
carregarProdutos();