import _ from 'lodash';
import './lib/jquery.flot.pie';
import $ from 'jquery';
//import * as google from './lib/loader';

google.charts.load('current', { packages: ['sankey'] });

export default function link(scope: any, elem: any, attrs: any, ctrl: any) {
  let data;
  const panel = ctrl.panel;
  elem = elem.find('.sankey-panel__chart');
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

  function noDataPoints() {
    const html = '<div class="datapoints-warning"><span class="small">No data points</span></div>';
    elem.html(html);
  }

  function rgb2hex(rgb: any) {
    rgb = rgb.match(/^rgb?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (
      '#' +
      ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) +
      ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2) +
      ('0' + parseInt(rgb[3], 10).toString(16)).slice(-2)
    );
  }

  function addSankey() {
    const width = elem.width();
    const height = ctrl.height - getLegendHeight(ctrl.height);

    const size = Math.min(width, height);

    let backgroundColor = rgb2hex($('body').css('background-color'));
    if (backgroundColor.startsWith('#f') || backgroundColor.startsWith('#e')) {
      backgroundColor = '#000000';
    } else {
      backgroundColor = '#ffffff';
    }

    const sankeyFont = $('body').css('font-size');

    const plotCanvas = $('<div></div>');
    const plotCss = {
      margin: 'auto',
      position: 'relative',
      paddingBottom: 20 + 'px',
      height: size + 'px',
    };

    // Set chart options
    const options = {
      width: '100%',
      height: height + 'px',
      sankey: {
        node: {
          label: {
            fontName: 'Times-Roman',
            fontSize: sankeyFont,
            color: backgroundColor,
            bold: true,
            italic: true,
          },
        },
      },
    };

    plotCanvas.css(plotCss);

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
    let jsonObject: any;
    let labelArray: any;
    let sankeyData: any;
    let tempValue: any;
    let chart: any;
    if (data.length !== 0 && Object.keys(data[0]).length !== 0) {
      sankeyData = new google.visualization.DataTable();
      sankeyData.addColumn('string', 'From');
      sankeyData.addColumn('string', 'To');
      sankeyData.addColumn('number', 'Count');

      if (data[0].label === 'A-series') {
        console.log('Adding sample data suitable for Sankey diagram representation');
        sankeyData.addRows([['AppA', 'Activity2', 10]]);
        sankeyData.addRows([['AppB', 'Activity1', 10]]);
        sankeyData.addRows([['AppB', 'Activity2', 5]]);
        sankeyData.addRows([['Activity1', 'Scope1', 6]]);
        sankeyData.addRows([['Activity2', 'Scope1', 7]]);
        sankeyData.addRows([['Activity1', 'Scope2', 8]]);
        sankeyData.addRows([['Activity2', 'Scope2', 2]]);
      } else {
        jsonObject = {};
        data.forEach((element: any) => {
          labelArray = element.label.split('---');
          for (let i = 0; i < labelArray.length - 1; i++) {
            if (jsonObject.hasOwnProperty(labelArray[i] + '---' + labelArray[i + 1])) {
              tempValue = jsonObject[labelArray[i] + '---' + labelArray[i + 1]].value;
              jsonObject[labelArray[i] + '---' + labelArray[i + 1]].value = element.data + tempValue;
            } else {
              jsonObject[labelArray[i] + '---' + labelArray[i + 1]] = {
                source: labelArray[i],
                target: labelArray[i + 1],
                value: element.data,
              };
            }
          }
        });
        for (const key in jsonObject) {
          sankeyData.addRows([[jsonObject[key].source, jsonObject[key].target, jsonObject[key].value]]);
        }
      }
      
      // @ts-ignore
      chart = new google.visualization.Sankey(elem['0']);
      chart.draw(sankeyData, options);
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
