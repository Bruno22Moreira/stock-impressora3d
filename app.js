document.addEventListener("DOMContentLoaded", () => {

  let stock = JSON.parse(localStorage.getItem("stock")) || [];
  let history = JSON.parse(localStorage.getItem("history")) || [];

  const tbody = document.querySelector("#stockTable tbody");
  const searchInput = document.getElementById("search");
  const excelInput = document.getElementById("excelInput");
  const importBtn = document.getElementById("importBtn");
  const exportBtn = document.getElementById("exportBtn");
  const darkBtn = document.getElementById("darkBtn");

  /* =====================
     GUARDAR
  ===================== */
  const saveStock = () =>
    localStorage.setItem("stock", JSON.stringify(stock));

  const saveHistory = () =>
    localStorage.setItem("history", JSON.stringify(history));

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
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.quantidade}</td>
        <td>${item.material}</td>
        <td>${item.descricao}</td>
        <td>${item.marca}</td>
        <td>${item.compra || ""}</td>
        <td>${item.link || ""}</td>
        <td>${item.notas || ""}</td>
        <td>-</td>
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

    const filtered = stock.filter(item =>
      String(item.material).toLowerCase().includes(q) ||
      String(item.descricao).toLowerCase().includes(q) ||
      String(item.marca).toLowerCase().includes(q) ||
      String(item.notas).toLowerCase().includes(q)
    );

    renderTable(filtered);
  });

  /* =====================
     IMPORTAR EXCEL ✅
  ===================== */
  importBtn.addEventListener("click", () => {
    excelInput.click();
  });

  excelInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      stock = rows.map(r => ({
        quantidade: Number(r["Quantidade"]) || 0,
        material: r["Material"] || "",
        descricao: r["Descrição"] || "",
        marca: r["Marca"] || "",
        compra: r["Compra"] || "",
        link: r["Link"] || "",
        notas: r["Notas"] || ""
      }));

      saveStock();
      renderTable();
    };

    reader.readAsArrayBuffer(file);
  });

  /* =====================
     DARK MODE
  ===================== */
  darkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

});
