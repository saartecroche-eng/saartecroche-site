/* app.js - lê produtos.js e monta a vitrine. Não precisa mexer aqui para adicionar bolsas. */
(function () {
  "use strict";

  var vitrine = document.getElementById("vitrine");
  var campoBusca = document.getElementById("busca");
  var boxCategorias = document.getElementById("categorias");
  var contagem = document.getElementById("contagem");
  var modal = document.getElementById("modal");
  var cartoes = {};          // id -> { prod, cor, img, nomeCor, zap }
  var jaCarregadas = {};     // imagens de cor já baixadas (cache simples)
  var categoriaAtiva = "Todas";
  var MAX_NO_CARD = 8;

  var anoEl = document.getElementById("ano"); if (anoEl) anoEl.textContent = new Date().getFullYear();

  /* ---------- utilidades ---------- */
  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "texto") e.textContent = attrs[k];
      else if (k === "classe") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (filhos || []).forEach(function (f) { e.appendChild(f); });
    return e;
  }
  function dinheiro(v) {
    return v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Valor sob consulta";
  }
  function semFoto(img) {
    img.onerror = null;
    img.src = CONFIG.semFoto;
  }
  function peca(prod) {   // "Bolsa Antonella" -> "a bolsa Antonella"; "Pochete Bia" -> "a Pochete Bia"
    return /^bolsa /i.test(prod.nome) ? "a bolsa " + prod.nome.replace(/^bolsa /i, "") : "a " + prod.nome;
  }
  function linkZap(prod, cor) {
    var msg = cor
      ? "Olá! Gostaria de encomendar " + peca(prod) + " na cor " + cor.nome + "."
      : "Olá! Gostaria de encomendar " + peca(prod) + ". Pode me ajudar a escolher a cor?";
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);
  }

  /* Carrega a foto da cor SOMENTE quando a pessoa clica nela */
  function trocarFoto(img, prod, cor) {
    var url = cor && cor.imagem ? cor.imagem : prod.foto;
    if (img.getAttribute("src") === url) return;
    if (jaCarregadas[url]) { img.src = url; return; }
    img.classList.add("carregando");
    var teste = new Image();
    teste.onload = function () {
      jaCarregadas[url] = true;
      img.src = url;
      img.classList.remove("carregando");
    };
    teste.onerror = function () {      // foto da cor ainda não existe: mantém a principal
      img.classList.remove("carregando");
    };
    teste.src = url;
  }

  function bolinha(prod, cor, ao_clicar, marcada) {
    var b = el("button", {
      type: "button", role: "radio", classe: "bolinha",
      "aria-checked": marcada ? "true" : "false",
      "aria-label": cor.nome, title: cor.nome
    });
    b.style.setProperty("--hex", cor.hex || "#cccccc");
    if (cor.imagem) {
      // amostra: recorte minúsculo da própria foto da cor (cor idêntica à foto)
      var am = "imagens/amostras/" + cor.imagem.replace(/^imagens\//, "").replace(/\//g, "-");
      b.style.backgroundImage = 'url("' + am + '")';
      b.style.backgroundSize = "cover";
      b.style.backgroundPosition = "center";
    }
    b.addEventListener("click", function () { ao_clicar(cor); });
    return b;
  }
  function marcar(container, corEscolhida) {
    Array.prototype.forEach.call(container.querySelectorAll(".bolinha"), function (b) {
      b.setAttribute("aria-checked", b.getAttribute("title") === (corEscolhida && corEscolhida.nome) ? "true" : "false");
    });
  }

  /* ---------- vitrine ---------- */
  function criarCard(prod) {
    var estado = { prod: prod, cor: null };
    var img = el("img", { src: prod.foto, alt: prod.nome, loading: "lazy", width: "600", height: "800" });
    img.onerror = function () { semFoto(img); };
    var fotoBtn = el("button", { type: "button", classe: "card-foto", "aria-label": "Ver detalhes de " + prod.nome }, [img]);
    fotoBtn.addEventListener("click", function () { abrirModal(prod, estado.cor); });

    var nomeCor = el("p", { classe: "nome-cor", texto: "" });
    var zap = el("a", { classe: "botao", target: "_blank", rel: "noopener", href: linkZap(prod, null), texto: "Encomendar pelo WhatsApp" });

    var cores = el("div", { classe: "cores", role: "radiogroup", "aria-label": "Cores de " + prod.nome });
    prod.cores.slice(0, MAX_NO_CARD).forEach(function (c) {
      cores.appendChild(bolinha(prod, c, function (cor) {
        estado.cor = cor; marcar(cores, cor);
        nomeCor.textContent = cor.nome;
        zap.href = linkZap(prod, cor);
        trocarFoto(img, prod, cor);
      }));
    });
    if (prod.cores.length > MAX_NO_CARD) {
      var mais = el("button", { type: "button", classe: "mais", texto: "+" + (prod.cores.length - MAX_NO_CARD) });
      mais.setAttribute("aria-label", "Ver todas as " + prod.cores.length + " cores");
      mais.addEventListener("click", function () { abrirModal(prod, estado.cor); });
      cores.appendChild(mais);
    }

    if (!prod.cores.length) { cores.style.display = "none"; nomeCor.textContent = "Cores sob consulta"; }

    var titulo = el("h3", {}, [el("button", { type: "button", texto: prod.nome })]);
    titulo.firstChild.addEventListener("click", function () { abrirModal(prod, estado.cor); });

    var corpo = el("div", { classe: "card-corpo" }, [
      el("p", { classe: "cat", texto: prod.categoria || "" }),
      titulo,
      el("p", { classe: "preco", texto: dinheiro(prod.preco) }),
      cores, nomeCor, zap
    ]);
    var card = el("article", { classe: "card" }, [fotoBtn, corpo]);
    cartoes[prod.id] = estado;
    estado.img = img; estado.nomeCor = nomeCor; estado.zap = zap; estado.coresBox = cores;
    return card;
  }

  function desenhar() {
    var termo = campoBusca.value.trim().toLowerCase();
    var lista = PRODUTOS.filter(function (p) {
      var okCat = categoriaAtiva === "Todas" || p.categoria === categoriaAtiva;
      var okBusca = !termo || p.nome.toLowerCase().indexOf(termo) !== -1;
      return okCat && okBusca;
    });
    vitrine.innerHTML = "";
    if (!lista.length) {
      vitrine.appendChild(el("p", { classe: "vazio", texto: "Nenhuma bolsa encontrada. Tente outro nome ou categoria." }));
    } else {
      var frag = document.createDocumentFragment();
      lista.forEach(function (p) { frag.appendChild(criarCard(p)); });
      vitrine.appendChild(frag);
    }
    contagem.textContent = lista.length + (lista.length === 1 ? " modelo" : " modelos");
  }

  /* ---------- categorias ---------- */
  function montarCategorias() {
    var nomes = ["Todas"];
    PRODUTOS.forEach(function (p) { if (p.categoria && nomes.indexOf(p.categoria) === -1) nomes.push(p.categoria); });
    nomes.forEach(function (n) {
      var b = el("button", { type: "button", classe: "chip", texto: n, "aria-pressed": n === categoriaAtiva ? "true" : "false" });
      b.addEventListener("click", function () {
        categoriaAtiva = n;
        Array.prototype.forEach.call(boxCategorias.children, function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); });
        desenhar();
      });
      boxCategorias.appendChild(b);
    });
  }

  /* ---------- página do produto (janela) ---------- */
  function abrirModal(prod, corInicial) {
    var mImg = document.getElementById("m-foto");
    var mCor = document.getElementById("m-cor");
    var mZap = document.getElementById("m-zap");
    var mCores = document.getElementById("m-cores");
    var estadoCard = cartoes[prod.id];
    var corAtual = null;

    document.getElementById("m-cat").textContent = prod.categoria || "";
    document.getElementById("m-nome").textContent = prod.nome;
    document.getElementById("m-preco").textContent = dinheiro(prod.preco);
    document.getElementById("m-desc").textContent = prod.descricao || "";
    var det = document.getElementById("m-detalhes"); det.innerHTML = "";
    if (prod.dimensoes) det.appendChild(el("li", { texto: "Tamanho: " + prod.dimensoes }));
    if (prod.fio) det.appendChild(el("li", { texto: "Fio: " + prod.fio }));
    det.appendChild(el("li", { texto: "Feita à mão, sob encomenda" }));

    mImg.alt = prod.nome;
    mImg.onerror = function () { semFoto(mImg); };
    mImg.src = prod.foto;
    mImg.classList.remove("carregando");

    function escolher(cor) {
      corAtual = cor; marcar(mCores, cor);
      mCor.textContent = cor.nome;
      mZap.href = linkZap(prod, cor);
      trocarFoto(mImg, prod, cor);
      if (estadoCard) {                       // mantém o card sincronizado
        estadoCard.cor = cor; marcar(estadoCard.coresBox, cor);
        estadoCard.nomeCor.textContent = cor.nome;
        estadoCard.zap.href = linkZap(prod, cor);
        trocarFoto(estadoCard.img, prod, cor);
      }
    }
    mCores.innerHTML = "";
    var semCores = !prod.cores.length;
    document.querySelector(".rotulo").style.display = semCores ? "none" : "";
    mCores.style.display = semCores ? "none" : "";
    if (semCores) det.appendChild(el("li", { texto: "Cores: consulte as opções pelo WhatsApp" }));
    prod.cores.forEach(function (c) { mCores.appendChild(bolinha(prod, c, escolher)); });
    mCor.textContent = "escolha uma cor";
    mZap.href = linkZap(prod, null);
    if (corInicial) escolher(corInicial);

    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  }
  document.getElementById("m-fechar").addEventListener("click", function () { modal.close(); });
  modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });   // clicar fora fecha

  /* ---------- início ---------- */
  campoBusca.addEventListener("input", desenhar);
  montarCategorias();
  desenhar();
})();
