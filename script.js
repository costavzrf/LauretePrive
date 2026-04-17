document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     TEMA
  ========================= */
  const html = document.documentElement;
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
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

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = html.classList.contains("dark-mode");
      applyTheme(isDark ? "light" : "dark");
    });
  }

  /* =========================
     FEED ANTIGO / VIDEOS / OVERLAYS
  ========================= */
  const feedItems = document.querySelectorAll(".feed-item");

  feedItems.forEach((item) => {
    const video = item.querySelector("video");
    const overlay = item.querySelector(".overlay");

    if (!video || !overlay) return;

    video.play().catch(() => {});

    video.addEventListener("timeupdate", () => {
      if (!video.duration || Number.isNaN(video.duration)) return;

      const percent = video.currentTime / video.duration;

      if (percent > 0.7) {
        video.pause();
        overlay.classList.remove("hidden");
      }
    });
  });

  document.querySelectorAll(".like").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  document.querySelectorAll(".fav").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  /* =========================
     COMPRA / CHECKOUT
  ========================= */
  document.querySelectorAll(".comprar-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const produto = btn.dataset.produto || "Produto";
      const preco = btn.dataset.preco || "0.00";
      const imagem = btn.dataset.imagem || "https://placehold.co/220x220/png";
      const descricao = btn.dataset.descricao || "Conteúdo exclusivo e sem censura";

      const checkoutUrl =
        `checkout.html?produto=${encodeURIComponent(produto)}` +
        `&preco=${encodeURIComponent(preco)}` +
        `&imagem=${encodeURIComponent(imagem)}` +
        `&descricao=${encodeURIComponent(descricao)}`;

      window.location.href = checkoutUrl;
    });
  });

  /* =========================
     AMOSTRAS / SOM / OVERLAY
  ========================= */
  const videos = document.querySelectorAll(".amostra-video");
  let videoComSomAtivo = null;

  videos.forEach((video) => {
    const wrap = video.closest(".amostra-video-wrap");
    if (!wrap) return;

    const overlay = wrap.querySelector(".amostra-overlay");
    const somBtn = wrap.querySelector(".som-btn");
    const lockPoint = Number(video.dataset.lock || 0.78);

    try {
      video.currentTime = 0;
    } catch (_) {}

    video.addEventListener("click", () => {
      if (overlay && !overlay.classList.contains("hidden")) return;

      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener("timeupdate", () => {
      if (!video.duration || Number.isNaN(video.duration)) return;

      const porcentagem = video.currentTime / video.duration;

      if (porcentagem >= lockPoint) {
        video.pause();
        if (overlay) overlay.classList.remove("hidden");
      }
    });

    if (somBtn) {
      somBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (video.muted) {
          videos.forEach((outroVideo) => {
            outroVideo.muted = true;

            const outroWrap = outroVideo.closest(".amostra-video-wrap");
            const outroBtn = outroWrap ? outroWrap.querySelector(".som-btn") : null;
            if (outroBtn) outroBtn.textContent = "🔇";
          });

          video.muted = false;
          somBtn.textContent = "🔊";
          videoComSomAtivo = video;
          video.play().catch(() => {});
        } else {
          video.muted = true;
          somBtn.textContent = "🔇";

          if (videoComSomAtivo === video) {
            videoComSomAtivo = null;
          }
        }
      });
    }
  });

  if (videos.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const wrap = video.closest(".amostra-video-wrap");
          if (!wrap) return;

          const overlay = wrap.querySelector(".amostra-overlay");
          const somBtn = wrap.querySelector(".som-btn");

          if (entry.isIntersecting) {
            if (!overlay || overlay.classList.contains("hidden")) {
              video.play().catch(() => {});
            }
          } else {
            video.pause();

            if (video === videoComSomAtivo) {
              video.muted = true;
              if (somBtn) somBtn.textContent = "🔇";
              videoComSomAtivo = null;
            }
          }
        });
      },
      { threshold: 0.72 }
    );

    videos.forEach((video) => observer.observe(video));
  }

  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("ativo");
    });
  });

  document.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("ativo");
    });
  });

  /* =========================
     MENU MOBILE
  ========================= */
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenuPanel = document.getElementById("mobileMenuPanel");

  if (mobileMenuBtn && mobileMenuPanel) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenuBtn.classList.toggle("active");
      mobileMenuPanel.classList.toggle("open");
      mobileMenuPanel.classList.toggle("is-open");
    });

    mobileMenuPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenuBtn.classList.remove("active");
        mobileMenuPanel.classList.remove("open");
        mobileMenuPanel.classList.remove("is-open");
      });
    });
  }

  /* =========================
     TRANSIÇÃO ENTRE PÁGINAS
  ========================= */
  const links = document.querySelectorAll("a[href]");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(href, window.location.href);

      if (url.origin !== window.location.origin) return;

      e.preventDefault();
      body.classList.add("page-leaving");

      setTimeout(() => {
        window.location.href = url.href;
      }, 180);
    });
  });
});
