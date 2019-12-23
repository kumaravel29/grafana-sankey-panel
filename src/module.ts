import { sankeyCtrl } from './sankey_ctrl';
import { loadPluginCss } from 'grafana/app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/grafana-sankey-panel/styles/dark.css',
  light: 'plugins/grafana-sankey-panel/styles/light.css',
});

export { sankeyCtrl as PanelCtrl };
