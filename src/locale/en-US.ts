import localeMessageBox from '@/components/message-box/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';

import localeWorkplace from '@/views/dashboard/workplace/locale/en-US';

import localeSettings from './en-US/settings';

export default {
  'twelvet': 'twelvet',
  'TwelveT': 'TwelveT',
  'menu.dashboard': 'dashboard',

  'menu.system': 'system',
  'menu.system.index': 'index',
  'menu.system.menu': 'menu',
  'menu.system.dictionaries': 'dictionaries',
  'menu.system.client': 'client',
  'menu.system.dfs': 'dfs',

  'menu.monitor': 'System Monitor',
  'menu.monitor.redis': 'The cache monitor',
  'menu.monitor.job': 'Crontab',

  'menu.human': 'Manpower Management',
  'menu.human.staff': 'Personnel Admin',
  'menu.human.role': 'Role Management',
  'menu.human.dept': 'Department Admin',
  'menu.human.post': 'Position Management',

  'menu.log': 'Log Management',
  'menu.log.operation': 'ULog',
  'menu.log.login': 'ConLog',
  'menu.log.job': 'Scheduled Task Logs',

  'menu.tool': 'ToolBox',
  'menu.tool.gen': 'FireAsp Creator',
  'menu.tool.graphicalEditor': 'Graphical editor',
  'menu.tool.graphicalEditor.flow': 'Process editor',
  'menu.tool.graphicalEditor.koni': 'Topology editor',
  'menu.tool.graphicalEditor.mind': 'Brain map editor',

  'menu.user': 'User Center',
  'navbar.docs': 'Docs',
  'navbar.action.locale': 'Switch to English',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,
};
