/**
 * ---------------------------------------
 * This demo was created using amCharts 4.
 * 
 * For more information visit:
 * https://www.amcharts.com/
 * 
 * Documentation is available at:
 * https://www.amcharts.com/docs/v4/
 * ---------------------------------------
 */

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

var chart = am4core.create("chartdiv", am4charts.XYChart);

var data = [];
var open = 100;
var close = 120;

var names = [
  "2010",
  "2011",
  "2012",
];

var open = [
  100000000,
  120000000,
  110000000,
];

var close = [
  150000000,
  130000000,
  170000000,
]

for (var i = 0; i < names.length; i++) {
  // open += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 5);
  // close = open + Math.round(Math.random() * 10) + 3;
  data.push({ category: names[i], open: open[i], close: close[i] });
}

chart.data = data;
var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.minGridDistance = 15;
categoryAxis.renderer.grid.template.location = 0.5;
categoryAxis.renderer.grid.template.strokeDasharray = "1,3";
categoryAxis.renderer.labels.template.rotation = -90;
categoryAxis.renderer.labels.template.horizontalCenter = "left";
categoryAxis.renderer.labels.template.location = 0.5;
categoryAxis.renderer.inside = true;

categoryAxis.renderer.labels.template.adapter.add("dx", function(dx, target) {
    return -target.maxRight / 2;
})

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;
valueAxis.renderer.ticks.template.disabled = true;
valueAxis.renderer.axisFills.template.disabled = true;

var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.categoryX = "category";
series.dataFields.openValueY = "open";
series.dataFields.valueY = "close";
series.tooltipText = "Minimum: {openValueY.value} Maximum: {valueY.value}";
series.sequencedInterpolation = true;
series.fillOpacity = 0;
series.strokeOpacity = 1;
series.columns.template.width = 0.01;
series.tooltip.pointerOrientation = "horizontal";

var openBullet = series.bullets.create(am4charts.CircleBullet);
openBullet.locationY = 1;

var closeBullet = series.bullets.create(am4charts.CircleBullet);

closeBullet.fill = chart.colors.getIndex(4);
closeBullet.stroke = closeBullet.fill;

chart.cursor = new am4charts.XYCursor();

chart.scrollbarX = new am4core.Scrollbar();
chart.scrollbarY = new am4core.Scrollbar();
