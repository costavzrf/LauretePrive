const items = document.querySelectorAll(".feed-item");

items.forEach(item => {
  const video = item.querySelector("video");
  const overlay = item.querySelector(".overlay");

  video.play();

  video.addEventListener("timeupdate", () => {
    const percent = video.currentTime / video.duration;

    if (percent > 0.7) {
      video.pause();
      overlay.classList.remove("hidden");
    }
  });
});

/* LIKE / FAVORITO */
document.querySelectorAll(".like").forEach(btn => {
  btn.onclick = () => {
    btn.classList.toggle("active");
  };
});

document.querySelectorAll(".fav").forEach(btn => {
  btn.onclick = () => {
    btn.classList.toggle("active");
  };
});
document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll(".amostra-video");
  const somBotoes = document.querySelectorAll(".som-btn");
  let videoComSomAtivo = null;

  videos.forEach((video) => {
    const wrap = video.closest(".amostra-video-wrap");
    const overlay = wrap.querySelector(".amostra-overlay");
    const somBtn = wrap.querySelector(".som-btn");
    const lockPoint = Number(video.dataset.lock || 0.78);

    video.currentTime = 0;

    video.addEventListener("click", () => {
      if (!overlay.classList.contains("hidden")) return;

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
        overlay.classList.remove("hidden");
      }
    });

    somBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (video.muted) {
        videos.forEach((outroVideo) => {
          outroVideo.muted = true;
          const outroBtn = outroVideo.closest(".amostra-video-wrap").querySelector(".som-btn");
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
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        const wrap = video.closest(".amostra-video-wrap");
        const overlay = wrap.querySelector(".amostra-overlay");
        const somBtn = wrap.querySelector(".som-btn");

        if (entry.isIntersecting) {
          if (overlay.classList.contains("hidden")) {
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
});
