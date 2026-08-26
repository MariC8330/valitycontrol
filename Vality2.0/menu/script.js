import { 
  auth, 
  db 
} from "../services/firebase.js";

import { 
  signOut,
  deleteUser, 
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js"; 

import { 
  collection,
   getDocs, 
   deleteDoc, 
   doc 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// evita inicializar duas vezes
if (window.menuInicializado) {
  console.warn("Menu já inicializado");
} else {
  window.menuInicializado = true;
  iniciarMenu();
}

const emailUsuario = document.getElementById("emailUsuario");

auth.onAuthStateChanged((user) => {

  if (user && emailUsuario) {
    emailUsuario.textContent = "👤 " + user.email;
  }

});

function iniciarMenu() {

  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");

  const categoriasToggle = document.getElementById("categoriasToggle");
  const categoriasContent = document.getElementById("categoriasContent");
  const categoriasArrow = document.getElementById("categoriasArrow");
  const listaCategorias = document.getElementById("listaCategorias");

  const btnLogout = document.getElementById("btnLogout");
  const btnExcluirConta = document.getElementById("btnExcluirConta");

  let categoriasAbertas = false;

  
  // MENU BOTAO HAMBURGUER
  function toggleMenu() {

    if (!sideMenu) return;

    const aberto = sideMenu.classList.toggle("open");

    overlay?.classList.toggle("open");

    if (menuToggle) {
      menuToggle.style.left = aberto ? "320px" : "20px";
    }

  }

  menuToggle?.addEventListener("click", toggleMenu);
  overlay?.addEventListener("click", toggleMenu);

  // COLAPSAR CATEGORIAS
  categoriasToggle?.addEventListener("click", () => {

    categoriasAbertas = !categoriasAbertas;

    if (categoriasContent) {
      categoriasContent.style.display = categoriasAbertas ? "block" : "none";
    }

    if (categoriasArrow) {
      categoriasArrow.textContent = categoriasAbertas ? "▼" : "▲";
    }

  });
  
  // LOGOUT
  btnLogout?.addEventListener("click", async () => {
    try {

      await signOut(auth);

      window.location.href = "../login/index.html";

    } catch (error) {
      console.error("Erro no logout:", error);
      alert("Erro ao fazer logout");
    }
  });
  
// EXCLUIR
btnExcluirConta?.addEventListener("click", async () => {
  const confirmar = confirm(
    "Deseja mesmo excluir a conta? Essa ação não poderá ser desfeita."
  );

  if (!confirmar) return;

  await excluirConta();
});


// FUNÇÃO EXCLUIR CONTA
async function excluirConta() {
  try {
    const user = auth.currentUser;

    if (!user) {
      alert("Nenhum usuário logado.");
      return;
    }

    //PEDIR SENHA
    const senha = prompt("Confirme sua senha para excluir a conta:");

    if (!senha) return;

    const credencial = EmailAuthProvider.credential(user.email, senha);

    // REAUTENTICAR
    await reauthenticateWithCredential(user, credencial);

    const uid = user.uid;

    // EXCLUIR PRODUTOS
    const produtosRef = collection(db, "usuarios", uid, "produtos");
    const snapshot = await getDocs(produtosRef);

    for (const documento of snapshot.docs) {
      await deleteDoc(doc(db, "usuarios", uid, "produtos", documento.id));
    }

    //  EXCLUIR USUÁRIO DO FIRESTORE
    await deleteDoc(doc(db, "usuarios", uid));

    //  EXCLUIR AUTH
    await deleteUser(user);

    alert("Conta excluída com sucesso!");
    window.location.href = "/login/index.html";

  } catch (erro) {
    console.error("Erro ao excluir conta:", erro);
    alert("Erro: " + erro.code);
  }
}

  // CATEGORIAS
  if (!window.produtos) {
    window.produtos = [];
  }

  function obterCategorias() {

    const mapa = {};

    window.produtos.forEach(produto => {

      if (!produto.categoria) return;

      if (!mapa[produto.categoria]) {
        mapa[produto.categoria] = 0;
      }

      mapa[produto.categoria]++;

    });

    return mapa;
  }

  function renderizarCategorias() {

    if (!listaCategorias) return;

    listaCategorias.innerHTML = "";

    const categorias = obterCategorias();

    Object.entries(categorias).forEach(([nome, quantidade]) => {

      const li = document.createElement("li");

      li.className = "categoria-item";

      li.innerHTML = `
        <div class="categoria-topo">
          <span class="categoria-nome">${nome}</span>
          <span class="categoria-count">${quantidade}</span>
        </div>
      `;

      listaCategorias.appendChild(li);

    });

  }

  renderizarCategorias();

  // expor função global
  window.renderizarCategorias = renderizarCategorias;

}
