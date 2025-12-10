document.addEventListener("DOMContentLoaded", function () {

  const pages = document.querySelectorAll(".page");
  const navBtns = document.querySelectorAll(".nav-btn[data-page]");
  const nav = document.getElementById("navActions");
  const hamb = document.getElementById("hamb");

  // helpers
  const isAuth = () => !!localStorage.getItem("auth");

  function showPage(id) {
    pages.forEach(p => p.classList.remove("show"));
    const el = document.getElementById(id);
    if (el) el.classList.add("show");
  }

  // ================= VISIBILIDADE SENHA =================
  const senhaInput = document.getElementById("senha");
  const toggleSenha = document.getElementById("toggleSenha");

  if (senhaInput && toggleSenha) {
    toggleSenha.addEventListener("click", () => {
      if (senhaInput.type === "password") {
        senhaInput.type = "text";
        toggleSenha.textContent = "🙈";
      } else {
        senhaInput.type = "password";
        toggleSenha.textContent = "👁️";
      }
    });
  }

  // ================= HAMBÚRGUER =================
  if (hamb && nav) {
    hamb.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  // ================= ESTADO INICIAL =================
  if (isAuth()) {
    showPage("dashboard");
  } else {
    showPage("login");
  }

  // ================= LOGIN (admin / 1234) =================
  const formLogin = document.getElementById("formLogin");

  if (formLogin) {
    formLogin.addEventListener("submit", function (e) {
      e.preventDefault();

      const u = document.getElementById("usuario").value.trim();
      const p = document.getElementById("senha").value.trim();

      if (u !== "admin" || p !== "1234") {
        alert("Usuário ou senha incorretos!");
        return;
      }

      localStorage.setItem("auth", "1");
      if (nav) nav.classList.remove("open");
      showPage("dashboard");
      atualizarDashboard();
      atualizarSelectImoveis();
      renderImoveis();
      renderManutencoes();
      gerarRelatorio();
    });
  }

  // ================= LOGOUT =================
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("auth");
      if (nav) nav.classList.remove("open");
      showPage("login");
    });
  }

  // ================= NAVEGAÇÃO SPA =================
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;

      if (!isAuth()) {
        alert("Você precisa fazer login!");
        showPage("login");
        return;
      }

      if (nav) nav.classList.remove("open");
      showPage(page);

      if (page === "dashboard") atualizarDashboard();
      if (page === "cadastro") {
        renderImoveis();
        atualizarSelectImoveis();
      }
      if (page === "manutencao") {
        atualizarSelectImoveis();
        renderManutencoes();
      }
      if (page === "relatorio") gerarRelatorio();
    });
  });

  // ================= DADOS EM LOCALSTORAGE =================
  let imoveis = JSON.parse(localStorage.getItem("imoveis") || "[]");
  let manut = JSON.parse(localStorage.getItem("manut") || "[]");

  const saveImoveis = () =>
    localStorage.setItem("imoveis", JSON.stringify(imoveis));
  const saveManut = () =>
    localStorage.setItem("manut", JSON.stringify(manut));

  // ================= CADASTRO DE IMÓVEIS =================
  const tabelaImoveisBody = document.querySelector("#tabelaImoveis tbody");
  const formImovel = document.getElementById("formImovel");

  function renderImoveis() {
    if (!tabelaImoveisBody) return;
    tabelaImoveisBody.innerHTML = "";

    imoveis.forEach((i, idx) => {
      tabelaImoveisBody.innerHTML += `
        <tr>
          <td>${i.id}</td>
          <td>${i.endereco || ""}</td>
          <td>${i.tipo || ""}</td>
          <td><button class="del-imovel" data-i="${idx}">X</button></td>
        </tr>
      `;
    });
  }

  function atualizarSelectImoveis() {
    const sel = document.getElementById("imovel");
    if (!sel) return;

    sel.innerHTML = "";
    imoveis.forEach(i => {
      const op = document.createElement("option");
      op.value = i.id;
      op.textContent = `${i.id} - ${i.endereco || ""}`;
      sel.appendChild(op);
    });
  }

  if (formImovel && tabelaImoveisBody) {
    formImovel.addEventListener("submit", e => {
      e.preventDefault();

      const id = document.getElementById("idImovel").value.trim();
      const end = document.getElementById("endereco").value.trim();
      const tipo = document.getElementById("tipo").value;

      if (!id) {
        alert("ID obrigatório");
        return;
      }

      imoveis.push({ id, endereco: end, tipo });
      saveImoveis();
      formImovel.reset();
      renderImoveis();
      atualizarSelectImoveis();
      atualizarDashboard();
      gerarRelatorio();
    });

    tabelaImoveisBody.addEventListener("click", ev => {
      if (ev.target.classList.contains("del-imovel")) {
        const idx = Number(ev.target.dataset.i);
        imoveis.splice(idx, 1);
        saveImoveis();
        renderImoveis();
        atualizarSelectImoveis();
        atualizarDashboard();
        gerarRelatorio();
      }
    });
  }

  // ================= DASHBOARD =================
  function atualizarDashboard() {
    const totalImoveisEl = document.getElementById("totalImoveis");
    const totalManEl = document.getElementById("totalMan");
    const totalGastoEl = document.getElementById("totalGasto");
    if (!totalImoveisEl || !totalManEl || !totalGastoEl) return;

    const imv = JSON.parse(localStorage.getItem("imoveis") || "[]");
    const man = JSON.parse(localStorage.getItem("manut") || "[]");

    totalImoveisEl.textContent = imv.length;
    totalManEl.textContent = man.length;

    const total = man.reduce((acc, m) => acc + Number(m.custo || 0), 0);
    totalGastoEl.textContent = "R$ " + total.toFixed(2);
  }

  // ================= MANUTENÇÃO =================
  const tabelaManBody = document.querySelector("#tabelaMan tbody");
  const formMan = document.getElementById("formMan");

  function renderManutencoes() {
    if (!tabelaManBody) return;
    tabelaManBody.innerHTML = "";

    manut.forEach((m, idx) => {
      tabelaManBody.innerHTML += `
        <tr>
          <td>${m.imovel}</td>
          <td>${m.reparo}</td>
          <td>R$ ${Number(m.custo).toFixed(2)}</td>
          <td>${m.data}</td>
          <td><button class="del-manut" data-i="${idx}">X</button></td>
        </tr>
      `;
    });
  }

  if (formMan && tabelaManBody) {
    const campoData = document.getElementById("data");
    if (campoData && !campoData.value) {
      campoData.value = new Date().toISOString().slice(0, 10);
    }

    formMan.addEventListener("submit", e => {
      e.preventDefault();

      const imovelSel = document.getElementById("imovel").value;
      const rep = document.getElementById("reparo").value.trim();
      const custo = document.getElementById("custo").value;
      const data = document.getElementById("data").value;

      if (!imovelSel || !rep || custo === "") {
        alert("Preencha todos os campos");
        return;
      }

      manut.push({ imovel: imovelSel, reparo: rep, custo, data });
      saveManut();
      formMan.reset();
      if (campoData) campoData.value = new Date().toISOString().slice(0, 10);

      renderManutencoes();
      atualizarDashboard();
      gerarRelatorio();
    });

    tabelaManBody.addEventListener("click", ev => {
      if (ev.target.classList.contains("del-manut")) {
        const idx = Number(ev.target.dataset.i);
        manut.splice(idx, 1);
        saveManut();
        renderManutencoes();
        atualizarDashboard();
        gerarRelatorio();
      }
    });
  }

  // ================= RELATÓRIO =================
  function gerarRelatorio() {
    const tabelaRelBody = document.querySelector("#tabelaRel tbody");
    if (!tabelaRelBody) return;

    const imv = JSON.parse(localStorage.getItem("imoveis") || "[]");
    const man = JSON.parse(localStorage.getItem("manut") || "[]");

    tabelaRelBody.innerHTML = "";

    imv.forEach(i => {
      const totals = Array(12).fill(0);

      man.filter(m => m.imovel == i.id).forEach(m => {
        const d = new Date(m.data);
        if (!isNaN(d)) {
          totals[d.getMonth()] += Number(m.custo);
        }
      });

      let row = `<tr><td>${i.id}</td>`;
      totals.forEach(v => {
        row += `<td>R$ ${v.toFixed(2)}</td>`;
      });
      row += "</tr>";

      tabelaRelBody.innerHTML += row;
    });
  }

  // ================= CHAMADAS INICIAIS =================
  renderImoveis();
  atualizarSelectImoveis();
  renderManutencoes();
  atualizarDashboard();
  gerarRelatorio();

});
