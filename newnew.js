document.addEventListener('DOMContentLoaded', function () {
  const savedData = localStorage.getItem('excelData');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    drawChart(parsedData.labels, parsedData.values, parsedData.extraData);
  }
});

document.getElementById('excelFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const labels = [];
    const values = [];
    const extraData = [];

    jsonData.forEach(row => {
      labels.push(row['Product'] || row['Product Name']);  // Adjust header as per your Excel
      values.push(row['Value'] || row['Stock Days']);      // Bar height: either 'Value' or 'Stock Days'
      extraData.push({
        color: row['Color'] || 'N/A',
        stockDays: row['Stock Days'] || row['Value'] || 0
      });
    });

    const excelData = { labels, values, extraData };
    localStorage.setItem('excelData', JSON.stringify(excelData));
    drawChart(labels, values, extraData);
  };

  reader.readAsArrayBuffer(file);
});

function drawChart(labels, values, extraData) {
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  if (window.stockChart) window.stockChart.destroy();

  const trimmedLabels = labels.map(label =>
    label.length > 9 ? label.substring(0, 9) + '...' : label
  );

  window.stockChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels.map(label => label.length > 9 ? label.slice(0, 9) + '...' : label),
         datasets: [{
        label: 'Stock Days',
        data: values,
        backgroundColor: '#60a5fa'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const index = context.dataIndex;
              const product = labels[index];
              const color = extraData[index].color;
              const stockDays = extraData[index].stockDays;
              const value = values[index];

              return [
                `Color: ${color}`,
                `Stock Days: ${stockDays}`,
              ];
            }
          }
        },
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
