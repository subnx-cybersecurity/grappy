document.addEventListener('DOMContentLoaded', function () {
  const savedData = localStorage.getItem('excelData');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    drawChart(parsedData.labels, parsedData.stockValues);
  }
});

document.getElementById('combFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headers = rows[0];
    const productIndex = headers.indexOf("Product");
    const stockDaysIndex = headers.indexOf("Total Stock");

    if (productIndex === -1 || stockDaysIndex === -1) {
      alert("Excel file must contain 'Product' and 'Stock Days' columns.");
      return;
    }

    const labels = [];
    const stockValues = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const product = row[productIndex];
      const days = row[stockDaysIndex];

      if (product && !isNaN(days)) {
        labels.push(product.split('_')[0]);
        stockValues.push(Number(days));
      }
    }

    const excelData = { labels, stockValues };
    localStorage.setItem('excelData', JSON.stringify(excelData));

    drawChart(labels, stockValues);
  };

  reader.readAsArrayBuffer(file);
});

function drawChart(labels, data) {
  const ctx = document.getElementById('chartCanvas').getContext('2d');

  // Destroy old chart if exists
  if (window.stockChart) {
    window.stockChart.destroy();
  }

  // Make sure canvas is visible
  document.getElementById('chartCanvas').style.display = 'block';

  window.stockChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Stock',
        data: data,
        backgroundColor: '#60a5fa'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Total Stock by Product'
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            // text: 'Product Name'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            // text: 'Total Stock'
          }
        }
      }
    }
  });
}
