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
/* ================= MODAL ================= */
function abrirModal(index) {
  produtoSelecionado = produtos[index];
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-nome").innerText = produtoSelecionado.nome;
  const imagens = produtoSelecionado.imagens || [produtoSelecionado.imagem];
  const cores = produtoSelecionado.cores
    ? produtoSelecionado.cores.split(",").map(c => c.trim())
    : ["Ãnica"];
  const tamanhos = produtoSelecionado.tamanhos
    ? produtoSelecionado.tamanhos.split(",").map(t => t.trim())
    : ["Ãnico"];
  document.getElementById("modal-imagens").innerHTML = `
    <img id="img-principal"
         src="${imagens[0]}"
         style="width:100%; border-radius:10px;">
    <label>Cor</label>
    <select id="cor">
      ${cores.map(c => `<option value="${c}">${c}</option>`).join("")}
    </select>
    <label>Tamanho</label>
    <select id="tamanho">
      ${tamanhos.map(t => `<option value="${t}">${t}</option>`).join("")}
    </select>
    <button onclick="adicionarDoModal()">
      Adicionar ao carrinho
    </button>
    <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
      ${imagens.map(img => `
        <img src="${img}"
             onclick="trocarImagem('${img}')"
             style="width:60px;height:60px;object-fit:cover;cursor:pointer;border-radius:8px;">
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
    cor: p.cores ? p.cores.split(",")[0].trim() : "Ãnica",
    tamanho: p.tamanhos ? p.tamanhos.split(",")[0].trim() : "Ãnico"
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
/* ================= CONTROLES ================= */
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
/* ================= CARRINHO ================= */
function abrirCarrinho() {
  document.getElementById("carrinho-lateral").classList.add("ativo");
}
function fecharCarrinho() {
  document.getElementById("carrinho-lateral").classList.remove("ativo");
}
/* ================= FRETE ================= */
function calcularFrete() {
  frete = 10.00;
}
/* ================= ATUALIZAR ================= */
function atualizarCarrinho() {
  const box = document.getElementById("itens-carrinho");
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
        <button onclick="diminuir(${i})">â</button>
        <strong>${item.quantidade}</strong>
        <button onclick="aumentar(${i})">+</button>
        <button onclick="remover(${i})">ðï¸</button>
      </div>
    `;
  });
  calcularFrete();
  const totalFinal = subtotal + frete;
  document.getElementById("total").innerHTML = `
    <b>Subtotal:</b> R$ ${subtotal.toFixed(2)}<br>
    <b>Frete:</b> R$ ${frete.toFixed(2)}<br>
    <b>Total:</b> R$ ${totalFinal.toFixed(2)}
  `;
  document.getElementById("contador").innerText = carrinho.length;
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}
/* ================= WHATSAPP ================= */
function enviarCarrinhoWhatsApp() {
  if (carrinho.length === 0) {
    alert("Seu carrinho estÃ¡ vazio.");
    return;
  }
  let subtotal = 0;
  let msg = "ð *PEDIDO BELLA FLOR*%0A%0A";
  carrinho.forEach(item => {
    subtotal += item.preco * item.quantidade;
    msg += `â¢ ${item.nome}%0A`;
    msg += `Cor: ${item.cor}%0A`;
    msg += `Tamanho: ${item.tamanho}%0A`;
    msg += `Quantidade: ${item.quantidade}%0A`;
    msg += `Valor: R$ ${(item.preco * item.quantidade).toFixed(2)}%0A%0A`;
  });
  calcularFrete();
  const totalFinal = subtotal + frete;
  msg += `ð Frete: R$ ${frete.toFixed(2)}%0A`;
  msg += `ð° Total: R$ ${totalFinal.toFixed(2)}`;
  window.open(
    `https://wa.me/5591985144347?text=${msg}`,
    "_blank"
  );
}
atualizarCarrinho();
function buscarProdutos(){

  const texto = document
    .getElementById("buscar")
    .value
    .toLowerCase();

  const cards = document.querySelectorAll(".produto");

  cards.forEach(card=>{

    const nome = card.querySelector("h3")
      .innerText
      .toLowerCase();

    if(nome.includes(texto)){
      card.style.display="block";
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

            <button onclick="abrirModal(${produtos.indexOf(p)})">
            Comprar
            </button>

        </div>

        `;

    });

}
