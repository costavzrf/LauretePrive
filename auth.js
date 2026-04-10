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

  function showMessage(text, type = "error") {
    authMessage.innerHTML = text;
    authMessage.style.display = "block";

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
    authMessage.style.display = "none";
    authMessage.innerHTML = "";
  }

  function setLoading(button, loadingText, normalText, isLoading) {
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : normalText;
    button.style.opacity = isLoading ? "0.7" : "1";
  }

  function activateTab(tabName) {
    authTabs.forEach(tab => tab.classList.remove("active"));

    if (tabName === "login") {
      document.querySelector('[data-tab="login"]').classList.add("active");
      loginPanel.classList.add("active");
      cadastroPanel.classList.remove("active");
    } else {
      document.querySelector('[data-tab="cadastro"]').classList.add("active");
      cadastroPanel.classList.add("active");
      loginPanel.classList.remove("active");
    }

    clearMessage();
  }

  authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activateTab(tab.dataset.tab);
    });
  });

  async function salvarPerfil(user, nome) {
    const { error } = await supabaseClient
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          nome: nome
        },
        { onConflict: "id" }
      );

    if (error) throw error;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMessage();

      const email = document.getElementById("login-email").value.trim();
      const senha = document.getElementById("login-senha").value;

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

        if (data.user) {
          showMessage("Login realizado com sucesso. Redirecionando...", "success");

          setTimeout(() => {
            window.location.href = "index.html";
          }, 1200);
        }
      } catch (error) {
        showMessage(error.message || "Não foi possível fazer login.");
      } finally {
        setLoading(loginBtn, "Entrando...", "Entrar agora", false);
      }
    });
  }

  if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMessage();

      const nome = document.getElementById("cadastro-nome").value.trim();
      const email = document.getElementById("cadastro-email").value.trim();
      const senha = document.getElementById("cadastro-senha").value;
      const confirmar = document.getElementById("cadastro-confirmar").value;
      const termos = document.getElementById("cadastro-termos").checked;

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
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          await salvarPerfil(data.user, nome);
        }

        if (data.session) {
          showMessage("Conta criada com sucesso. Redirecionando...", "success");

          setTimeout(() => {
            window.location.href = "index.html";
          }, 1200);
        } else {
          showMessage(
            "Conta criada com sucesso! Verifique seu e-mail e clique no link de confirmação para ativar sua conta. Veja também a caixa de spam.",
            "success"
          );

          cadastroForm.reset();
          activateTab("login");
        }
      } catch (error) {
        showMessage(error.message || "Não foi possível criar a conta.");
      } finally {
        setLoading(cadastroBtn, "Criando conta...", "Criar conta", false);
      }
    });
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (e) => {
      e.preventDefault();
      clearMessage();

      const email = document.getElementById("login-email").value.trim();

      if (!email) {
        showMessage("Digite seu e-mail no campo de login para recuperar a senha.");
        return;
      }

      try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/login.html"
        });

        if (error) throw error;

        showMessage("Enviamos o link de recuperação para seu e-mail.", "success");
      } catch (error) {
        showMessage(error.message || "Não foi possível enviar o e-mail de recuperação.");
      }
    });
  }

  async function verificarSessao() {
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
      window.location.href = "index.html";
    }
  }

  verificarSessao();
});