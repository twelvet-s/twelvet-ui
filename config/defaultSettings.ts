import { Settings as LayoutSettings } from '@ant-design/pro-components';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'TwelveT',
  pwa: false,
  splitMenus: false,
  logo: "/logo.svg",
  iconfontUrl: "/assets/js/icon.js",
};

export default Settings;
