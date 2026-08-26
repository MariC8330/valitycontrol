import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const emailInput = document.getElementById("emailCadastro");
const senhaInput = document.getElementById("senhaCadastro");
const confirmarInput = document.getElementById("confirmarSenha");
const btnCadastrar = document.getElementById("btn-secondary");
const btnIrLogin = document.getElementById("btn-primary");
const btnReenviar = document.getElementById("reenviarEmail");

// 🔹 IR PARA LOGIN
btnIrLogin?.addEventListener("click", () => {
  window.location.href = "../login/index.html";
});

// 🔹 CADASTRAR USUÁRIO
btnCadastrar?.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const senha = senhaInput.value;
  const confirmar = confirmarInput.value;
  

  console.log("clicou cadastrar");


  if (!email || !senha || !confirmar) {
    alert("Preencha todos os campos.");
    return;
  }

  if (senha.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  if (senha !== confirmar) {
    alert("As senhas não coincidem.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
  window.firebaseAuth,
  email,
  senha
);

// envia email de verificação
await sendEmailVerification(userCredential.user);

alert("Conta criada! 📩 Verifique seu email antes de fazer login.");

await window.firebaseAuth.signOut();

window.location.href = "../login/index.html";

  } catch (erro) {
    console.error("Erro no cadastro:", erro);

    if (erro.code === "auth/email-already-in-use") {
      alert("Este email já está cadastrado.");
    } else if (erro.code === "auth/invalid-email") {
      alert("Email inválido.");
    } else {
      alert("Erro ao criar conta.");
    }
  }
});

btnReenviar?.addEventListener("click", async () => {

  const user = window.firebaseAuth.currentUser;

  if (!user) {
    alert("Faça login primeiro.");
    return;
  }

  try {

    if (user.emailVerified) {
      alert("Seu email já foi verificado ✅");
      return;
    }

    await sendEmailVerification(user);

    alert("Email de verificação reenviado 📩");

  } catch (erro) {

    console.error(erro);

    if (erro.code === "auth/too-many-requests") {
      alert("Muitas tentativas. Aguarde um pouco.");
    } else {
      alert("Erro ao reenviar email.");
    }
  }
});