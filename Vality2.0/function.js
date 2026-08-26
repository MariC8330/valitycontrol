// ===============================
// IMPORTS FIREBASE
// ===============================
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import { db } from "./services/firebase.js";

// ===============================
// UID DO USUÁRIO LOGADO
// ===============================
let uidUsuario = null;

// ===============================
// AUTH GUARD
// ===============================
function iniciarAuthGuard() {
  if (!window.firebaseAuth) {
    setTimeout(iniciarAuthGuard, 50);
    return;
  }

  onAuthStateChanged(window.firebaseAuth, (user) => {
    if (!user) {
      window.location.href = "../login/index.html";
      return;
    }

    uidUsuario = user.uid;

    // carrega produtos somente após login confirmado
    carregarProdutos();
  });
}

iniciarAuthGuard();

// ===============================
// ESTADO
// ===============================
let produtos = [];
window.produtos = produtos;

// ===============================
// ELEMENTOS
// ===============================
const nomeInput = document.getElementById("nomeProduto");
const loteInput = document.getElementById("loteProduto");
const validadeInput = document.getElementById("validadeProduto");
const categoriaInput = document.getElementById("categoriaProduto");
const qtdInput = document.getElementById("qtdProduto");
const btnCadastrar = document.getElementById("btnCadastrar");
const lista = document.getElementById("listaItens");

const buscarInput = document.getElementById("buscarInput");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroMes = document.getElementById("filtroMes");
const filtroAno = document.getElementById("filtroAno");

// ===============================
// CARREGAR PRODUTOS DO FIRESTORE
// ===============================
async function carregarProdutos() {

  if (!uidUsuario) {
    console.warn("UID ainda não carregado");
    return;
  }

  try {

    const querySnapshot = await getDocs(
      collection(db, "usuarios", uidUsuario, "produtos")
    );

    produtos = [];

    querySnapshot.forEach((docSnap) => {
      const produto = docSnap.data();
      produto.firestoreId = docSnap.id;
      produtos.push(produto);
    });

    window.produtos = produtos;

    atualizarFiltros();
    renderizarLista();
    window.renderizarCategorias?.();

  } catch (erro) {

    console.error("Erro ao carregar produtos:", erro);

  }

}

// ===============================
// CALCULAR STATUS POR DIAS
// ===============================
function calcularStatus(produto) {

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataValidade = new Date(produto.validade);
  dataValidade.setHours(0, 0, 0, 0);

  const diffDias = Math.ceil(
    (dataValidade - hoje) / (1000 * 60 * 60 * 24)
  );

  let classe = "item-ok";
  let alerta = "";

  if (diffDias < 0) {
    classe = "item-vencido";
    alerta = `(expirou há ${Math.abs(diffDias)} dias)`;
  } else if (diffDias <= 90) {
    classe = "item-3meses";
    alerta = `(faltam ${diffDias} dias para vencer)`;
  } else if (diffDias <= 180) {
    classe = "item-6meses";
    alerta = `(faltam ${diffDias} dias para vencer)`;
  }

  return { classe, alerta, diffDias };
}

// ===============================
// CADASTRAR
// ===============================
btnCadastrar.addEventListener("click", async () => {

  if (!uidUsuario) {
    alert("Usuário ainda não carregado. Aguarde alguns segundos.");
    return;
  }

  const produto = {
    nome: nomeInput.value.trim(),
    lote: loteInput.value.trim(),
    validade: validadeInput.value,
    categoria: categoriaInput.value.trim(),
    qtd: qtdInput.value || 0
  };

  if (!produto.nome || !produto.validade) {
    alert("Preencha nome e validade!");
    return;
  }

  try {

    const docRef = await addDoc(
      collection(db, "usuarios", uidUsuario, "produtos"),
      {
        nome: produto.nome,
        lote: produto.lote,
        validade: produto.validade,
        categoria: produto.categoria,
        qtd: produto.qtd,
        criadoEm: new Date()
      }
    );

    produto.firestoreId = docRef.id;
    produtos.push(produto);
    window.produtos = produtos;

    console.log("✅ Produto salvo no Firestore");

  } catch (e) {

    console.error("❌ Erro ao salvar:", e);
    return;

  }

  limparFormulario();
  atualizarFiltros();
  renderizarLista();
  window.renderizarCategorias?.();
});

// ===============================
// LIMPAR FORM
// ===============================
function limparFormulario() {

  nomeInput.value = "";
  loteInput.value = "";
  validadeInput.value = "";
  categoriaInput.value = "";
  qtdInput.value = "";

}

// ===============================
// RENDER LISTA
// ===============================
function renderizarLista() {

  lista.innerHTML = "";

  let filtrados = [...produtos];

  const busca = buscarInput.value.toLowerCase();

  if (busca) {

    filtrados = filtrados.filter(p =>
      p.nome.toLowerCase().includes(busca) ||
      (p.lote || "").toLowerCase().includes(busca)
    );

  }

  if (filtroCategoria.value) {

    filtrados = filtrados.filter(
      p => p.categoria === filtroCategoria.value
    );

  }

  if (filtroMes.value) {

    filtrados = filtrados.filter(p => {

      const d = new Date(p.validade);
      const chave = `${d.getMonth() + 1}/${d.getFullYear()}`;
      return chave === filtroMes.value;

    });

  }

  if (filtroAno.value) {

    filtrados = filtrados.filter(p => {

      const d = new Date(p.validade);
      return d.getFullYear().toString() === filtroAno.value;

    });

  }

  filtrados.forEach((produto) => {

    const { classe, alerta } = calcularStatus(produto);

    const card = document.createElement("div");
    card.className = `item-card ${classe}`;

    renderModoVisual(card, produto, alerta);
    lista.appendChild(card);

  });

}

// ===============================
// MODO VISUAL
// ===============================
function renderModoVisual(card, produto, alerta) {

  card.innerHTML = `
    <div class="item-info">
      <strong>${produto.nome}</strong>
      <p>Lote: ${produto.lote || "-"}</p>
      <p>Validade: ${formatarData(produto.validade)} <span>${alerta}</span></p>
      <p>Categoria: ${produto.categoria || "-"}</p>
      <p>Qtd: ${produto.qtd || 0}</p>
    </div>

    <div class="item-actions">
      <button class="edit">Editar</button>
      <button class="delete">Excluir</button>
    </div>
  `;

  card.querySelector(".edit").addEventListener("click", () => {
    renderModoEdicao(card, produto);
  });

  card.querySelector(".delete").addEventListener("click", async () => {

    produtos = produtos.filter(p => p.firestoreId !== produto.firestoreId);
    window.produtos = produtos;

    try {

      await deleteDoc(
        doc(db, "usuarios", uidUsuario, "produtos", produto.firestoreId)
      );

      console.log("🗑️ Excluído do Firestore");

    } catch (e) {

      console.error("Erro ao excluir:", e);

    }

    atualizarFiltros();
    renderizarLista();
    window.renderizarCategorias?.();

  });

}

// ===============================
// MODO EDIÇÃO
// ===============================
function renderModoEdicao(card, produto) {

  card.innerHTML = `
    <div class="item-info">
      <input type="text" id="editNome" value="${produto.nome}">
      <input type="text" id="editLote" value="${produto.lote || ""}">
      <input type="date" id="editValidade" value="${produto.validade}">
      <input type="text" id="editCategoria" value="${produto.categoria || ""}">
      <input type="number" id="editQtd" value="${produto.qtd || 0}">
    </div>

    <div class="item-actions">
      <button class="save">Salvar</button>
      <button class="cancel">Cancelar</button>
    </div>
  `;

  card.querySelector(".save").addEventListener("click", async () => {

    produto.nome = card.querySelector("#editNome").value.trim();
    produto.lote = card.querySelector("#editLote").value.trim();
    produto.validade = card.querySelector("#editValidade").value;
    produto.categoria = card.querySelector("#editCategoria").value.trim();
    produto.qtd = card.querySelector("#editQtd").value;

    try {

      const ref = doc(
        db,
        "usuarios",
        uidUsuario,
        "produtos",
        produto.firestoreId
      );

      await updateDoc(ref, {
        nome: produto.nome,
        lote: produto.lote,
        validade: produto.validade,
        categoria: produto.categoria,
        qtd: produto.qtd
      });

      console.log("✅ Atualizado no Firestore");

    } catch (e) {

      console.error("❌ Erro ao atualizar:", e);

    }

    const { classe, alerta } = calcularStatus(produto);

    card.className = `item-card ${classe}`;

    renderModoVisual(card, produto, alerta);

    atualizarFiltros();
    window.renderizarCategorias?.();

  });

  card.querySelector(".cancel").addEventListener("click", () => {

    const { alerta } = calcularStatus(produto);
    renderModoVisual(card, produto, alerta);

  });

}

// ===============================
// FORMATAR DATA
// ===============================
function formatarData(dataISO) {

  if (!dataISO) return "-";

  const d = new Date(dataISO);
  return d.toLocaleDateString("pt-BR");

}

// ===============================
// ATUALIZAR FILTROS
// ===============================
function atualizarFiltros() {

  const categorias = [
    ...new Set(produtos.map(p => p.categoria).filter(Boolean))
  ];

  preencherSelect(filtroCategoria, categorias, "Categoria");

  const meses = [
    ...new Set(produtos.map(p => {

      const d = new Date(p.validade);
      return `${d.getMonth() + 1}/${d.getFullYear()}`;

    }))
  ];

  preencherSelect(filtroMes, meses, "Mês/Ano");

  const anos = [
    ...new Set(produtos.map(p => {

      const d = new Date(p.validade);
      return d.getFullYear().toString();

    }))
  ];

  preencherSelect(filtroAno, anos, "Ano");

}

// ===============================
// PREENCHER SELECT
// ===============================
function preencherSelect(select, valores, labelPadrao) {

  const valorAtual = select.value;

  select.innerHTML = `<option value="">${labelPadrao}</option>`;

  valores.sort().forEach(v => {

    const opt = document.createElement("option");

    opt.value = v;
    opt.textContent = v;

    select.appendChild(opt);

  });

  select.value = valorAtual;

}

// ===============================
// EVENTOS DE FILTRO
// ===============================
buscarInput.addEventListener("input", renderizarLista);
filtroCategoria.addEventListener("change", renderizarLista);
filtroMes.addEventListener("change", renderizarLista);
filtroAno.addEventListener("change", renderizarLista);

// ===============================
// EXPOSIÇÃO GLOBAL
// ===============================
window.renderizarLista = renderizarLista;
window.atualizarFiltros = atualizarFiltros;