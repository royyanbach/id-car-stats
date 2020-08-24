import Papa from 'papaparse';

const isProduction = process.env.NODE_ENV === 'production';

am4core.useTheme(am4themes_animated);
const chart = am4core.create('chartdiv', am4charts.XYChart);

const table = document.querySelector('#table');
const dataTableOpts = {
  data: {
    headings: [
      'Year',
      'Price',
      'Source',
    ],
  },
};

// https://github.com/fiduswriter/Simple-DataTables
global.dataTable = new simpleDatatables.DataTable(table, dataTableOpts);

const formatter = new Intl.NumberFormat('id-ID',{ style: 'currency', currency: 'IDR' })

let csvData = [];

const valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
global.valueAxisX = valueAxisX;
valueAxisX.renderer.ticks.template.disabled = true;
valueAxisX.renderer.axisFills.template.disabled = true;
valueAxisX.numberFormatter = new am4core.NumberFormatter();
valueAxisX.numberFormatter.numberFormat = '#';

const valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
valueAxisY.renderer.ticks.template.disabled = true;
valueAxisY.renderer.axisFills.template.disabled = true;

const series = chart.series.push(new am4charts.LineSeries());
series.dataFields.valueX = 'x';
series.dataFields.valueY = 'y';
series.dataFields.value = 'value';
series.dataFields.model = 'model';
series.strokeOpacity = 0;
series.sequencedInterpolation = true;
series.tooltip.pointerOrientation = 'vertical';

const bullet = series.bullets.push(new am4core.Circle());
bullet.fill = am4core.color('#7497d6');
bullet.propertyFields.fill = 'color';
bullet.strokeOpacity = 0;
bullet.strokeWidth = 2;
bullet.fillOpacity = 0.5;
bullet.stroke = am4core.color('#ffffff');
bullet.hiddenState.properties.opacity = 0;
bullet.tooltipText = '[bold]{model}[/]:\nYear: {valueX.value}\nPrice: {valueY.value}\nFound Item: {value.value}';

const outline = chart.plotContainer.createChild(am4core.Circle);
outline.fillOpacity = 0;
outline.strokeOpacity = 0.8;
outline.stroke = am4core.color('#7497d6');
outline.strokeWidth = 2;
outline.hide(0);

const blurFilter = new am4core.BlurFilter();
outline.filters.push(blurFilter);

bullet.events.on('over', function(event) {
  const target = event.target;
  // console.log(target.pixelRadius);
  outline.radius = target.pixelRadius + 2;
  outline.x = target.pixelX;
  outline.y = target.pixelY;
  outline.show();
})

bullet.events.on('out', function(event) {
  outline.hide();
})

valueAxisX.events.on('startendchanged', function(e) {
  console.log(e.target)
})

const hoverState = bullet.states.create('hover');
hoverState.properties.fillOpacity = 1;
hoverState.properties.strokeOpacity = 1;

series.heatRules.push({ target: bullet, min: 4, max: 60, property: 'radius' });

bullet.adapter.add('tooltipY', function (tooltipY, target) {
  return -target.radius;
})

chart.cursor = new am4charts.XYCursor();
chart.cursor.behavior = 'zoomXY';
chart.cursor.snapToSeries = series;

chart.scrollbarX = new am4core.Scrollbar();
chart.scrollbarY = new am4core.Scrollbar();

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

function generateModel(brand = 'mazda') {
  fetchFile(`${host}/sources/${brand}.csv`).then(csvObj => {
    let models = [];
    csvObj.data.forEach(item => {
      if (item.Name && !models.includes(item.Name)) {
        models.push(item.Name);
      }
    });
    models.sort();
    
    const modelSelect = document.querySelector('#model');
    modelSelect.querySelectorAll('option:not(:disabled)').forEach(el => el.remove());

    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.text = model;
      option.className = 'dynamic-model';
      modelSelect.appendChild(option);
    })
  
    csvData = csvObj.data;
  });
}

document.querySelector('#brand').addEventListener('change', (e) => {
  generateModel(e.target.value);
});

document.querySelector('#model').addEventListener('change', () => {
  let formattedChartObj = {};
  let formattedTableArr = [];

  const modelSelector = document.querySelector('#model');
  const selectedModel = modelSelector.options[modelSelector.selectedIndex];
  for (let idx = 0; idx < csvData.length; idx++) {
    const item = csvData[idx];

    if (item.Name !== modelSelector.value) {
      continue;
    }

    const itemPrice = parseInt(item.Price, 10);

    formattedTableArr.push([
      item.Year,
      formatter.format(itemPrice),
      item.URL,
    ])
  
    if (!formattedChartObj[`${item.Year}${itemPrice}`]) {
      formattedChartObj[`${item.Year}${itemPrice}`] = {
        value: 1,
        x: item.Year,
        y: itemPrice,
        model: selectedModel.innerText,
      };

      continue;
    } else {
      formattedChartObj[`${item.Year}${itemPrice}`]['value']++;
    }
  }

  let formattedChartData = [];
  for (const idx in formattedChartObj) {
    formattedChartData.push(formattedChartObj[idx])
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
