document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ app.js carregado");

  /* =====================
     ESTADO
  ===================== */
  let stock = JSON.parse(localStorage.getItem("stock")) || [];
  let history = JSON.parse(localStorage.getItem("history")) || [];

  /* =====================
     ELEMENTOS
  ===================== */
  const tbody = document.querySelector("#stockTable tbody");
  const headers = document.querySelectorAll("#stockTable thead th[data-key]");
  const searchInput = document.getElementById("search");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalQuantity = document.getElementById("modalQuantity");
  const confirmBtn = document.getElementById("confirmBtn");

  const excelInput = document.getElementById("excelInput");
  const importBtn = document.getElementById("importBtn");
  const exportBtn = document.getElementById("exportBtn");
  const darkBtn = document.getElementById("darkBtn");

  /* MODAL DE EDIÇÃO */
  const editModal = document.getElementById("editModal");
  const editMaterial = document.getElementById("editMaterial");
  const editDescricao = document.getElementById("editDescricao");
  const editMarca = document.getElementById("editMarca");
  const editCompra = document.getElementById("editCompra");
  const editLink = document.getElementById("editLink");
  const editNotas = document.getElementById("editNotas");
  const saveEditBtn = document.getElementById("saveEditBtn");

  let selectedIndex = null;
  let actionType = null;
  let currentSort = { key: null, asc: true };
  let editIndex = null;

  /* =====================
     UTILIDADES
  ===================== */
  const saveStock = () =>
    localStorage.setItem("stock", JSON.stringify(stock));

  const dateToSortable = (dateStr) => {
    if (!dateStr) return 0;
    const [d, m, y] = String(dateStr).split("/");
    return new Date(y, m - 1, d).getTime();
  };

  /* =====================
     RENDER
  ===================== */
  function renderTable(data = stock) {
    tbody.innerHTML = "";

    if (data.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="8">Nenhum resultado encontrado</td>`;
      tbody.appendChild(tr);
      return;
    }

    data.forEach(item => {
      const index = stock.indexOf(item);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.quantidade}</td>
        <td>${item.material}</td>
        <td>${item.descricao}</td>
        <td>${item.marca}</td>
        <td>${item.compra || ""}</td>
        <td>${item.link || ""}</td>
        <td>${item.notas || ""}</td>
        <td>
          <button onclick="openModal(${index}, 'in')">➕</button>
          <button onclick="openModal(${index}, 'out')">➖</button>
          <button onclick="requestEdit(${index})">✏️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderTable();

  /* =====================
     PESQUISA ✅ (CORRIGIDA DE VEZ)
  ===================== */
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    console.log("🔍 Pesquisa:", q);

    const filtered = stock.filter(item =>
      String(item.material).toLowerCase().includes(q) ||
      String(item.descricao).toLowerCase().includes(q) ||
      String(item.marca).toLowerCase().includes(q) ||
      String(item.notas).toLowerCase().includes(q)
    );

    renderTable(filtered);
  });

  // bloquear Enter
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("⛔ Enter bloqueado");
    }
  });

  /* =====================
     ORDENAÇÃO
  ===================== */
  headers.forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      currentSort.asc = currentSort.key === key ? !currentSort.asc : true;
      currentSort.key = key;

      stock.sort((a, b) => {
        let A = a[key], B = b[key];
        if (key === "quantidade") return currentSort.asc ? A - B : B - A;
        if (key === "compra") return currentSort.asc
          ? dateToSortable(A) - dateToSortable(B)
          : dateToSortable(B) - dateToSortable(A);

        A = String(A).toLowerCase();
        B = String(B).toLowerCase();
        return currentSort.asc ? A.localeCompare(B) : B.localeCompare(A);
      });

      renderTable();
    });
  });

  /* =====================
     MODAL ➕ ➖
  ===================== */
  window.openModal = (index, type) => {
    selectedIndex = index;
    actionType = type;
    modalTitle.textContent = type === "in" ? "Entrada" : "Saída";
    modalQuantity.value = 1;
    modal.classList.remove("hidden");
  };

  window.closeModal = () => modal.classList.add("hidden");

  confirmBtn.addEventListener("click", () => {
    const qty = Number(modalQuantity.value);
    const item = stock[selectedIndex];
    if (actionType === "out" && item.quantidade < qty) return;

    item.quantidade += actionType === "in" ? qty : -qty;
    saveStock();
    renderTable();
    closeModal();
  });

  /* =====================
     EDIÇÃO ✅
  ===================== */
  window.requestEdit = (index) => {
    editIndex = index;
    const item = stock[index];

    editMaterial.value = item.material;
    editDescricao.value = item.descricao;
    editMarca.value = item.marca;
    editCompra.value = item.compra || "";
    editLink.value = item.link || "";
    editNotas.value = item.notas || "";

    editModal.classList.remove("hidden");
  };

  window.closeEditModal = () => editModal.classList.add("hidden");

  saveEditBtn.addEventListener("click", () => {
    const item = stock[editIndex];

    item.material = editMaterial.value;
    item.descricao = editDescricao.value;
    item.marca = editMarca.value;
    item.compra = editCompra.value;
    item.link = editLink.value;
    item.notas = editNotas.value;

    saveStock();
    renderTable();
    closeEditModal();
  });

  /* =====================
     DARK MODE
  ===================== */
  darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

});
``