const supabaseUrl = "https://ndazcilxpjyenkymqltc.supabase.co";
const supabaseKey = "sb_publishable_bAojqWTshY-UjOb_Q-0wnw_FuZ-MjC9";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const themeToggle = document.getElementById("themeToggle");
  const produtoEl = document.getElementById("checkoutProduto");
  const precoEl = document.getElementById("checkoutPreco");
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const totalEl = document.getElementById("checkoutTotal");
  const imagemEl = document.getElementById("checkoutImagem");
  const descricaoEl = document.getElementById("checkoutDescricao");
  const btn = document.getElementById("checkoutFinalizarBtn");
  const countdownEl = document.getElementById("checkoutCountdown");

  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "dark");
  }

  function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem("theme");

    if (temaSalvo === "light") {
      document.documentElement.classList.remove("dark-mode");
      document.body.classList.remove("dark-mode");
      if (themeToggle) themeToggle.textContent = "🌙";
    } else {
      document.documentElement.classList.add("dark-mode");
      document.body.classList.add("dark-mode");
      if (themeToggle) themeToggle.textContent = "☀️";
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

  aplicarTemaSalvo();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const ativouDark = !document.body.classList.contains("dark-mode");
      document.body.classList.toggle("dark-mode", ativouDark);
      document.documentElement.classList.toggle("dark-mode", ativouDark);
      themeToggle.textContent = ativouDark ? "☀️" : "🌙";
      localStorage.setItem("theme", ativouDark ? "dark" : "light");
    });
  }

  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
      window.location.href =
        "login.html?msg=" +
        encodeURIComponent("Você precisa entrar na sua conta para acessar o checkout.");
      return;
    }
  } catch (err) {
    console.error("Erro ao verificar sessão:", err);
    alert("Erro ao validar sua sessão.");
    return;
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
  }

  if (!btn) {
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

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const destino = pagamento || (isVip ? "https://t.me/LauretePriveBot?start=ch" : "");

    if (!destino) {
      alert("Não foi possível encontrar o link de pagamento.");
      return;
    }

    btn.disabled = true;
    btn.textContent = isVip ? "Abrindo VIP..." : "Abrindo pagamento...";

    window.open(destino, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = isVip ? "Acessar VIP →" : "Finalizar Compra →";
    }, 1500);
  });
});