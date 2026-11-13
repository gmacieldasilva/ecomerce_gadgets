// Manipulação do DOM: renderização, busca e filtros do catálogo.
const lista = document.getElementById("lista-produtos");
const campoBusca = document.getElementById("busca");
const areaFiltros = document.getElementById("filtros");
const resultado = document.getElementById("resultado");
const aviso = document.getElementById("aviso");

let categoriaAtiva = "Todos";
let termoBusca = "";
let temporizadorAviso;

const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

function criarFiltros() {
  ["Todos", ...CATEGORIAS].forEach((cat) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "filtro";
    botao.textContent = cat;
    botao.setAttribute("aria-pressed", String(cat === categoriaAtiva));
    botao.addEventListener("click", () => {
      categoriaAtiva = cat;
      areaFiltros.querySelectorAll(".filtro").forEach((b) =>
        b.setAttribute("aria-pressed", String(b === botao)));
      renderizarProdutos();
    });
    areaFiltros.appendChild(botao);
  });
}

function criarCard(p) {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <div class="card-img"><img src="${p.imagem}" alt="Ilustração do produto ${p.nome}" loading="lazy"></div>
    <div class="card-corpo">
      <span class="card-cat">${p.categoria}</span>
      <h3>${p.nome}</h3>
      <p class="card-desc">${p.descricao}</p>
      <div class="card-rodape">
        <span class="preco">${formatarPreco(p.preco)}</span>
        <button type="button" class="botao">Adicionar ao carrinho</button>
      </div>
    </div>`;
  card.querySelector("button").addEventListener("click", () => {
    Carrinho.adicionar(p.id);
    mostrarAviso(`${p.nome} foi adicionado ao carrinho.`);
  });
  return card;
}

function renderizarProdutos() {
  const filtrados = PRODUTOS.filter((p) =>
    (categoriaAtiva === "Todos" || p.categoria === categoriaAtiva) &&
    normalizar(p.nome).includes(normalizar(termoBusca)));

  lista.innerHTML = "";
  if (filtrados.length === 0) {
    lista.innerHTML = '<p class="vazio">Nenhum produto encontrado. Tente outro nome ou escolha outra categoria.</p>';
  } else {
    filtrados.forEach((p) => lista.appendChild(criarCard(p)));
  }
  resultado.textContent = `${filtrados.length} ${filtrados.length === 1 ? "produto" : "produtos"}`;
}

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.add("visivel");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove("visivel"), 2200);
}

campoBusca.addEventListener("input", (e) => {
  termoBusca = e.target.value; // busca em tempo real
  renderizarProdutos();
});

criarFiltros();
renderizarProdutos();
