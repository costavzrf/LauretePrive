const supabaseUrl = "https://ndazcilxpjyenkymqltc.supabase.co";
const supabaseKey = "sb_publishable_bAojqWTshY-UjOb_Q-0wnw_FuZ-MjC9";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  const authTabs = document.querySelectorAll(".auth-tab");
  const loginPanel = document.getElementById("login-panel");
  const cadastroPanel = document.getElementById("cadastro-panel");

  const loginForm = document.getElementById("login-form");
  const cadastroForm = document.getElementById("cadastro-form");

  const loginBtn = document.getElementById("login-btn");
  const cadastroBtn = document.getElementById("cadastro-btn");

  const authMessage = document.getElementById("auth-message");
  const forgotPasswordLink = document.getElementById("forgot-password-link");

  const googleLoginBtn = document.getElementById("google-login-btn");
  const googleCadastroBtn = document.getElementById("google-cadastro-btn");

  const LOGIN_PAGE = "login.html";
  const PERFIL_PAGE = "perfil.html";

  function buildPageUrl(fileName) {
    return new URL(fileName, window.location.href).href;
  }

  function showMessage(text, type = "error") {
    if (!authMessage) return;

    authMessage.innerHTML = text;
    authMessage.style.display = "block";
    authMessage.style.marginBottom = "16px";
    authMessage.style.padding = "12px 14px";
    authMessage.style.borderRadius = "12px";
    authMessage.style.fontSize = "14px";
    authMessage.style.lineHeight = "1.5";

    if (type === "success") {
      authMessage.style.background = "rgba(46, 204, 113, 0.12)";
      authMessage.style.border = "1px solid rgba(46, 204, 113, 0.35)";
      authMessage.style.color = "#8ef0b2";
    } else {
      authMessage.style.background = "rgba(231, 76, 60, 0.12)";
      authMessage.style.border = "1px solid rgba(231, 76, 60, 0.35)";
      authMessage.style.color = "#ff9a8f";
    }
  }

  function clearMessage() {
    if (!authMessage) return;
    authMessage.style.display = "none";
    authMessage.innerHTML = "";
  }

  function setLoading(button, loadingText, normalText, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : normalText;
    button.style.opacity = isLoading ? "0.7" : "1";
    button.style.cursor = isLoading ? "not-allowed" : "pointer";
  }

  function setGoogleLoading(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.style.opacity = isLoading ? "0.7" : "1";
    button.style.cursor = isLoading ? "not-allowed" : "pointer";
  }

  function activateTab(tabName) {
    authTabs.forEach((tab) => tab.classList.remove("active"));

    if (tabName === "login") {
      const loginTab = document.querySelector('[data-tab="login"]');
      if (loginTab) loginTab.classList.add("active");

      if (loginPanel) loginPanel.classList.add("active");
      if (cadastroPanel) cadastroPanel.classList.remove("active");
    } else {
      const cadastroTab = document.querySelector('[data-tab="cadastro"]');
      if (cadastroTab) cadastroTab.classList.add("active");

      if (cadastroPanel) cadastroPanel.classList.add("active");
      if (loginPanel) loginPanel.classList.remove("active");
    }

    clearMessage();
  }

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateTab(tab.dataset.tab);
    });
  });

  function extrairNomeDoUsuario(user) {
    return (
      user?.user_metadata?.nome ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.identities?.[0]?.identity_data?.full_name ||
      user?.identities?.[0]?.identity_data?.name ||
      "Cliente"
    );
  }

  async function salvarPerfil(user, nomeManual = null) {
    if (!user?.id) {
      throw new Error("Usuário inválido para salvar perfil.");
    }

    const nome = nomeManual || extrairNomeDoUsuario(user);

    const payload = {
      id: user.id,
      nome: nome
    };

    const { error } = await supabaseClient
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("Erro ao salvar perfil:", error);
      throw error;
    }
  }

  function tratarErroLogin(error) {
    const msg = (error?.message || "").toLowerCase();

    if (msg.includes("invalid login credentials")) {
      return "E-mail ou senha incorretos.";
    }

    if (msg.includes("email not confirmed")) {
      return "Você precisa confirmar seu e-mail antes de entrar.";
    }

    return error?.message || "Não foi possível fazer login.";
  }

  function tratarErroCadastro(error) {
    const msg = (error?.message || "").toLowerCase();

    if (msg.includes("rate limit")) {
      return "Muitas tentativas agora. Aguarde um pouco e tente novamente.";
    }

    if (msg.includes("already registered") || msg.includes("already") || msg.includes("registered")) {
      return "Esse e-mail já está cadastrado. Tente entrar ou recuperar sua senha.";
    }

    return error?.message || "Não foi possível criar a conta.";
  }

  async function redirecionarParaPerfil() {
    window.location.href = buildPageUrl(PERFIL_PAGE);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMessage();

      const email = document.getElementById("login-email")?.value.trim();
      const senha = document.getElementById("login-senha")?.value;

      if (!email || !senha) {
        showMessage("Preencha e-mail e senha.");
        return;
      }

      try {
        setLoading(loginBtn, "Entrando...", "Entrar agora", true);

        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password: senha
        });

        if (error) throw error;
        if (!data?.user) throw new Error("Usuário não retornado no login.");

        await salvarPerfil(data.user);

        showMessage("Login realizado com sucesso. Redirecionando...", "success");

        setTimeout(() => {
          redirecionarParaPerfil();
        }, 800);
      } catch (error) {
        console.error("Erro no login:", error);
        showMessage(tratarErroLogin(error));
      } finally {
        setLoading(loginBtn, "Entrando...", "Entrar agora", false);
      }
    });
  }

  if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMessage();

      const nome = document.getElementById("cadastro-nome")?.value.trim();
      const email = document.getElementById("cadastro-email")?.value.trim();
      const senha = document.getElementById("cadastro-senha")?.value;
      const confirmar = document.getElementById("cadastro-confirmar")?.value;
      const termos = document.getElementById("cadastro-termos")?.checked;

      if (!nome || !email || !senha || !confirmar) {
        showMessage("Preencha todos os campos do cadastro.");
        return;
      }

      if (!termos) {
        showMessage("Você precisa concordar com os termos para criar a conta.");
        return;
      }

      if (senha.length < 6) {
        showMessage("A senha precisa ter pelo menos 6 caracteres.");
        return;
      }

      if (senha !== confirmar) {
        showMessage("As senhas não coincidem.");
        return;
      }

      try {
        setLoading(cadastroBtn, "Criando conta...", "Criar conta", true);

        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              nome: nome
            },
            emailRedirectTo: buildPageUrl(LOGIN_PAGE)
          }
        });

        if (error) throw error;

        if (data?.user) {
          await salvarPerfil(data.user, nome);
        }

        if (data?.session) {
          showMessage("Conta criada com sucesso. Redirecionando...", "success");

          setTimeout(() => {
            redirecionarParaPerfil();
          }, 800);
        } else {
          showMessage(
            `Conta criada com sucesso. Verifique seu e-mail para confirmar a conta.`,
            "success"
          );

          cadastroForm.reset();
          activateTab("login");
        }
      } catch (error) {
        console.error("Erro no cadastro:", error);
        showMessage(tratarErroCadastro(error));
      } finally {
        setLoading(cadastroBtn, "Criando conta...", "Criar conta", false);
      }
    });
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (e) => {
      e.preventDefault();
      clearMessage();

      const email = document.getElementById("login-email")?.value.trim();

      if (!email) {
        showMessage("Digite seu e-mail no campo de login para recuperar a senha.");
        return;
      }

      try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: buildPageUrl(LOGIN_PAGE)
        });

        if (error) throw error;

        showMessage("Enviamos o link de recuperação para seu e-mail.", "success");
      } catch (error) {
        console.error("Erro ao recuperar senha:", error);
        showMessage(error?.message || "Não foi possível enviar o e-mail de recuperação.");
      }
    });
  }

  async function continuarComGoogle(button, mensagemErro) {
    clearMessage();
    setGoogleLoading(button, true);

    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildPageUrl(PERFIL_PAGE)
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error("Erro com Google OAuth:", error);
      setGoogleLoading(button, false);
      showMessage(mensagemErro || "Não foi possível continuar com Google.");
    }
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
      await continuarComGoogle(googleLoginBtn, "Não foi possível entrar com Google.");
    });
  }

  if (googleCadastroBtn) {
    googleCadastroBtn.addEventListener("click", async () => {
      await continuarComGoogle(googleCadastroBtn, "Não foi possível criar conta com Google.");
    });
  }

  async function verificarSessao() {
    try {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) throw error;

      if (data?.session?.user) {
        await salvarPerfil(data.session.user);
        await redirecionarParaPerfil();
      }
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
    }
  }

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    try {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        await salvarPerfil(session.user);
      }
    } catch (error) {
      console.error("Erro no onAuthStateChange:", error);
    }
  });

  verificarSessao();
});