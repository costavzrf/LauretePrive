document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     FEED / VIDEOS / OVERLAYS
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

  const videos = document.querySelectorAll(".amostra-video");
  let videoComSomAtivo = null;

  videos.forEach((video) => {
    const wrap = video.closest(".amostra-video-wrap");
    if (!wrap) return;

    const overlay = wrap.querySelector(".amostra-overlay");
    const somBtn = wrap.querySelector(".som-btn");
    const lockPoint = Number(video.dataset.lock || 0.78);

    video.currentTime = 0;

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
  }

  /* =========================
     TEMA
  ========================= */
  const themeToggle = document.getElementById("themeToggle");

  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "dark");
  }

  function aplicarTemaSalvo() {
    const temaSalvo = localStorage.getItem("theme");

    if (temaSalvo === "light") {
      document.body.classList.remove("dark-mode");
      if (themeToggle) themeToggle.textContent = "🌙";
    } else {
      document.body.classList.add("dark-mode");
      if (themeToggle) themeToggle.textContent = "☀️";
    }
  }

  aplicarTemaSalvo();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const ativouDark = document.body.classList.toggle("dark-mode");
      themeToggle.textContent = ativouDark ? "☀️" : "🌙";
      localStorage.setItem("theme", ativouDark ? "dark" : "light");
    });
  }

  /* =========================
     PERFIL - EDITAR NOME/FOTO
  ========================= */
  const perfilModalOverlay = document.getElementById("perfil-modal-overlay");
  const fecharModalPerfil = document.getElementById("fechar-modal-perfil");
  const cancelarModalPerfil = document.getElementById("cancelar-modal-perfil");
  const perfilEditForm = document.getElementById("perfil-edit-form");
  const editNomeInput = document.getElementById("edit-nome");
  const editAvatarInput = document.getElementById("edit-avatar");
  const perfilAvatarPreview = document.getElementById("perfil-avatar-preview");
  const salvarPerfilBtn = document.getElementById("salvar-perfil-btn");
  const editarPerfilBtn = document.getElementById("editar-perfil-btn");

  const perfilAvatar = document.getElementById("perfil-avatar");
  const perfilNome = document.getElementById("perfil-nome");
  const perfilEmail = document.getElementById("perfil-email");

  const PERFIL_SUPABASE_URL = "https://ndazcilxpjyenkymqltc.supabase.co";
  const PERFIL_SUPABASE_KEY = "sb_publishable_bAojqWTshY-UjOb_Q-0wnw_FuZ-MjC9";

  let supabasePerfil = null;
  let usuarioAtual = null;
  let perfilAtual = null;

  function getInitials(name, email) {
    if (name && name.trim()) {
      const parts = name.trim().split(" ").filter(Boolean);

      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }

      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    if (email) {
      return email.slice(0, 2).toUpperCase();
    }

    return "JP";
  }

  function renderAvatar(element, nome, email, avatarUrl) {
    if (!element) return;

    if (avatarUrl) {
      element.innerHTML = `<img src="${avatarUrl}" alt="Foto de perfil">`;
    } else {
      element.textContent = getInitials(nome, email);
    }
  }

  async function initSupabasePerfil() {
    if (!window.supabase) return null;
    if (supabasePerfil) return supabasePerfil;

    supabasePerfil = window.supabase.createClient(
      PERFIL_SUPABASE_URL,
      PERFIL_SUPABASE_KEY
    );

    return supabasePerfil;
  }

  async function buscarPerfil(userId) {
    const client = await initSupabasePerfil();
    if (!client) return null;

    const { data, error } = await client
      .from("profiles")
      .select("id, nome, email, avatar_url")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data;
  }

  async function carregarUsuarioPerfil() {
    if (!editarPerfilBtn) return;

    const client = await initSupabasePerfil();
    if (!client) return;

    const { data, error } = await client.auth.getUser();

    if (error || !data.user) return;

    usuarioAtual = data.user;
    perfilAtual = await buscarPerfil(usuarioAtual.id);

    const nome = perfilAtual?.nome || usuarioAtual.user_metadata?.nome || "Cliente";
    const email = perfilAtual?.email || usuarioAtual.email || "";
    const avatarUrl = perfilAtual?.avatar_url || "";

    if (perfilNome) {
      perfilNome.innerHTML = `${nome} <span>• Cliente</span>`;
    }

    if (perfilEmail) {
      perfilEmail.textContent = email;
    }

    renderAvatar(perfilAvatar, nome, email, avatarUrl);
  }

  function abrirModalPerfil() {
    if (!perfilModalOverlay || !editNomeInput || !perfilAvatarPreview) return;
    if (!usuarioAtual) return;

    const nome = perfilAtual?.nome || usuarioAtual.user_metadata?.nome || "";
    const email = perfilAtual?.email || usuarioAtual.email || "";
    const avatarUrl = perfilAtual?.avatar_url || "";

    editNomeInput.value = nome;
    if (editAvatarInput) editAvatarInput.value = "";

    renderAvatar(perfilAvatarPreview, nome, email, avatarUrl);
    perfilModalOverlay.classList.add("ativo");
  }

  function fecharModalEditarPerfil() {
    if (perfilModalOverlay) {
      perfilModalOverlay.classList.remove("ativo");
    }
  }

  async function uploadAvatar(userId, file) {
    const client = await initSupabasePerfil();
    if (!client) throw new Error("Supabase não disponível");

    const extensao = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const nomeArquivo = `${userId}-${Date.now()}.${extensao}`;

    const { error: uploadError } = await client.storage
      .from("avatars")
      .upload(nomeArquivo, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = client.storage
      .from("avatars")
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;
  }

  if (editarPerfilBtn) {
    editarPerfilBtn.addEventListener("click", () => {
      abrirModalPerfil();
    });
  }

  if (fecharModalPerfil) {
    fecharModalPerfil.addEventListener("click", fecharModalEditarPerfil);
  }

  if (cancelarModalPerfil) {
    cancelarModalPerfil.addEventListener("click", fecharModalEditarPerfil);
  }

  if (perfilModalOverlay) {
    perfilModalOverlay.addEventListener("click", (e) => {
      if (e.target === perfilModalOverlay) {
        fecharModalEditarPerfil();
      }
    });
  }

  if (editAvatarInput) {
    editAvatarInput.addEventListener("change", () => {
      const file = editAvatarInput.files?.[0];
      const nome = editNomeInput?.value || perfilAtual?.nome || usuarioAtual?.user_metadata?.nome || "";
      const email = perfilAtual?.email || usuarioAtual?.email || "";

      if (!file) {
        renderAvatar(perfilAvatarPreview, nome, email, perfilAtual?.avatar_url || "");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (perfilAvatarPreview) {
          perfilAvatarPreview.innerHTML = `<img src="${e.target.result}" alt="Prévia do avatar">`;
        }
      };
      reader.readAsDataURL(file);
    });
  }

  if (perfilEditForm) {
    perfilEditForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!usuarioAtual) return;

      const client = await initSupabasePerfil();
      if (!client) return;

      const novoNome = editNomeInput ? editNomeInput.value.trim() : "";
      const novoAvatar = editAvatarInput?.files?.[0];

      if (salvarPerfilBtn) {
        salvarPerfilBtn.disabled = true;
        salvarPerfilBtn.textContent = "Salvando...";
      }

      try {
        let avatarUrl = perfilAtual?.avatar_url || null;

        if (novoAvatar) {
          avatarUrl = await uploadAvatar(usuarioAtual.id, novoAvatar);
        }

        const { error } = await client
          .from("profiles")
          .update({
            nome: novoNome || "Cliente",
            avatar_url: avatarUrl
          })
          .eq("id", usuarioAtual.id);

        if (error) throw error;

        perfilAtual = await buscarPerfil(usuarioAtual.id);

        const nomeAtualizado = perfilAtual?.nome || "Cliente";
        const emailAtualizado = perfilAtual?.email || usuarioAtual.email || "";
        const avatarAtualizado = perfilAtual?.avatar_url || "";

        if (perfilNome) {
          perfilNome.innerHTML = `${nomeAtualizado} <span>• Cliente</span>`;
        }

        if (perfilEmail) {
          perfilEmail.textContent = emailAtualizado;
        }

        renderAvatar(perfilAvatar, nomeAtualizado, emailAtualizado, avatarAtualizado);
        fecharModalEditarPerfil();
      } catch (error) {
        console.error(error);
        alert("Não foi possível salvar as alterações do perfil.");
      } finally {
        if (salvarPerfilBtn) {
          salvarPerfilBtn.disabled = false;
          salvarPerfilBtn.textContent = "Salvar alterações";
        }
      }
    });
  }

  carregarUsuarioPerfil();
});