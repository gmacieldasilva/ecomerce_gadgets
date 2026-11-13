// Lógica do carrinho + localStorage. Usado em index.html e carrinho.html.
const CHAVE_CARRINHO = "nexora_carrinho";

const formatarPreco = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Carrinho = {
  // Formato salvo: [{ id, qtd }]
  ler() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE_CARRINHO));
      if (!Array.isArray(dados)) return [];
      return dados.filter((i) => PRODUTOS.some((p) => p.id === i.id) && i.qtd > 0);
    } catch (e) {
      return [];
    }
  },
  salvar(itens) {
    try { localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens)); } catch (e) { /* armazenamento indisponível */ }
    Carrinho.atualizarContador();
  },
  adicionar(id) {
    const itens = Carrinho.ler();
    const existente = itens.find((i) => i.id === id);
    if (existente) existente.qtd += 1; else itens.push({ id, qtd: 1 });
    Carrinho.salvar(itens);
  },
  alterarQtd(id, delta) {
    const itens = Carrinho.ler()
      .map((i) => (i.id === id ? { ...i, qtd: i.qtd + delta } : i))
      .filter((i) => i.qtd > 0);
    Carrinho.salvar(itens);
  },
  remover(id) {
    Carrinho.salvar(Carrinho.ler().filter((i) => i.id !== id));
  },
  limpar() { Carrinho.salvar([]); },
  quantidadeTotal() { return Carrinho.ler().reduce((soma, i) => soma + i.qtd, 0); },
  valorTotal() {
    return Carrinho.ler().reduce((soma, i) => {
      const produto = PRODUTOS.find((p) => p.id === i.id);
      return soma + produto.preco * i.qtd;
    }, 0);
  },
  atualizarContador() {
    const el = document.getElementById("contador-carrinho");
    if (el) el.textContent = Carrinho.quantidadeTotal();
  }
};

/* ---------- Página do carrinho ---------- */
function renderizarCarrinho() {
  const area = document.getElementById("itens-carrinho");
  if (!area) return; // não estamos em carrinho.html

  const itens = Carrinho.ler();
  const resumo = document.getElementById("resumo");
  area.innerHTML = "";

  if (itens.length === 0) {
    area.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio. <a href="index.html">Veja o catálogo</a> e adicione um gadget.</p>';
    resumo.hidden = true;
    document.getElementById("total-carrinho").textContent = formatarPreco(0);
    return;
  }

  itens.forEach((item) => {
    const p = PRODUTOS.find((x) => x.id === item.id);
    const div = document.createElement("article");
    div.className = "item";
    div.innerHTML = `
      <img src="${p.imagem}" alt="">
      <div>
        <h3>${p.nome}</h3>
        <p class="unit">${formatarPreco(p.preco)} cada</p>
      </div>
      <div class="item-acoes">
        <div class="qtd" role="group" aria-label="Quantidade de ${p.nome}">
          <button type="button" data-acao="menos" aria-label="Diminuir quantidade">−</button>
          <span>${item.qtd}</span>
          <button type="button" data-acao="mais" aria-label="Aumentar quantidade">+</button>
        </div>
        <span class="subtotal">${formatarPreco(p.preco * item.qtd)}</span>
        <button type="button" class="remover" data-acao="remover">Remover</button>
      </div>`;
    div.addEventListener("click", (e) => {
      const acao = e.target.dataset.acao;
      if (!acao) return;
      if (acao === "mais") Carrinho.alterarQtd(p.id, 1);
      if (acao === "menos") Carrinho.alterarQtd(p.id, -1);
      if (acao === "remover") Carrinho.remover(p.id);
      renderizarCarrinho();
    });
    area.appendChild(div);
  });

  document.getElementById("total-carrinho").textContent = formatarPreco(Carrinho.valorTotal());
  resumo.hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  Carrinho.atualizarContador();
  renderizarCarrinho();

  const limpar = document.getElementById("limpar");
  const finalizar = document.getElementById("finalizar");
  if (limpar) limpar.addEventListener("click", () => { Carrinho.limpar(); renderizarCarrinho(); });
  if (finalizar) finalizar.addEventListener("click", () => {
    const total = formatarPreco(Carrinho.valorTotal());
    const qtd = Carrinho.quantidadeTotal();
    Carrinho.limpar();
    renderizarCarrinho();
    const msg = document.getElementById("confirmacao");
    msg.textContent = `Pedido confirmado: ${qtd} ${qtd === 1 ? "item" : "itens"}, total de ${total}. Obrigado por comprar na NEXORA!`;
    msg.hidden = false;
  });
});
