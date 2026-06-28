let produtos = [];
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
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
    lista.innerHTML += `
      <div class="produto">
        <img src="${img[0]}" onclick="abrirModal(${index})">
        <h3>${p.nome}</h3>
        <p>${p.preco}</p>
        <button onclick="abrirModal(${index})">Comprar</button>
        <button onclick="adicionarAoCarrinho(${index})">Adicionar</button>
      </div>
    `;
  });
}

/* ================= MODAL DE SELEÇÃO ================= */
function abrirModal(index) {
  produtoSelecionado = produtos[index];
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-nome").innerText = produtoSelecionado.nome;
  
  const imagens = produtoSelecionado.imagens || [produtoSelecionado.imagem];
  const cores = produtoSelecionado.cores
    ? produtoSelecionado.cores.split(",").map(c => c.trim())
    : ["Única"];
  const tamanhos = produtoSelecionado.tamanhos
    ? produtoSelecionado.tamanhos.split(",").map(t => t.trim())
    : ["Único"];

  document.getElementById("modal-imagens").innerHTML = `
    <img id="img-principal" src="${imagens[0]}">
    
    <label>Cor</label>
    <select id="cor">
      ${cores.map(c => `<option value="${c}">${c}</option>`).join("")}
    </select>
    
    <label>Tamanho</label>
    <select id="tamanho">
      ${tamanhos.map(t => `<option value="${t}">${t}</option>`).join("")}
    </select>
    
    <button onclick="adicionarDoModal()">Adicionar ao carrinho</button>
    <button onclick="fecharModal()" class="modal-btn-fechar-baixo">Fechar</button>
    
    <div class="miniaturas-container">
      ${imagens.map(img => `
        <img src="${img}" onclick="trocarImagem('${img}')">
      `).join("")}
    </div>
  `;
}

function trocarImagem(src) {
  const imgPrincipal = document.getElementById("img-principal");
  if (imgPrincipal) imgPrincipal.src = src;
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

function calcularFrete() {
  frete = 10.00;
}

function atualizarCarrinho() {
  const box = document.getElementById("itens-carrinho");
  if (!box) return;
  box.innerHTML = "";
  let subtotal = 0;
  
  carrinho.forEach((item, i) => {
    subtotal += item.preco * item.quantidade;
    box.innerHTML += `
      <div class="item-carrinho">
        <b>${item.nome}</b><br>
        Cor: ${item.cor}<br>
        Tamanho: ${item.tamanho}<br>
        R$ ${item.preco.toFixed(2)}<br><br>
        <button onclick="diminuir(${i})">−</button>
        <strong>${item.quantidade}</strong>
        <button onclick="aumentar(${i})">+</button>
        <button onclick="remover(${i})">🗑️</button>
      </div>
    `;
  });
  
  calcularFrete();
  const totalFinal = subtotal + frete;
  
  const totalElem = document.getElementById("total");
  if (totalElem) {
    totalElem.innerHTML = `
      <b>Subtotal:</b> R$ ${subtotal.toFixed(2)}<br>
      <b>Frete:</b> R$ ${frete.toFixed(2)}<br>
      <b>Total:</b> R$ ${totalFinal.toFixed(2)}
    `;
  }
  
  const contadorElem = document.getElementById("contador");
  if (contadorElem) contadorElem.innerText = carrinho.length;
  
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function enviarCarrinhoWhatsApp() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }
  let subtotal = 0;
  let msg = "🛍️ *PEDIDO BELLA FLOR*%0A%0A";
  carrinho.forEach(item => {
    subtotal += item.preco * item.quantidade;
    msg += `• ${item.nome}%0A`;
    msg += `Cor: ${item.cor}%0A`;
    msg += `Tamanho: ${item.tamanho}%0A`;
    msg += `Quantidade: ${item.quantidade}%0A`;
    msg += `Valor: R$ ${(item.preco * item.quantidade).toFixed(2)}%0A%0A`;
  });
  calcularFrete();
  const totalFinal = subtotal + frete;
  msg += `🚚 Frete: R$ ${frete.toFixed(2)}%0A`;
  msg += `💰 Total: R$ ${totalFinal.toFixed(2)}`;
  window.open(`https://wa.me/5591985144347?text=${msg}`, "_blank");
}

function buscarProdutos(){
  const texto = document.getElementById("buscar").value.toLowerCase();
  const cards = document.querySelectorAll(".produto");
  cards.forEach(card=>{
    const nome = card.querySelector("h3").innerText.toLowerCase();
    if(nome.includes(texto)){
      card.style.display="flex";
    }else{
      card.style.display="none";
    }
  });
}

function filtrarCategoria(categoria){
    if(categoria==="Todos"){
        renderizarProdutos();
        return;
    }
    lista.innerHTML="";
    produtos
    .filter(p=>p.categoria===categoria)
    .forEach((p,index)=>{
        let img=p.imagens || [p.imagem];
        lista.innerHTML+=`
        <div class="produto">
            <img src="${img[0]}" onclick="abrirModal(${produtos.indexOf(p)})">
            <h3>${p.nome}</h3>
            <p>${p.preco}</p>
            <button onclick="abrirModal(${produtos.indexOf(p)})">Comprar</button>
        </div>
        `;
    });
}
