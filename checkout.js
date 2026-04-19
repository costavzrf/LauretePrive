document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const produtoEl = document.getElementById("checkoutProduto");
  const precoEl = document.getElementById("checkoutPreco");
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const totalEl = document.getElementById("checkoutTotal");
  const imagemEl = document.getElementById("checkoutImagem");
  const descricaoEl = document.getElementById("checkoutDescricao");
  const btn = document.getElementById("checkoutFinalizarBtn");
  const countdownEl = document.getElementById("checkoutCountdown");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function liberarPagina() {
    html.classList.add("page-ready");
  }

  function aplicarTema(theme) {
    const isDark = theme === "dark";

    html.classList.toggle("dark-mode", isDark);
    body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");

    if (themeToggle) {
      themeToggle.textContent = isDark ? "☀️" : "🌙";
    }

    if (themeMeta) {
      themeMeta.setAttribute("content", isDark ? "#14171d" : "#fffafb");
    }
  }

  function normalizarTexto(texto) {
    return (texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  const temaSalvo = localStorage.getItem("theme") || "dark";
  aplicarTema(temaSalvo);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = html.classList.contains("dark-mode");
      aplicarTema(isDark ? "light" : "dark");
    });
  }

  const params = new URLSearchParams(window.location.search);

  const produto = (params.get("produto") || "Produto").trim();
  const preco = (params.get("preco") || "0.00").trim();
  const imagem = (params.get("imagem") || "pic.png").trim();
  const descricao = (params.get("descricao") || "Conteúdo exclusivo e sem censura").trim();
  const pagamento = (params.get("pagamento") || "").trim();

  const produtoNormalizado = normalizarTexto(produto);
  const isVip = produtoNormalizado.includes("vip");

  const precoNumero = Number(preco.replace(",", "."));
  const precoFormatado = !isNaN(precoNumero)
    ? precoNumero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })
    : "R$ 0,00";

  if (produtoEl) produtoEl.textContent = produto;
  if (precoEl) precoEl.textContent = precoFormatado;
  if (subtotalEl) subtotalEl.textContent = precoFormatado;
  if (totalEl) totalEl.textContent = precoFormatado;
  if (descricaoEl) descricaoEl.textContent = descricao;

  if (imagemEl) {
    imagemEl.src = imagem || "pic.png";
    imagemEl.alt = produto;
    imagemEl.loading = "eager";
    imagemEl.decoding = "async";
  }

  if (!btn) {
    liberarPagina();
    console.error("Botão checkoutFinalizarBtn não encontrado no HTML.");
    return;
  }

  btn.textContent = isVip ? "Acessar VIP →" : "Finalizar Compra →";

  let tempoRestante = 10 * 60;
  let countdownInterval = null;

  function atualizarCountdown() {
    const minutos = String(Math.floor(tempoRestante / 60)).padStart(2, "0");
    const segundos = String(tempoRestante % 60).padStart(2, "0");

    if (countdownEl) {
      countdownEl.textContent = `${minutos}:${segundos}`;
    }

    if (tempoRestante > 0) {
      tempoRestante--;
    } else if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  }

  atualizarCountdown();
  countdownInterval = setInterval(atualizarCountdown, 1000);

  btn.addEventListener("click", () => {
    const destino = pagamento || (isVip ? "https://t.me/LauretePriveBot?start=ch" : "");

    if (!destino) {
      alert("Não foi possível encontrar o link de pagamento.");
      return;
    }

    btn.disabled = true;
    btn.textContent = isVip ? "Abrindo VIP..." : "Abrindo pagamento...";

    window.location.href = destino;
  });

  liberarPagina();
});