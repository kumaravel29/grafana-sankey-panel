import _ from 'lodash';
import './lib/jquery.flot.pie';
import $ from 'jquery';
//import './lib/jquery.flot';
import './lib/loader';

export default function link(scope: any, elem: any, attrs: any, ctrl: any) {
  let data;
  const panel = ctrl.panel;
  elem = elem.find('.sankey-panel__chart');
  const $tooltip = $('<div id="tooltip">') as any;

  if ((typeof google === 'undefined') || (typeof google.visualization === 'undefined')) {
    google.charts.load("current", { packages: ["sankey"] });
  }

  ctrl.events.on('render', () => {
    if (panel.legendType === 'Right side') {
      render(false);
      setTimeout(() => {
        render(true);
      }, 50);
    } else {
      render(true);
    }
  });

  function getLegendHeight(panelHeight: any) {
    if (!ctrl.panel.legend.show || ctrl.panel.legendType === 'Right side' || ctrl.panel.legendType === 'On graph') {
      return 20;
    }

    if ((ctrl.panel.legendType === 'Under graph' && ctrl.panel.legend.percentage) || ctrl.panel.legend.values) {
      const breakPoint = parseInt(ctrl.panel.breakPoint, 10) / 100;
      const total = 23 + 20 * data.length;
      return Math.min(total, Math.floor(panelHeight * breakPoint));
    }

    return 0;
  }

  function formatter(label: any, slice: any) {
    const sliceData = slice.data[0][slice.data[0].length - 1];
    let decimal = 2;
    const start = `<div style="font-size:${ctrl.panel.fontSize};text-align:center;padding:2px;">${label}<br/>`;

    if (ctrl.panel.legend.percentageDecimals) {
      decimal = ctrl.panel.legend.percentageDecimals;
    }
    if (ctrl.panel.legend.values && ctrl.panel.legend.percentage) {
      return start + ctrl.formatValue(sliceData) + '<br/>' + slice.percent.toFixed(decimal) + '%</div>';
    } else if (ctrl.panel.legend.values) {
      return start + ctrl.formatValue(sliceData) + '</div>';
    } else if (ctrl.panel.legend.percentage) {
      return start + slice.percent.toFixed(decimal) + '%</div>';
    } else {
      return start + '</div>';
    }
  }

  function noDataPoints() {
    const html = '<div class="datapoints-warning"><span class="small">No data points</span></div>';
    elem.html(html);
  }

  function addSankey() {
    const width = elem.width();
    const height = ctrl.height - getLegendHeight(ctrl.height);

    const size = Math.min(width, height);

    const plotCanvas = $('<div></div>');
    const plotCss = {
      margin: 'auto',
      position: 'relative',
      paddingBottom: 20 + 'px',
      height: size + 'px',
    };

    plotCanvas.css(plotCss);

    const backgroundColor = $('body').css('background-color');

    const options = {
      legend: {
        show: false,
      },
      series: {
        pie: {
          radius: 1,
          innerRadius: 0,
          show: true,
          stroke: {
            color: backgroundColor,
            width: parseFloat(ctrl.panel.strokeWidth).toFixed(1),
          },
          label: {
            show: ctrl.panel.legend.show && ctrl.panel.legendType === 'On graph',
            formatter: formatter,
          },
          highlight: {
            opacity: 0.0,
          },
          combine: {
            threshold: ctrl.panel.combine.threshold,
            label: ctrl.panel.combine.label,
          },
        },
      },
      grid: {
        hoverable: true,
        clickable: false,
      },
    };

    data = ctrl.data;

    for (let i = 0; i < data.length; i++) {
      const series = data[i];

      // if hidden remove points
      if (ctrl.hiddenSeries[series.label]) {
        series.data = {};
      }
    }

    if (panel.legend.sort) {
      if (ctrl.panel.valueName !== panel.legend.sort) {
        panel.legend.sort = ctrl.panel.valueName;
      }
      if (panel.legend.sortDesc === true) {
        data.sort((a: any, b: any) => {
          return b.legendData - a.legendData;
        });
      } else {
        data.sort((a: any, b: any) => {
          return a.legendData - b.legendData;
        });
      }
    }

    elem.html(plotCanvas);


    if (data.length !== 0 && Object.keys(data[0]).length !== 0) {

      var data1 = new google.visualization.DataTable();
      data1.addColumn('string', 'From');
      data1.addColumn('string', 'To');
      data1.addColumn('number', 'Count');
      var jsonObject = {};
      data.forEach(function (element) {
        var labelArray = element.label.split("---");
        for (var i = 0; i < labelArray.length - 1; i++) {
          if (jsonObject.hasOwnProperty(labelArray[i] + "---" + labelArray[i + 1])) {
            let tempValue = jsonObject[labelArray[i] + "---" + labelArray[i + 1]].value;
            jsonObject[labelArray[i] + "---" + labelArray[i + 1]].value = element.data + tempValue;
          } else {
            jsonObject[labelArray[i] + "---" + labelArray[i + 1]] = {
              "source": labelArray[i],
              "target": labelArray[i + 1],
              "value": element.data
            }
          }
        }
      });

      for (var key in jsonObject) {
        data1.addRows([
          [jsonObject[key].source, jsonObject[key].target, jsonObject[key].value]
        ]);
      }

      // Set chart options
      var options1 = {
        width: '100%',
        height: height,
      };

      // Instantiate and draw our sankey, passing in some options.
      var chart = new google.visualization.Sankey(elem['0']);
      chart.draw(data1, options1);

      /*
            // @ts-ignore
            $.plot(plotCanvas, data, options);
            plotCanvas.bind('plothover', (event: any, pos: any, item: any) => {
              if (!item) {
                $tooltip.detach();
                return;
              }
      
              let body;
              const percent = parseFloat(item.series.percent).toFixed(2);
              const formatted = ctrl.formatValue(item.series.data[0][1]);
      
              body = '<div class="sankey-tooltip-small"><div class="sankey-tooltip-time">';
              body += '<div class="sankey-tooltip-value">' + _.escape(item.series.label) + ': ' + formatted;
              body += ' (' + percent + '%)' + '</div>';
              body += '</div></div>';
      
              $tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
            });*/
    }
  }
  function render(incrementRenderCounter: any) {
    if (!ctrl.data) {
      return;
    }

    data = ctrl.data;

    if (0 === ctrl.data.length) {
      noDataPoints();
    } else {
      addSankey();
    }

    if (incrementRenderCounter) {
      ctrl.renderingCompleted();
    }
  }
}
