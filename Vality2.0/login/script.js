import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// ===============================
// ELEMENTOS
// ===============================
const emailInput = document.getElementById("emailLogin");
const senhaInput = document.getElementById("senhaLogin");
const btnEntrar = document.getElementById("btnEntrar");
const btnCadastrar = document.getElementById("btnCadastrar");

// ===============================
// IR PARA CADASTRO
// ===============================
btnCadastrar?.addEventListener("click", () => {
 window.location.href = "../cadastro/index.html";
});

// ===============================
// LOGIN
// ===============================
btnEntrar?.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const senha = senhaInput.value;

  if (!email || !senha) {
    alert("Preencha email e senha.");
    return;
  }

  try {

    // LOGIN
    const userCredential = await signInWithEmailAndPassword(
      window.firebaseAuth,
      email,
      senha
    );

    const user = userCredential.user;

    // VERIFICA EMAIL
    if (!user.emailVerified) {

      alert("Verifique seu email antes de entrar.");

      await window.firebaseAuth.signOut();

      return;
    }

    // LOGIN LIBERADO
    window.location.href = "../index.html";

  } catch (erro) {

    console.error("Erro no login:", erro);

    if (erro.code === "auth/invalid-credential") {
      alert("Email ou senha inválidos. Não tem uma conta? Cadastre-se.");
    } else {
      alert("Erro ao fazer login. Não tem uma conta? Cadastre-se.");
    }
  }
});

// ESQUECEU A SENHA

document.querySelector(".forgot")?.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    alert("Digite seu e-mail para redefinir a senha.");
    return;
  }

  try {
    await sendPasswordResetEmail(window.firebaseAuth, email);

    alert("Enviamos um link para redefinir sua senha. Verifique seu e-mail.");

  } catch (erro) {

    console.error("Erro ao enviar redefinição:", erro);

    if (erro.code === "auth/invalid-email") {
      alert("Digite um e-mail válido.");
    } else {
      alert("Não foi possível enviar o e-mail de redefinição.");
    }
  }
});