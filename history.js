document.addEventListener("DOMContentLoaded", () => {

  /* =====================
     DARK MODE
  ===================== */
  const darkBtn = document.getElementById("darkBtn");

  // sincronizar com index
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  if (darkBtn) {
    darkBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
      );
      drawChart(); // redesenhar gráfico
    });
  }

  const history = JSON.parse(localStorage.getItem("history")) || [];
  const tbody = document.getElementById("historyTable");

  /* =====================
     TABELA
  ===================== */
  tbody.innerHTML = "";

  if (history.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5">Sem movimentos registados</td>`;
    tbody.appendChild(tr);
  } else {
    history.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.data}</td>
        <td>${item.material}</td>
        <td>${item.tipo}</td>
        <td>${item.quantidade}</td>
        <td>${item.stockFinal}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* =====================
     GRÁFICO
  ===================== */

  function drawChart() {

    const consumoPorMaterial = {};

    history.forEach(item => {
      if (item.tipo === "Saída") {
        consumoPorMaterial[item.material] =
          (consumoPorMaterial[item.material] || 0) + item.quantidade;
      }
    });

    const labels = Object.keys(consumoPorMaterial);
    const values = Object.values(consumoPorMaterial);

    if (labels.length === 0) return;

    const isDark = document.body.classList.contains("dark");

    const colors = labels.map((_, i) => {
      const hue = (i * 60) % 360;
      return isDark
        ? `hsl(${hue}, 70%, 45%)`
        : `hsl(${hue}, 70%, 55%)`;
    });

    const ctx = document.getElementById("usageChart").getContext("2d");

    if (window.usageChartInstance) {
      window.usageChartInstance.destroy();
    }

    window.usageChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: isDark ? "#e5e7eb" : "#333",
          borderWidth: 1,
          maxBarThickness: 28,
          categoryPercentage: 0.55,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(...values) * 1.3,
            ticks: {
              color: isDark ? "#e5e7eb" : "#111"
            },
            grid: {
              color: isDark ? "#374151" : "#e5e7eb"
            }
          },
          x: {
            ticks: {
              color: isDark ? "#e5e7eb" : "#111"
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  drawChart();

});