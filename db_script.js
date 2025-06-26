
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
}

function highlightTab(element) {
  document.querySelectorAll('.menu-item, .menu-sub-item').forEach(item => item.classList.remove('active'));
  element.classList.add('active');
}

function toggleSubmenu(element) {
  const submenu = element.nextElementSibling;
  submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
}

function showTablesPage() {
  document.getElementById('dashboardPage').style.display = 'none';
  document.getElementById('tablesPage').style.display = 'block';
}

function showDashboardPage() {
  document.getElementById('dashboardPage').style.display = 'block';
  document.getElementById('tablesPage').style.display = 'none';
}
document.getElementById('excelFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Find indexes of "Product" and "Stock Days"
    const headers = rows[0];
    const productIndex = headers.indexOf("Product");
    const stockDaysIndex = headers.indexOf("Stock Days");

    const labels = [];
    const stockValues = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const product = row[productIndex];
      const days = row[stockDaysIndex];

      if (product && typeof days === 'number') {
        labels.push(product.split('_')[0]); // Shorten name
        stockValues.push(days);
      }
    }

    drawChart(labels, stockValues);
  };

  reader.readAsArrayBuffer(file);
});

function drawChart(labels, data) {
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  if (window.stockChart) window.stockChart.destroy(); // Destroy previous chart

  window.stockChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Stock Days',
        data: data,
        backgroundColor: '#60a5fa'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Stock Days by Product'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

