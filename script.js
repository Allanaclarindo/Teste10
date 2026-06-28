let produtos = [];
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let produtoSelecionado = null;
let frete = 0;
const lista = document.getElementById("lista-produtos");

/* ================= PRODUTOS ================= */
fetch("produtos.json")
  .then(res => res.json())
  .then(data => {
    produtos = data;
    renderizarProdutos();
    atualizarCarrinho();
  });

function renderizarProdutos() {
  if (!lista) return;
  lista.innerHTML = "";
  produtos.forEach((p, index) => {
    const img = p.imagens || [p.imagem];
    const estaFavoritado = favoritos.includes(p.nome) ? "favoritado" : "";
    const iconeCoracao = favoritos.includes(p.nome) ? "fa-solid fa-heart" : "fa-regular fa-heart";

    lista.innerHTML += `
      <div class="produto">
        <button class="btn-favorito ${estaFavoritado}" onclick="toggleFavorito('${p.nome}', this, event)">
          <i class="${iconeCoracao}"></i>
        </button>
        <img src="${img[0]}" onclick="abrirModal(${index})">
        <h3>${p.nome}</h3>
        <p>${p.preco}</p>
        <button onclick="abrirModal(${index})">Comprar</button>
        <button onclick="adicionarAoCarrinho(${index})">Adicionar</button>
      </div>
    `;
  });
}

/* ================= GERENCIADOR UNIFICADO DE FAVORITOS ================= */
function toggleFavorito(nomeProduto, elemento, event) {
  if(event) event.stopPropagation(); // Evita abrir o modal se clicar no coração do catálogo
  
  const indice = favoritos.indexOf(nomeProduto);
  const icones = document.querySelectorAll(`[data-produto="${nomeProduto}"] i, button[onclick*="'${nomeProduto}'"] i`);
  const botoes = document.querySelectorAll(`[data-produto="${nomeProduto}"], button[onclick*="'${nomeProduto}'"]`);
  
  let virouFavorito = false;

  if (indice === -1) {
    favoritos.push(nomeProduto);
    virouFavorito = true;
  } else {
    favoritos.splice(indice, 1);
  }

  // Sincroniza visualmente todos os botões desse produto (No catálogo e no Modal ao mesmo tempo!)
  botoes.forEach(btn => {
    if(virouFavorito) btn.classList.add("favoritado");
    else btn.classList.remove("favoritado");
  });

  icones.forEach(i => {
    i.className = virouFavorito ? "fa-solid fa-heart" : "fa-regular fa-heart";
  });
  
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

/* ================= MODAL COM CORAÇÃO FLUTUANTE ================= */
function abrirModal(index) {
  produtoSelecionado = produtos[index];
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-nome").innerText = produtoSelecionado.nome;
  
  const imagens = produtoSelecionado.imagens || [produtoSelecionado.imagem];
  const cores = produtoSelecionado.cores ? produtoSelecionado.cores.split(",").map(c => c.trim()) : ["Única"];
  const tamanhos = produtoSelecionado.tamanhos ? produtoSelecionado.tamanhos.split(",").map(t => t.trim()) : ["Único"];

  // Verifica o estado atual de favoritos para renderizar o coração correto sobre a foto do modal
  const estaFavoritado = favoritos.includes(produtoSelecionado.nome) ? "favoritado" : "";
  const iconeCoracao = favoritos.includes(produtoSelecionado.nome) ? "fa-solid fa-heart" : "fa-regular fa-heart";

  document.getElementById("modal-imagens").innerHTML = `
    <button class="btn-favorito ${estaFavoritado}" data-produto="${produtoSelecionado.nome}" onclick="toggleFavorito('${produtoSelecionado.nome}', this, event)">
      <i class="${iconeCoracao}"></i>
    </button>
    
    <img id="img-principal" src="${imagens[0]}" style="width:100%; height:320px; object-fit:cover; border-radius:12px;">
    
    <label>Cor</label>
    <select id="cor">
      ${cores.map(c => `<option value="${c}">${c}</option>`).join("")}
    </select>
    
    <label>Tamanho</label>
    <select id="tamanho">
      ${tamanhos.map(t => `<option value="${t}">${t}</option>`).join("")}
    </select>
    
    <button onclick="adicionarDoModal()">Adicionar ao carrinho</button>
    
    <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
      ${imagens.map(img => `
        <img src="${img}" onclick="trocarImagem('${img}')" style="width:60px; height:60px; object-fit:cover; cursor:pointer; border-radius:8px; border: 1px solid #ddd;">
      `).join("")}
    </div>
  `;
}

function trocarImagem(src) {
  document.getElementById("img-principal").src = src;
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

/* ================= CARRINHO ================= */
function adicionarAoCarrinho(index) {
  const p = produtos[index];
  carrinho.push({
    nome: p.nome,
    preco: p.valor,
    quantidade: 1,
    cor: p.cores ? p.cores.split(",")[0].trim() : "Única",
    tamanho: p.tamanhos ? p.tamanhos.split(",")[0].trim() : "Único"
  });
  atualizarCarrinho();
}

function adicionarDoModal() {
  const cor = document.getElementById("cor").value;
  const tamanho = document.getElementById("tamanho").value;
  carrinho.push({
    nome: produtoSelecionado.nome,
    preco: produtoSelecionado.valor,
    quantidade: 1,
    cor: cor,
    tamanho: tamanho
  });
  atualizarCarrinho();
  fecharModal();
}

function aumentar(i) {
  carrinho[i].quantidade++;
  atualizarCarrinho();
}

function diminuir(i) {
  if (carrinho[i].quantidade > 1) {
    carrinho[i].quantidade--;
  } else {
    carrinho.splice(i, 1);
  }
  atualizarCarrinho();
}

function remover(i) {
  carrinho.splice(i, 1);
  atualizarCarrinho();
}

function abrirCarrinho() {
  document.getElementById("carrinho-lateral").classList.add("ativo");
}

function fecharCarrinho() {
  document.getElementById("carrinho-lateral").classList.remove("ativo");
}

function atualizarCarrinho() {
  const box = document.getElementById("itens-carrinho");
  if(!box) return;
  box.innerHTML = "";
  let subtotal = 0;
  
  carrinho.forEach((item, i) => {
    subtotal += item.preco * item.quantidade;
    box.innerHTML += `
      <div class="item-carrinho">
        <b>${item.nome}</b><br>
        Cor: ${item.cor} | Tamanho: ${item.tamanho}<br>
        R$ ${item.preco.toFixed(2)}<br>
        <button onclick="diminuir(${i})">-</button>
        <strong>${item.quantidade}</strong>
        <button onclick="aumentar(${i})">+</button>
        <button onclick="remover(${i})">🗑️</button>
      </div>
    `;
  });
  
  frete = carrinho.length > 0 ? 10.00 : 0;
  const totalFinal = subtotal + frete;
  document.getElementById("total").innerHTML = `
    <b>Subtotal:</b> R$ ${subtotal.toFixed(2)}<br>
    <b>Frete:</b> R$ ${frete.toFixed(2)}<br>
    <b>Total:</b> R$ ${totalFinal.toFixed(2)}
  `;
  document.getElementById("contador").innerText = carrinho.length;
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function enviarCarrinhoWhatsApp() {
  if (carrinho.length === 0) return alert("Seu carrinho está vazio.");
  let subtotal = 0;
  let msg = "🛍️ *PEDIDO BELLA FLOR*%0A%0A";
  carrinho.forEach(item => {
    subtotal += item.preco * item.quantidade;
    msg += `• ${item.nome}%0ACon: ${item.cor} | Tam: ${item.tamanho}%0AQtd: ${item.quantidade}%0A%0A`;
  });
  msg += `💰 *Total:* R$ ${(subtotal + frete).toFixed(2)}`;
  window.open(`https://wa.me/5591985144347?text=${msg}`, "_blank");
}

function buscarProdutos(){
  const texto = document.getElementById("buscar").value.toLowerCase();
  const cards = document.querySelectorAll(".produto");
  cards.forEach(card => {
    const nome = card.querySelector("h3").innerText.toLowerCase();
    card.style.display = nome.includes(texto) ? "block" : "none";
  });
}

function filtrarCategoria(categoria){
  if(categoria === "Todos") {
    renderizarProdutos();
    return;
  }
  lista.innerHTML = "";
  produtos.filter(p => p.categoria === categoria).forEach(p => {
    const img = p.imagens || [p.imagem];
    const estaFavoritado = favoritos.includes(p.nome) ? "favoritado" : "";
    const iconeCoracao = favoritos.includes(p.nome) ? "fa-solid fa-heart" : "fa-regular fa-heart";

    lista.innerHTML += `
      <div class="produto">
        <button class="btn-favorito ${estaFavoritado}" onclick="toggleFavorito('${p.nome}', this, event)">
          <i class="${iconeCoracao}"></i>
        </button>
        <img src="${img[0]}" onclick="abrirModal(${produtos.indexOf(p)})">
        <h3>${p.nome}</h3>
        <p>${p.preco}</p>
        <button onclick="abrirModal(${produtos.indexOf(p)})">Comprar</button>
      </div>
    `;
  });
}
