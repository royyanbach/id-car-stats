import Papa from 'papaparse';

const isProduction = process.env.NODE_ENV === 'production';

am4core.useTheme(am4themes_animated);
const chart = am4core.create("chartdiv", am4charts.XYChart);

const table = document.querySelector('#table');
const dataTableOpts = {
  data: {
    headings: [
      'Tahun',
      'Harga',
      'Link',
    ],
  },
};

// https://github.com/fiduswriter/Simple-DataTables
let dataTable = new simpleDatatables.DataTable(table, dataTableOpts);

const formatter = new Intl.NumberFormat('id-ID',{ style: 'currency', currency: 'IDR' })

let csvData = [];

let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.minGridDistance = 15;
categoryAxis.renderer.grid.template.location = 0.5;
categoryAxis.renderer.grid.template.strokeDasharray = "1,3";
categoryAxis.renderer.labels.template.rotation = -90;
categoryAxis.renderer.labels.template.horizontalCenter = "left";
categoryAxis.renderer.labels.template.location = 0.5;
// categoryAxis.renderer.inside = true;

categoryAxis.renderer.labels.template.adapter.add("dx", function(dx, target) {
    return -target.maxRight / 2;
})

let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;
valueAxis.renderer.ticks.template.disabled = true;
valueAxis.renderer.axisFills.template.disabled = true;

let series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.categoryX = "category";
series.dataFields.openValueY = "open";
series.dataFields.valueY = "close";
series.tooltipText = "Minimum: {openValueY.value} Maximum: {valueY.value}";
series.sequencedInterpolation = true;
series.fillOpacity = 0;
series.strokeOpacity = 1;
series.columns.template.width = 0.01;
series.tooltip.pointerOrientation = "horizontal";

let openBullet = series.bullets.create(am4charts.CircleBullet);
openBullet.locationY = 1;

let closeBullet = series.bullets.create(am4charts.CircleBullet);

closeBullet.fill = chart.colors.getIndex(4);
closeBullet.stroke = closeBullet.fill;

chart.cursor = new am4charts.XYCursor();

// chart.scrollbarX = new am4core.Scrollbar();
// chart.scrollbarY = new am4core.Scrollbar();

const host = isProduction ? 'https://royyanbach.github.io/id-car-stats' : '';

function fetchFile(url = '/sources/mazda.csv') {
  return fetch(url)
    .then(data => data.text())
    .then(data => {
      return Papa.parse(data, {
        // worker: true,
        header: true,
      });
    })
}

fetchFile(`${host}/sources/mazda.csv`).then(csvObj => {
  let models = [];
  csvObj.data.forEach(item => {
    if (item.Name && !models.includes(item.Name)) {
      models.push(item.Name);
    }
  });
  models.sort();
  
  const modelSelect = document.querySelector('#model');
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.text = model;
    option.className = 'dynamic-model'
    modelSelect.appendChild(option);
  })

  csvData = csvObj.data;
});

document.querySelector('#model').addEventListener('change', () => {
  let formattedChartObj = {};
  let formattedTableArr = [];

  const selectedModel = document.querySelector('#model').value;
  for (let idx = 0; idx < csvData.length; idx++) {
    const item = csvData[idx];

    if (item.Name !== selectedModel) {
      continue;
    }

    const itemPrice = parseInt(item.Price, 10);

    formattedTableArr.push([
      item.Year,
      formatter.format(itemPrice),
      item.URL,
    ])
  
    if (!formattedChartObj[item.Year]) {
      formattedChartObj[item.Year] = {
        category: item.Year,
        open: itemPrice,
        close: itemPrice,
      };

      continue;
    }

    const chartItem = formattedChartObj[item.Year];
    chartItem.open = itemPrice < chartItem.open ? itemPrice : chartItem.open;
    chartItem.close = itemPrice > chartItem.close ? itemPrice : chartItem.close;
  }

  let formattedChartData = [];
  for (const year in formattedChartObj) {
    formattedChartData.push(formattedChartObj[year])
  }

  chart.data = formattedChartData;
  dataTable.destroy();
  dataTable.init({
    data: {
      headings: dataTableOpts.data.headings,
      data: formattedTableArr,
    }
  });
  dataTable.columns().sort(0);
});
