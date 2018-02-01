'use strict';

System.register(['lodash', 'jquery'], function (_export, _context) {
  "use strict";

  var _, $;

  function link(scope, elem, attrs, ctrl) {
    var data, panel;
    elem = elem.find('.sankey-panel');
    var $tooltip = $('<div id="tooltip">');

    if (typeof google === 'undefined' || typeof google.visualization === 'undefined') {
      google.charts.load("current", { packages: ["sankey"] });
    }

    ctrl.events.on('render', function () {
      render(false);
      if (panel.legendType === 'Right side') {
        setTimeout(function () {
          render(true);
        }, 50);
      }
    });

    function getLegendHeight(panelHeight) {
      $('.graph-legend').css('padding-top', 6);
      if (!ctrl.panel.legend.show || ctrl.panel.legendType === 'Right side' /*|| ctrl.panel.legendType === 'On graph'*/) {
          return 0;
        }

      if (ctrl.panel.legend.percentage || ctrl.panel.legend.values) {
        var total = 25 + 21 * data.length;
        return Math.min(total, Math.floor(panelHeight / 2));
      }

      return 27;
    }

    function setElementHeight() {
      try {
        var height = ctrl.height - getLegendHeight(ctrl.height);
        elem.css('height', height + 'px');

        return true;
      } catch (e) {
        // IE throws errors sometimes
        console.log(e);
        return false;
      }
    }

    function formatter(label, slice) {
      var slice_data = slice.data[0][slice.data[0].length - 1];
      var decimal = 2;
      var start = "<div style='font-size:" + ctrl.panel.fontSize + ";text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>";

      if (ctrl.panel.legend.percentageDecimals) {
        decimal = ctrl.panel.legend.percentageDecimals;
      }
      if (ctrl.panel.legend.values && ctrl.panel.legend.percentage) {
        return start + ctrl.formatValue(slice_data) + "<br/>" + slice.percent.toFixed(decimal) + "%</div>";
      } else if (ctrl.panel.legend.values) {
        return start + ctrl.formatValue(slice_data) + "</div>";
      } else if (ctrl.panel.legend.percentage) {
        return start + slice.percent.toFixed(decimal) + "%</div>";
      } else {
        return start + '</div>';
      }
    }

    function noDataPoints() {
      var html = '<div class="datapoints-warning"><span class="small">No data points</span></div>';
      elem.html(html);
    }

    function addSankey() {

      var width = elem.width();
      var height = elem.height();
      var size = Math.min(width, height);

      var plotCanvas = $('<div></div>');
      var plotCss = {
        top: '10px',
        margin: 'auto',
        position: 'relative',
        height: size - 20 + 'px'
      };

      plotCanvas.css(plotCss);

      var backgroundColor = $('body').css('background-color');

      data = ctrl.data;

      for (var i = 0; i < data.length; i++) {
        var series = data[i];

        // if hidden remove points and disable stack
        if (ctrl.hiddenSeries[series.label]) {
          series.data = {};
          series.stack = false;
        }
      }

      if (panel.legend.sort) {
        if (panel.legend.sortDesc === true) {
          data.sort(function (a, b) {
            return b.data - a.data;
          });
        } else {
          data.sort(function (a, b) {
            return a.data - b.data;
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
              var tempValue = jsonObject[labelArray[i] + "---" + labelArray[i + 1]].value;
              jsonObject[labelArray[i] + "---" + labelArray[i + 1]].value = element.data + tempValue;
            } else {
              jsonObject[labelArray[i] + "---" + labelArray[i + 1]] = {
                "source": labelArray[i],
                "target": labelArray[i + 1],
                "value": element.data
              };
            }
          }
        });

        for (var key in jsonObject) {
          data1.addRows([[jsonObject[key].source, jsonObject[key].target, jsonObject[key].value]]);
        }

        // Set chart options
        var options = {
          width: '100%',
          height: height
        };

        // Instantiate and draw our sankey, passing in some options.
        var chart = new google.visualization.Sankey(elem['0']);
        chart.draw(data1, options);
      }
    }

    function render(incrementRenderCounter) {
      if (!ctrl.data) {
        return;
      }

      data = ctrl.data;
      panel = ctrl.panel;

      if (setElementHeight()) {
        //console.log("ctrl.data.length - "+ctrl.data.length);
        if (0 == ctrl.data.length) {
          noDataPoints();
        } else {
          addSankey();
        }
      }
      if (incrementRenderCounter) {
        ctrl.renderingCompleted();
      }
    }
  }

  _export('default', link);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=rendering.js.map
