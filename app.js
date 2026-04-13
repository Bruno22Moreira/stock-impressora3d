document.addEventListener("DOMContentLoaded", () => {

  let stock = JSON.parse(localStorage.getItem("stock")) || [];
  let history = JSON.parse(localStorage.getItem("history")) || [];

  const tbody = document.querySelector("#stockTable tbody");
  const searchInput = document.getElementById("search");
  const excelInput = document.getElementById("excelInput");
  const importBtn = document.getElementById("importBtn");
  const exportBtn = document.getElementById("exportBtn");
  const darkBtn = document.getElementById("darkBtn");

  const saveStock = () =>
    localStorage.setItem("stock", JSON.stringify(stock));

  const saveHistory = () =>
    localStorage.setItem("history", JSON.stringify(history));

  // Converter datas do Excel
  const excelDateToJS = (serial) => {
    if (typeof serial !== "number") return serial || "";
    const utcDays = Math.floor(serial - 25569);
    return new Date(utcDays * 86400 * 1000).toLocaleDateString("pt-PT");
  };

  /* =====================
     RENDER
  ===================== */
  function renderTable(data = stock) {
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8">Nenhum resultado encontrado</td></tr>`;
      return;
    }

    data.forEach((item, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.quantidade}</td>
        <td>${item.material}</td>
        <td>${item.descricao}</td>
        <td>${item.marca}</td>
        <td><a href="${item.link}" target="_blank">Link</a></td>
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
     IMPORTAR EXCEL ✅
  ===================== */
  importBtn.onclick = () => excelInput.click();

  excelInput.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = evt => {
      const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

      stock = rows.map(r => ({
        quantidade: Number(r["Quantidade"]) || 0,
        material: r["Material"] || "",
        descricao: r["Descrição"] || "",
        marca: r["Marca"] || "",
        compra: excelDateToJS(r["Compra"]),
        link: r["Link"] || "",
        notas: r["Notas"] || ""
      }));

      saveStock();
      renderTable();
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  };

  /* =====================
     EXPORTAR EXCEL ✅
  ===================== */
  exportBtn.onclick = () => {
    const ws = XLSX.utils.json_to_sheet(stock);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");
    XLSX.writeFile(wb, "stock.xlsx");
  };

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
     ✏️ EDITAR (com password simples)
  ===================== */
  window.editItem = (index) => {
    const code = prompt("Código para editar:");
    if (code !== "2222") return alert("Código errado");

    const item = stock[index];
    item.material = prompt("Material:", item.material);
    item.descricao = prompt("Descrição:", item.descricao);
    item.marca = prompt("Marca:", item.marca);
    item.notas = prompt("Notas:", item.notas);

    saveStock();
    renderTable();
  };

  /* =====================
     DARK MODE
  ===================== */
  darkBtn.onclick = () =>
    document.body.classList.toggle("dark");

});
