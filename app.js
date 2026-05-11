document.addEventListener("DOMContentLoaded", () => {

  let stock = JSON.parse(localStorage.getItem("stock")) || [];
  let history = JSON.parse(localStorage.getItem("history")) || [];

  let sortColumn = null;
  let sortAsc = true;

  const tbody = document.querySelector("#stockTable tbody");
  const headers = document.querySelectorAll("#stockTable th");

  const searchInput = document.getElementById("search");
  const excelInput = document.getElementById("excelInput");
  let importBtn = document.getElementById("importBtn");
  let exportBtn = document.getElementById("exportBtn");
  const darkBtn = document.getElementById("darkBtn");

  const addItemBtn = document.getElementById("addItemBtn");
  const addModal = document.getElementById("addModal");

  const newIdf = document.getElementById("newIdf");
  const newQuantidade = document.getElementById("newQuantidade");
  const newMaterial = document.getElementById("newMaterial");
  const newDescricao = document.getElementById("newDescricao");
  const newMarca = document.getElementById("newMarca");
  const newLink = document.getElementById("newLink");
  const newNotas = document.getElementById("newNotas");
  const saveNewItemBtn = document.getElementById("saveNewItemBtn");

  const IMPORT_CODE = "2222";
  const EXPORT_CODE = "2222";
  const EDIT_CODE = "2222";

  const saveStock = () =>
    localStorage.setItem("stock", JSON.stringify(stock));

  const saveHistory = () =>
    localStorage.setItem("history", JSON.stringify(history));

  /* =====================
     ORDENAÇÃO
  ===================== */
  function sortData(data) {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      let valA = a[sortColumn] || "";
      let valB = b[sortColumn] || "";

      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }

      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  headers.forEach((th, index) => {
    th.style.cursor = "pointer";

    th.addEventListener("click", () => {

      const columns = [
        "idf",
        "quantidade",
        "material",
        "descricao",
        "marca",
        "link",
        "notas"
      ];

      const selected = columns[index];
      if (!selected) return;

      if (sortColumn === selected) {
        sortAsc = !sortAsc;
      } else {
        sortColumn = selected;
        sortAsc = true;
      }

      renderTable();
    });
  });

  /* =====================
     RENDER
  ===================== */
  function renderTable(data = stock) {
    tbody.innerHTML = "";

    let finalData = sortData(data);

    if (finalData.length === 0) {
      tbody.innerHTML =
        `<tr><td colspan="8">Nenhum resultado encontrado</td></tr>`;
      return;
    }

    finalData.forEach((item, i) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.idf || ""}</td>
        <td>${item.quantidade}</td>
        <td>${item.material}</td>
        <td>${item.descricao}</td>
        <td>${item.marca}</td>
        <td>${item.link ? `<a href="${item.link}" target="_blank">Link</a>` : ""}</td>
        <td>${item.notas}</td>
        <td>
          <button onclick="changeQty(${i}, 1)">➕</button>
          <button onclick="changeQty(${i}, -1)">➖</button>
          <button onclick="editItem(${i})">✏️</button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  renderTable();

  /* =====================
     PESQUISA
  ===================== */
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    renderTable(
      stock.filter(i =>
        String(i.material).toLowerCase().includes(q) ||
        String(i.descricao).toLowerCase().includes(q) ||
        String(i.marca).toLowerCase().includes(q) ||
        String(i.notas).toLowerCase().includes(q)
      )
    );
  });

  /* =====================
     IMPORTAR EXCEL
  ===================== */
  importBtn.replaceWith(importBtn.cloneNode(true));
  importBtn = document.getElementById("importBtn");

  importBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const code = prompt("Código para importar Excel:");
    if (code !== IMPORT_CODE) return alert("❌ Código incorreto.");

    excelInput.value = "";
    excelInput.click();
  });

  excelInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = evt => {
      const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

      stock = rows.map(r => ({
        idf: "",
        quantidade: Number(r["Quantidade"]) || 0,
        material: r["Material"] || "",
        descricao: r["Descrição"] || "",
        marca: r["Marca"] || "",
        link: r["Link"] || "",
        notas: r["Notas"] || ""
      }));

      saveStock();
      renderTable();
    };

    reader.readAsArrayBuffer(file);
  });

  /* =====================
     EXPORTAR EXCEL
  ===================== */
  exportBtn.replaceWith(exportBtn.cloneNode(true));
  exportBtn = document.getElementById("exportBtn");

  exportBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const code = prompt("Código para exportar Excel:");
    if (code !== EXPORT_CODE) return alert("❌ Código incorreto.");

    const ws = XLSX.utils.json_to_sheet(stock);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");
    XLSX.writeFile(wb, "stock.xlsx");
  });

  /* =====================
     ➕ ➖
  ===================== */
  window.changeQty = (index, delta) => {
    stock[index].quantidade += delta;

    history.push({
      data: new Date().toLocaleString("pt-PT"),
      material: stock[index].material,
      tipo: delta > 0 ? "Entrada" : "Saída",
      quantidade: Math.abs(delta),
      stockFinal: stock[index].quantidade
    });

    saveStock();
    saveHistory();
    renderTable();
  };

  /* =====================
     ✏️ EDITAR
  ===================== */
  window.editItem = (index) => {
    const code = prompt("Código para editar:");
    if (code !== EDIT_CODE) return alert("❌ Código incorreto.");

    const item = stock[index];

    item.idf = prompt("IDF:", item.idf) || item.idf;
    item.material = prompt("Material:", item.material) || item.material;
    item.descricao = prompt("Descrição:", item.descricao) || item.descricao;
    item.marca = prompt("Marca:", item.marca) || item.marca;
    item.notas = prompt("Notas:", item.notas) || item.notas;

    saveStock();
    renderTable();
  };

  /* =====================
     DARK MODE
  ===================== */
  darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  /* =====================
     MODAL
  ===================== */
  addItemBtn.addEventListener("click", () => {
    addModal.classList.remove("hidden");
  });

  window.closeAddModal = () => {
    addModal.classList.add("hidden");
  };

  saveNewItemBtn.addEventListener("click", () => {

    if (!newMaterial.value.trim()) {
      alert("❌ O Material é obrigatório.");
      return;
    }

    stock.push({
      idf: newIdf.value.trim(),
      quantidade: Number(newQuantidade.value) || 0,
      material: newMaterial.value.trim(),
      descricao: newDescricao.value.trim(),
      marca: newMarca.value.trim(),
      link: newLink.value.trim(),
      notas: newNotas.value.trim()
    });

    saveStock();
    renderTable();
    closeAddModal();
  });

});
